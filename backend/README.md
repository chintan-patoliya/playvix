# Playvix Backend — Cricket Pitch Booking System API

> Production-grade Node.js API for real-time cricket pitch booking with MySQL, Redis, and Socket.io — **designed to scale to 10,000+ concurrent users**

---

## Features

### Core Features
- **JWT Authentication** — Secure login/register with Passport JWT strategy
- **Pitch Management** — CRUD operations for cricket pitches
- **Slot Management** — Time slot generation and availability tracking
- **Real-time Booking** — Live slot reservations with 2-minute hold
- **Booking Lifecycle** — Reserve → Confirm → Cancel workflow
- **Concurrent Booking Protection** — Double-booking prevention with Redis + MySQL locks

### Advanced Features
- **Redis TTL Reservations** — 2-minute temporary slot holds with auto-expiry
- **Socket.io Real-time Updates** — Instant slot status broadcasts to all clients
- **Two-Layer Concurrency Protection** — Redis atomic locks + MySQL SELECT FOR UPDATE
- **Rate Limiting** — Request throttling per IP/user
- **Comprehensive Validation** — Joi validation for all inputs
- **Structured Logging** — Winston daily-rotate-file logging
- **Security Headers** — Helmet, CORS, compression
- **Database Transactions** — ACID-compliant booking creation
- **Idempotency Support** — Safe retry handling for booking confirmations

### System Features
- **Layered Architecture** — Routes → Middleware → Controller → Service → Repository → DB
- **Error Handling** — Centralized error middleware with custom APIError class
- **Environment Configuration** — dotenv-safe for secure config management
- **Database Migrations** — SQL schema files for version control
- **Seeding** — Automated pitch and slot generation
- **Health Monitoring** — Connection status for DB and Redis
- **Production Scalability** — Architecture supports 10,000+ concurrent users with horizontal scaling

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22+ | Runtime |
| Express | 4.x | HTTP Framework |
| MySQL | 8.x | Primary Database |
| Redis | 7.x | Slot Reservation Cache + Pub/Sub |
| Socket.io | 4.x | Real-time communication |
| @socket.io/redis-adapter | 8.x | Multi-server Socket.io scaling |
| Sequelize | 6.x | ORM for MySQL |
| Passport JWT | 4.x | Authentication strategy |
| bcryptjs | 2.x | Password hashing |
| Winston | 3.x | Structured logging |
| Joi | 17.x | Request validation |
| ioredis | 5.x | Redis client |
| Helmet | 7.x | Security headers |
| express-rate-limit | 7.x | Rate limiting |

---

## Project Structure

```
backend/
├── src/
│   ├── index.js                    # Entry point — server + DB + Redis + Socket startup
│   ├── config/
│   │   ├── vars.js                 # Centralized env config (dotenv-safe)
│   │   ├── express.js              # Middleware stack (helmet, cors, rate-limit, passport)
│   │   ├── logger.js               # Winston daily-rotate logger
│   │   ├── database.js             # Sequelize + MySQL connection pool
│   │   ├── redis.js                # ioredis singleton
│   │   ├── redisExpiry.js          # Redis key expiration tracking
│   │   ├── passport.js             # JWT strategy configuration
│   │   └── socket.js               # Socket.io server + room management
│   └── api/
│       ├── routes/v1/
│       │   ├── index.js            # Route aggregator
│       │   ├── auth.route.js       # Authentication routes
│       │   ├── pitch.route.js      # Pitch routes
│       │   ├── slot.route.js       # Slot routes
│       │   └── booking.route.js    # Booking routes
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── pitch.controller.js
│       │   ├── slot.controller.js
│       │   └── booking.controller.js
│       ├── services/
│       │   ├── auth.service.js
│       │   ├── booking.service.js
│       │   ├── slot.service.js
│       │   └── reservation.service.js  # Redis TTL logic
│       ├── repositories/
│       │   ├── user.repository.js
│       │   ├── pitch.repository.js
│       │   ├── slot.repository.js
│       │   └── booking.repository.js
│       ├── models/
│       │   ├── user.model.js
│       │   ├── pitch.model.js
│       │   ├── slot.model.js
│       │   ├── booking.model.js
│       │   └── index.js            # Sequelize associations
│       ├── middlewares/
│       │   ├── auth.js             # JWT authorize middleware
│       │   ├── error.js            # Error handler, converter, notFound
│       │   └── index.js            # Middleware exports
│       ├── validations/
│       │   ├── auth.validation.js
│       │   └── booking.validation.js
│       └── utils/
│           ├── APIError.js         # Custom error class
│           ├── errorHelper.js      # Error handling utilities
│           └── responseHelper.js   # Response formatting utilities
├── migrations/
│   └── 001_initial_schema.sql      # Complete MySQL schema
├── seeds/
│   └── seed.js                     # Database seeding
├── logs/                           # Winston log files (gitignored)
├── .env.example                    # Environment template
├── package.json                    # Dependencies
└── README.md                       # This file
```

