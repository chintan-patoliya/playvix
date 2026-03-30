# Playvix — Cricket Pitch Booking System

> Full-stack real-time booking platform built with React, Node.js, MySQL, Redis, and Socket.io — **designed to scale to 10,000+ concurrent users**

[![Frontend](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)](./frontend/README.md)
[![Backend](https://img.shields.io/badge/Backend-Node.js_22-339933?logo=nodedotjs)](./backend/README.md)
[![Database](https://img.shields.io/badge/Database-MySQL_8-4479A1?logo=mysql)](./backend/migrations/001_initial_schema.sql)
[![Cache](https://img.shields.io/badge/Cache-Redis_7-DC382D?logo=redis)](./backend/README.md#tech-stack)

---

## Overview

Playvix is a production-grade cricket pitch booking system featuring:

- **Real-time slot booking** with 2-minute temporary holds
- **Concurrent booking protection** — prevents double-booking with Redis + MySQL locks
- **Live updates** via Socket.io to all connected clients
- **Horizontal scalability** — supports 10,000+ concurrent users
- **Responsive UI** built with React 18 and TailwindCSS

---

## Quick Start

### Prerequisites
- Node.js 22+
- MySQL 8+
- Redis 7+

### 1. Clone & Install
```bash
git clone <repo-url>
cd playvix
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL/Redis credentials
npm run seed   # Seed pitches and slots
npm run dev    # Start server on port 5000
```
[→ Backend Details](./backend/README.md)

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev    # Start dev server on port 3000
```
[→ Frontend Details](./frontend/README.md)

---

## Architecture

### System Architecture
```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   React 18      │      │   Node.js 22    │      │   MySQL 8       │
│   (Vite)        │◄────►│   (Express)     │◄────►│   (Primary DB)  │
│   TailwindCSS   │  HTTP│   Socket.io     │      │   Sequelize ORM │
└─────────────────┘      └────────┬────────┘      └─────────────────┘
                                  │
                         ┌────────▼────────┐
                         │   Redis 7       │
                         │   (Reservations + │
                         │    Pub/Sub)       │
                         └─────────────────┘
```

### Scalability (10,000+ Users)
```
Users ──► AWS ALB ──┬─► Node.js Instance 1 ─┐
                    ├─► Node.js Instance 2 ──┼──► Redis Cluster
                    └─► Node.js Instance N ──┘      └── Shared state
                           │
                           ▼
                    MySQL Primary + Read Replicas
```

---

## Project Structure

```
playvix/
├── backend/           # Node.js API
│   ├── src/
│   │   ├── api/      # Routes, Controllers, Services, Repositories
│   │   ├── config/   # DB, Redis, Socket.io, Passport
│   │   └── utils/    # Helpers, Validations
│   ├── migrations/   # MySQL schema
│   └── README.md     # [Backend Docs](./backend/README.md)
│
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Route pages
│   │   └── api/         # Axios + Socket.io client
│   └── README.md     # [Frontend Docs](./frontend/README.md)
│
└── README.md         # This file
```

---

## Key Features

### Booking Flow
```
User selects slot → Redis lock (120s TTL) → Confirm within 2 min → MySQL booking
     │                        │                              │
     ▼                        ▼                              ▼
Socket.io broadcast    Auto-expiry if no confirm     Broadcast booked status
```

### Concurrency Protection
- **Redis SET NX** — Atomic reservation lock
- **MySQL SELECT FOR UPDATE** — Row-level transaction lock
- **Result:** 10,000 users clicking same slot = only 1 booking succeeds

### Real-time Updates
- Socket.io rooms per pitch (`pitch:${id}`)
- Events: `slot:reserved`, `slot:booked`, `slot:available`
- Redis Adapter for multi-server scaling

---

## Documentation

| Document | Description |
|----------|-------------|
| [Backend README](./backend/README.md) | API docs, architecture, edge cases, scalability |
| [Frontend README](./frontend/README.md) | UI components, setup, design decisions |
| [API Reference](./backend/README.md#api-reference) | Complete endpoint documentation |
| [Architecture Q&A](./backend/README.md#architecture-questions-mandatory) | Race conditions, scalability, Socket.io scaling |

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TailwindCSS, Axios, Socket.io-client |
| Backend | Node.js 22, Express, Socket.io, Sequelize |
| Database | MySQL 8 (ACID transactions) |
| Cache | Redis 7 (TTL reservations + Pub/Sub) |
| Auth | Passport JWT |
| Validation | Joi |
| Logging | Winston |

---

## License
MIT