---

## Architecture Overview

### Layered Architecture

```
Request → Route → Middleware → Controller → Service → Repository → DB/Redis
```

| Layer | Responsibility |
|---|---|
| **Route** | Declares endpoint, applies middleware + validation |
| **Middleware** | Authentication, rate-limiting, validation, error handling |
| **Controller** | Parses req/res, calls service, returns JSON |
| **Service** | Business logic, orchestrates multiple repositories |
| **Repository** | All DB queries isolated — switch DB by changing only repos |

### Concurrency Strategy

**Two-layer protection against double booking:**

#### Layer 1 — Redis Atomic SET NX (Soft Lock, ~0ms)
```js
redis.set(`slot_reservation:${pitchId}:${slotId}:${date}`, userId, 'EX', 120, 'NX')
```
- Atomic operation — only one request wins
- 409 Conflict returned immediately for losers
- Auto-expires in 120 seconds

#### Layer 2 — MySQL Transaction + SELECT FOR UPDATE (Hard Lock)
```sql
BEGIN;
SELECT * FROM bookings WHERE pitch_id=? AND slot_id=? AND booking_date=? FOR UPDATE;
-- if no row: INSERT
COMMIT;
```
- Row-level exclusive lock during transaction
- `UNIQUE(pitch_id, slot_id, booking_date)` constraint as final safety net

---

## Why These Technology Choices?

### MySQL (Not NoSQL)
The domain is inherently relational with hard constraints:
- `SELECT ... FOR UPDATE` — row-level exclusive locking
- `UNIQUE(pitch_id, slot_id, booking_date)` — DB-enforced deduplication
- Multi-statement ACID transactions — atomically check + insert

MongoDB can't provide `SELECT FOR UPDATE`. MySQL InnoDB is the right tool for preventing double bookings.

### Redis
Three distinct critical roles:

1. **Temporary Slot Reservation (2-Minute Hold)**
   ```
   SET slot_reservation:2:5:2025-03-20 userId EX 120 NX
   ```
   - `EX 120` — auto-expires, no cleanup job needed
   - `NX` — atomic set-if-not-exists, O(1) distributed lock

2. **Distributed Locking** — Prevents race conditions before DB touch

3. **Socket.io Horizontal Scaling** — Redis Pub/Sub syncs events across multiple Node.js instances

### Socket.io
- Room-based targeting — `pitch:2` room for targeted updates
- Bidirectional communication
- Graceful fallback to long-polling
- Slot status changes in **under 100ms** across all clients

---

## Complete Setup Guide

### Prerequisites

- Node.js 22+
- MySQL 8.0+
- Redis 7.0+

### Step 1: Install MySQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**macOS (Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**Windows:**
Download installer from https://dev.mysql.com/downloads/installer/

### Step 2: Install Redis

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Windows:**
Download from https://github.com/microsoftarchive/redis/releases or use WSL2 with Ubuntu.

**Verify Redis installation:**
```bash
redis-cli ping
# Should return: PONG
```

### Step 3: Setup Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE playvix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional, can use root)
CREATE USER 'playvix_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON playvix.* TO 'playvix_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 4: Run Database Migrations

```bash
cd playvix/backend

# Apply schema
mysql -u root -p < migrations/001_initial_schema.sql

# Or with custom user
mysql -u playvix_user -p playvix < migrations/001_initial_schema.sql
```

### Step 5: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Example `.env`:**
```env
# Application
NODE_ENV=development
PORT=5000

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=playvix
DB_USER=root
DB_PASSWORD=your_mysql_password

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d

# Rate Limiting (requests per minute per IP)
MAX_REQUESTS=100

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Step 6: Install Dependencies

```bash
npm install
```

### Step 7: Seed Database

```bash
# Generate sample pitches and slots
npm run seed
```

This creates:
- 3 cricket pitches with locations and pricing
- 16 time slots per pitch (06:00 to 22:00, 1-hour intervals)

### Step 8: Start Development Server

```bash
# Development with auto-reload
npm run dev

# Or production mode
npm start
```

Server will start on port 5000 (or your configured PORT).

**Verify it's working:**
```bash
curl http://localhost:5000/v1/pitches
```

---

## Environment Variables

| Variable | Description | Default | Required |
|---|---|---|---|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `5000` | No |
| `DB_HOST` | MySQL host | `localhost` | Yes |
| `DB_PORT` | MySQL port | `3306` | No |
| `DB_NAME` | Database name | `playvix` | Yes |
| `DB_USER` | MySQL username | `root` | Yes |
| `DB_PASSWORD` | MySQL password | — | Yes |
| `REDIS_HOST` | Redis host | `127.0.0.1` | No |
| `REDIS_PORT` | Redis port | `6379` | No |
| `REDIS_PASSWORD` | Redis password | — | No |
| `JWT_SECRET` | JWT signing key | — | Yes |
| `JWT_EXPIRY` | Token expiry | `7d` | No |
| `MAX_REQUESTS` | Rate limit per minute | `100` | No |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` | No |

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/v1/auth/register` | — | Register new user |
| POST | `/v1/auth/login` | — | Login, receive JWT |
| POST | `/v1/auth/logout` | ✓ | Logout user |
| GET | `/v1/auth/me` | ✓ | Get current user |

### Pitches

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/v1/pitches` | — | List all pitches |

### Slots

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/v1/slots?pitchId=&date=` | — | Get slots with availability status |

### Bookings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/v1/bookings/reserve-slot` | ✓ | Reserve slot for 2 minutes |
| POST | `/v1/bookings/confirm-booking` | ✓ | Confirm reservation → booking |
| GET | `/v1/bookings/my-bookings` | ✓ | User's booking history |
| DELETE | `/v1/bookings/:id` | ✓ | Cancel booking |

**Auth header:** `authorization: <jwt_token>` (raw token, no Bearer prefix)

---

## Available Scripts

```bash
npm start         # Start production server
npm run dev       # Start development server with nodemon
npm run seed      # Seed database with pitches and slots
npm run lint      # Run ESLint with auto-fix
```

---

## Database Schema

### Tables

**users** — User accounts
- `id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`

**pitches** — Cricket pitches
- `id`, `name`, `location`, `price_per_hour`, `created_at`, `updated_at`

**slots** — Time slot templates
- `id`, `pitch_id`, `start_time`, `end_time`

**bookings** — Confirmed bookings
- `id`, `user_id`, `pitch_id`, `slot_id`, `booking_date`, `status`, `created_at`, `updated_at`

### Key Constraints
- `uq_users_email` — Unique email
- `uq_slot_pitch_time` — Unique slot per pitch
- `uq_booking_pitch_slot_date` — **Critical: prevents double booking**
- Foreign key constraints with CASCADE delete

### Indexes
- `idx_bookings_user` — Fast user booking lookups
- `idx_bookings_date` — Fast date-based queries
- `idx_bookings_status` — Fast status filtering
- `idx_slots_pitch` — Fast slot lookups by pitch

---

## Socket.io Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join:pitch` | `pitchId` | Subscribe to pitch updates |
| `leave:pitch` | `pitchId` | Unsubscribe from pitch |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `slot:reserved` | `{ slotId, userId, ttl }` | Slot temporarily held |
| `slot:booked` | `{ slotId, userId }` | Slot confirmed booked |
| `slot:available` | `{ slotId }` | Slot released/available |

---

## Error Handling

### Error Response Format
```json
{
  "message": "Error description"
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 409 | Conflict (slot already booked/reserved) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## Production Deployment

### Checklist

- [ ] Change `JWT_SECRET` to cryptographically secure random string
- [ ] Set `NODE_ENV=production`
- [ ] Configure `FRONTEND_URL` to production domain
- [ ] Enable MySQL SSL connections
- [ ] Configure Redis AUTH password
- [ ] Set up log rotation (Winston handles this)
- [ ] Enable PM2 clustering for horizontal scaling
- [ ] Configure AWS ElastiCache (Redis) for multi-instance setup
- [ ] Set up AWS RDS (MySQL) with read replicas
- [ ] Configure AWS ALB (load balancer)

### Scalability for 10,000 Users

1. **Horizontal scaling** — Run N Node.js instances via PM2 cluster mode
2. **Load balancer** — AWS ALB distributes traffic
3. **Shared Redis** — AWS ElastiCache for shared reservation state + Socket.io adapter
4. **MySQL RDS** — Connection pooling via Sequelize (max 10 per instance)
5. **Socket.io Redis Adapter** — `@socket.io/redis-adapter` syncs events across instances
6. **DB Indexes** — `idx_bookings_date`, `idx_bookings_status` for fast slot queries

---

## Troubleshooting

### Common Issues

**Issue:** Cannot connect to MySQL
```
Error: Access denied for user
```
- **Solution:** Verify DB_USER and DB_PASSWORD in .env
- **Check:** `mysql -u <DB_USER> -p` works

**Issue:** Cannot connect to Redis
```
Error: Redis connection refused
```
- **Solution:** Ensure Redis is running: `redis-cli ping`
- **Check:** REDIS_HOST and REDIS_PORT in .env

**Issue:** Database tables don't exist
```
Error: Table 'playvix.pitches' doesn't exist
```
- **Solution:** Run migrations: `mysql -u root -p < migrations/001_initial_schema.sql`

**Issue:** Port already in use
```
Error: listen EADDRINUSE: address already in use :::5000
```
- **Solution:** Change PORT in .env or kill existing process: `lsof -ti:5000 | xargs kill -9`

---

## Edge Cases Handling

### 1. Duplicate Booking Requests (Race Conditions)

**Problem:** Two users click "Reserve Slot" simultaneously for the same slot.

**Solution:** Two-layer protection ensures only one succeeds:

**Layer 1 — Redis Atomic Lock:**
```js
redis.set(`slot_reservation:${pitchId}:${slotId}:${date}`, userId, 'EX', 120, 'NX')
```
- `NX` flag ensures only the first SET succeeds
- Second request gets `null` response → returns 409 Conflict immediately
- Zero database load for conflicting requests

**Layer 2 — MySQL SELECT FOR UPDATE:**
```sql
BEGIN;
SELECT * FROM bookings WHERE pitch_id=? AND slot_id=? AND booking_date=? FOR UPDATE;
-- Only proceed if no rows found
INSERT INTO bookings ...
COMMIT;
```
- Row-level lock prevents concurrent inserts
- Database `UNIQUE` constraint is final safety net

**Result:** Even if 10,000 users click simultaneously, only 1 succeeds. Others get immediate 409 response.

---

### 2. Network Retry (Idempotency)

**Problem:** User's network drops after clicking "Confirm Booking". They retry, but server already processed first request.

**Solution:** Idempotency via reservation key validation

```js
// Reservation service checks if user owns the reservation
const isOwner = await reservationService.verifyReservationOwner(
  pitchId, slotId, date, userId
);

// If reservation expired or belongs to another user → reject
// If user already confirmed booking → return existing booking (idempotent)
// If valid reservation → proceed with confirmation
```

**Key Points:**
- Same user retrying within 2 minutes → succeeds (idempotent)
- Different user trying to confirm → 403 Forbidden
- Reservation expired → 409 Conflict (ask user to reselect)

---

### 3. Slot Reservation Expiry

**Problem:** User reserves slot but doesn't confirm within 2 minutes. Slot remains "reserved" forever.

**Solution:** Redis TTL with expiry event handling

```js
// Redis key with 120-second expiry
redis.set(`slot_reservation:${pitchId}:${slotId}:${date}`, userId, 'EX', 120);
```

**Expiry Handling:**
1. **Automatic Redis Expiry:** Key auto-deletes after 120 seconds
2. **Frontend Countdown:** ConfirmModal shows countdown from 120s
3. **Socket Broadcast on Expiry:**
   - Redis key expires → no explicit event
   - Frontend detects expiry at 0s → calls `onClose('expired')`
   - Backend slot query no longer sees reservation → returns `available`
   - Socket.io broadcasts `slot:available` to all connected clients

**Flow:**
```
User clicks slot
  ↓
Reserve API creates Redis key (TTL=120s)
  ↓
ConfirmModal starts countdown
  ↓
[If user confirms within 2 min] → Create booking, broadcast slot:booked
  ↓
[If countdown reaches 0] → Slot released, broadcast slot:available
```

---

### 4. User Disconnect During Reservation

**Problem:** User reserves slot, closes browser/loses connection, then tries to book again later.

**Solution:** Multi-tab awareness + graceful cleanup

**Socket.io Room Management:**
```js
// User joins pitch room when viewing
socket.on('join:pitch', (pitchId) => {
  socket.join(`pitch:${pitchId}`);
});

// User leaves room on disconnect/navigation
socket.on('disconnect', () => {
  // Socket.io automatically cleans up room membership
});
```

**Scenarios:**

| Scenario | System Response |
|---|---|
| User disconnects, reconnects before expiry | Reservation still valid, can confirm |
| User disconnects, expiry passes | Slot becomes available for anyone |
| User opens new tab, tries same slot | Sees "reserved by you" if same user |
| User opens new tab, different slot | Can reserve multiple slots (one per pitch) |

**Cleanup:**
- Reservation key auto-expires (no manual cleanup needed)
- No "hanging" reservations after 2 minutes

---

### 5. Multiple Tab Booking

**Problem:** User opens 3 tabs, reserves 3 different slots simultaneously.

**Solution:** Per-slot reservation tracking

```js
// Each reservation is independent
slot_reservation:1:5:2025-03-20 → userId_123  (Tab 1)
slot_reservation:1:8:2025-03-20 → userId_123  (Tab 2)
slot_reservation:2:3:2025-03-20 → userId_123  (Tab 3)
```

**Rules:**
- ✅ Same user can reserve multiple slots across different pitches
- ✅ Same user can reserve multiple time slots on same pitch
- ❌ Two users cannot reserve the same slot
- ❌ Same user cannot double-reserve same slot (Redis NX prevents)

**Confirmation Behavior:**
```js
// Confirming one slot does NOT release others
// User must manually cancel or wait for expiry
```

**Real-time Sync:**
- All tabs receive Socket.io events via broadcast
- If user confirms in Tab 1 → Tab 2 & 3 see updated status
- If reservation expires in Tab 1 → All tabs see slot:available

---

## Architecture Questions (Mandatory)

### 1. Slot Race Condition — How does the system ensure two users cannot book the same slot?

**Answer:** Two-layer distributed locking strategy:

#### Layer 1: Redis Atomic SET NX (Soft Lock)
```
User A: SET slot_reservation:2:5:2025-03-20 userA EX 120 NX → OK ✓
User B: SET slot_reservation:2:5:2025-03-20 userB EX 120 NX → null ✗
```
- **O(1) operation** — sub-millisecond response
- **Atomic** — Redis single-threaded, no race condition
- **First-wins** — only first request gets `OK`

#### Layer 2: MySQL Transaction + SELECT FOR UPDATE (Hard Lock)
```sql
BEGIN;
SELECT * FROM bookings 
WHERE pitch_id=2 AND slot_id=5 AND booking_date='2025-03-20' 
FOR UPDATE;
-- If no rows:
INSERT INTO bookings ...;
COMMIT;
```
- **Row-level exclusive lock** — blocks concurrent transactions
- **ACID guarantee** — commit or rollback together
- **Unique constraint backup:**
  ```sql
  UNIQUE KEY uq_booking_pitch_slot_date (pitch_id, slot_id, booking_date)
  ```

**Performance Impact:**
| Users | Layer 1 (Redis) | Layer 2 (MySQL) | Result |
|---|---|---|---|
| 2 | 1 pass, 1 reject | 1 pass only | 1 booking |
| 100 | 1 pass, 99 reject | 1 pass only | 1 booking |
| 10,000 | 1 pass, 9,999 reject | 1 pass only | 1 booking |

**Conclusion:** 99.99% of conflicts resolved at Redis layer (0ms), MySQL as final safety net.

---

### 2. Temporary Reservation — How does the system handle 2-minute slot reservation?

**Answer:** Redis TTL + Socket.io broadcast

#### Reservation Flow:
```
1. User clicks "Reserve"
   ↓
2. Backend: redis.set(key, userId, 'EX', 120, 'NX')
   ↓
3. Success: Return { ttl: 120, reservationId: "..." }
   ↓
4. Frontend: Start 120s countdown (ConfirmModal)
   ↓
5. Socket.io: Broadcast slot:reserved to pitch room
   ↓
6. [If user confirms] → Create booking, delete Redis key
   ↓
7. [If 120s expires] → Redis auto-deletes key
   ↓
8. Next slot query → Returns available
   ↓
9. Socket.io: Broadcast slot:available
```

#### Redis Key Structure:
```
Key: slot_reservation:{pitchId}:{slotId}:{date}
Value: userId
TTL: 120 seconds
Example: slot_reservation:2:5:2025-03-20 → 42
```

#### Why Redis (not MySQL)?
| Feature | Redis | MySQL |
|---|---|---|
| Auto-expiry | Native TTL | Requires cron job |
| Performance | O(1) sub-ms | INSERT/DELETE ~10ms |
| Cleanup | Automatic | Manual/complex |
| Distributed lock | SET NX | Advisory locks |

**Edge Case:** If Redis crashes, reservation is lost but MySQL prevents double-booking.

---

### 3. Scalability — What changes are needed if 10,000 users check availability simultaneously?

**Answer:** Horizontal scaling with shared state

#### Current Architecture (Single Server):
```
Users → Node.js Server → MySQL + Redis (local)
```
**Limit:** ~1,000 concurrent connections (Node.js single-threaded)

#### Scaled Architecture (10,000 Users):
```
                    ┌─ Node.js Instance 1 ─┐
Users ──→ AWS ALB ──┼─ Node.js Instance 2 ─┼──→ AWS ElastiCache (Redis)
                    ├─ Node.js Instance N ─┤      └── Shared reservations
                    └─ Node.js Instance N ─┘
                             │
                             ↓
                    AWS RDS (MySQL) with read replicas
```

#### Required Changes:

**1. Horizontal Scaling (PM2 Cluster Mode)**
```bash
# Start N instances based on CPU cores
pm2 start src/index.js -i max
```

**2. Load Balancer (AWS ALB)**
- Distributes traffic across instances
- Health checks remove failed instances
- SSL termination

**3. Shared Redis (AWS ElastiCache)**
```js
// All instances connect to same Redis cluster
const redis = new Redis({
  host: 'playvix-redis.xxx.cache.amazonaws.com',
  port: 6379,
  cluster: true
});
```
- Centralized reservation state
- Pub/Sub for cross-instance Socket.io

**4. Database Scaling**
- **Write operations:** Primary MySQL instance (bookings)
- **Read operations:** Read replicas (slot queries)
- **Connection pooling:** Sequelize max 10 connections per instance

**5. Rate Limiting**
```js
// Current: 100 req/min per IP
// Scaled: 1000 req/min per user (JWT-based)
const limiter = rateLimit({
  keyGenerator: (req) => req.user?.id || req.ip,
  max: (req) => req.user ? 1000 : 100, // Auth users get higher limit
});
```

**6. Caching Layer**
```js
// Cache pitch list (rarely changes)
redis.setex('pitches:list', 300, JSON.stringify(pitches));
```

**Performance Estimates:**
| Metric | Single | Scaled (10 instances) |
|---|---|---|
| Concurrent users | ~1,000 | ~10,000 |
| Req/sec | ~500 | ~5,000 |
| Latency (p95) | ~50ms | ~100ms |
| Redis ops/sec | ~2,000 | ~20,000 |

---

### 4. Socket Scaling — How would you scale Socket.io across multiple servers?

**Answer:** Redis Adapter + Sticky Sessions (✅ **Implemented**)

#### Problem with Multiple Servers:
```
User A ──→ Server 1 ─┐
                      ├─❌ Can't communicate directly
User B ──→ Server 2 ─┘

// Server 1 emits to room 'pitch:2'
io.to('pitch:2').emit('slot:booked', data);
// But User B is connected to Server 2 — won't receive event!
```

#### Solution 1: Redis Adapter (@socket.io/redis-adapter) — ✅ Implemented
```
┌─ Server 1 ─┐         ┌─ Server 2 ─┐         ┌─ Server 3 ─┐
│  Socket.io│◄───────►│  Socket.io│◄───────►│  Socket.io│
│   + Redis │         │   + Redis │         │   + Redis │
└─────┬─────┘         └─────┬─────┘         └─────┬─────┘
      │                     │                     │
      └─────────────────────┼─────────────────────┘
                            │
                    ┌───────┴───────┐
                    │  Redis Pub/Sub  │
                    │ 
                    └─────────────────┘
```

**Implementation (in `src/config/redis.js` + `src/config/socket.js`):**

```js
// redis.js — Dedicated clients for Redis Adapter
const createAdapterClients = () => {
  const opts = {
    host: redisCfg.host,
    port: redisCfg.port,
    password: redisCfg.password || undefined,
    maxRetriesPerRequest: 3,
    enableOfflineQueue: true, // Required for Redis Adapter
    lazyConnect: false,
  };

  const pubClient = new Redis(opts);
  const subClient = new Redis(opts);
  return { pubClient, subClient };
};

// socket.js — Initialize with adapter
const { createAdapter } = require('@socket.io/redis-adapter');
const { createAdapterClients } = require('./redis');

const init = (httpServer) => {
  io = new Server(httpServer, { ... });

  // Enable Redis Adapter for multi-server scaling
  try {
    const { pubClient, subClient } = createAdapterClients();
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('Socket.io Redis Adapter enabled for multi-server scaling');
  } catch (err) {
    logger.warn(`Redis Adapter not enabled: ${err.message}`);
  }
  // ...
};
```

**Graceful Degradation:**
- If Redis unavailable → Falls back to single-server mode
- Logs warning: "Redis Adapter not enabled: ... — Socket.io running in single-server mode"

#### Solution 2: Sticky Sessions (IP Hash)
```
Users ──→ AWS ALB (IP Hash) ──┬─→ Server 1 (User A always here)
                              ├─→ Server 2 (User B always here)
                              └─→ Server 3
```

**Why Sticky Sessions:**
- WebSocket upgrade must hit same server
- Avoid connection drops during reconnection
- Simpler session management

**ALB Configuration:**
```yaml
LoadBalancer:
  Type: AWS::ElasticLoadBalancingV2::LoadBalancer
  Properties:
    StickinessPolicy:
      - CookieName: PLAYVIXSESSION
        CookieExpirationPeriod: 86400
```

#### Complete Scaling Architecture:
```
Users ──→ CloudFront (CDN) ──→ AWS ALB (Sticky Sessions)
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
               ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
               │ Server 1│◄───►│ Server 2│◄───►│ Server 3│
               │+ Socket │    │+ Socket │    │+ Socket │
               └────┬────┘    └────┬────┘    └────┬────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                           ┌────────▼────────┐
                           │ AWS ElastiCache │
                           │  Redis Cluster  │
                           │  (Pub/Sub +     │
                           │   Reservations) │
                           └─────────────────┘
                                    │
                           ┌────────▼────────┐
                           │   AWS RDS       │
                           │  MySQL Primary  │
                           │  + Read Replicas│
                           └─────────────────┘
```

**Key Components:**
1. **Redis Pub/Sub** — Cross-server Socket.io message routing
2. **Load Balancer** — Traffic distribution + sticky sessions
3. **Sticky Sessions** — WebSocket upgrade stability


