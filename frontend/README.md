# Playvix Frontend — Cricket Pitch Booking System

> Real-time React SPA for booking cricket pitches with live slot availability, QR codes, and seamless user experience.

---

## Features

### Core Features
- **User Authentication** — JWT-based login/register with secure token storage
- **Browse Pitches** — View all available cricket pitches with location and pricing
- **Real-time Slot Booking** — Live slot availability with WebSocket updates
- **2-Minute Reservation Hold** — Temporary slot reservation while confirming booking
- **Booking Management** — View, share, and cancel bookings
- **Responsive Design** — Mobile-first UI with TailwindCSS

### Advanced Features
- **Live Slot Updates** — Real-time status changes via Socket.io (no page refresh needed)
- **QR Code Generation** — Unique QR codes for each confirmed booking
- **Share Bookings** — Share booking details with others
- **Protected Routes** — Authentication-required pages with automatic redirects
- **Password Visibility Toggle** — Show/hide password in login/register forms
- **Enhanced Error Handling** — User-friendly error messages with fallback options
- **Countdown Timer** — Visual 2-minute countdown during reservation
- **Date Selection** — Browse slots for today + next 6 days

### UI Components
- **Navbar** — Navigation with auth state awareness
- **PitchCard** — Display pitch details with location, price, and icon
- **SlotCard** — Color-coded slot status (Green/Yellow/Red)
- **ConfirmModal** — 2-minute countdown with progress bar
- **BookingDetailModal** — Detailed booking view with QR code
- **Footer** — Consistent footer across all pages
- **Spinner** — Loading states for async operations
- **ProtectedRoute** — Route guard for authenticated pages

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI Framework |
| Vite | 5.x | Build tool (HMR, fast dev server) |
| TailwindCSS | 3.x | Utility-first styling |
| React Router | 6.x | Client-side routing |
| Axios | 1.x | HTTP client with interceptors |
| Socket.io-client | 4.x | Real-time WebSocket updates |
| date-fns | 3.x | Date formatting utilities |
| qrcode.react | 4.x | QR code generation |

---

## Project Structure

```
frontend/
├── src/
│   ├── api/              # Axios instance + API functions
│   │   ├── axios.js      # Configured axios with interceptors
│   │   ├── auth.api.js   # Authentication API calls
│   │   ├── pitch.api.js  # Pitch API calls
│   │   ├── slot.api.js   # Slot API calls
│   │   └── booking.api.js # Booking API calls
│   ├── components/       # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── PitchCard.jsx
│   │   ├── SlotCard.jsx
│   │   ├── ConfirmModal.jsx
│   │   ├── BookingDetailModal.jsx
│   │   ├── Footer.jsx
│   │   ├── Spinner.jsx
│   │   ├── LoginModal.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/          # React Context
│   │   └── AuthContext.jsx # JWT token + user state management
│   ├── hooks/            # Custom React hooks
│   │   ├── useSocket.js  # Socket.io connection management
│   │   └── useAuth.js    # Auth context hook
│   ├── pages/            # Route-level components
│   │   ├── HomePage.jsx      # Landing page
│   │   ├── LoginPage.jsx     # User login
│   │   ├── RegisterPage.jsx  # User registration
│   │   ├── PitchesPage.jsx   # List all pitches
│   │   ├── BookingPage.jsx   # Slot selection & booking
│   │   ├── BookingSuccessPage.jsx # Booking confirmation
│   │   └── MyBookingsPage.jsx # User's booking history
│   ├── constants/        # App constants
│   │   ├── index.js       # Status constants, routes, config
│   │   └── messages.js    # User-facing messages
│   ├── utils/            # Utility functions
│   │   ├── formatTime.js  # Time formatting utilities
│   │   └── dateUtils.js   # Date manipulation utilities
│   ├── App.jsx           # Main app component with routes
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles + Tailwind
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # TailwindCSS configuration
├── postcss.config.js     # PostCSS configuration
├── package.json          # Dependencies
└── .env.example          # Environment template
```

---

## Pages & Routes

| Page | Route | Auth Required | Description |
|---|---|---|---|
| Home | `/` | No | Landing page with app overview |
| Login | `/login` | No | User authentication |
| Register | `/register` | No | Create new account |
| Pitches | `/pitches` | Yes | Browse all cricket pitches |
| Booking | `/pitches/:id/book` | Yes | Select date & book slots |
| Booking Success | `/booking-success` | Yes | Confirmation with QR code |
| My Bookings | `/my-bookings` | Yes | View & manage bookings |

---

## Slot Status System

| Color | Status | Meaning | Action |
|---|---|---|---|
| 🟢 Green | `available` | Slot is free | Click to reserve |
| 🟡 Yellow | `reserved` | Temporarily held (2 min) | Wait or pick another |
| 🔴 Red | `booked` | Confirmed booking | Cannot select |

Slot statuses update in **real-time** via Socket.io without page refresh.

---

## Setup & Installation

### Prerequisites
- Node.js 18+ (recommended: 20+)
- Backend API running (see backend README)
- Redis server running (for real-time features)

### Step-by-Step Setup

```bash
# 1. Navigate to frontend directory
cd playvix/frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env if backend runs on a different port

# 4. Start development server (runs on port 3000)
npm run dev

# 5. Build for production
npm run build
```

---

## Environment Variables

Create a `.env` file in the frontend root:

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/v1` |
| `VITE_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` |

**Note:** Vite requires `VITE_` prefix for env variables to be exposed to the client.

---

## Key Design Decisions

### Authentication Flow
- JWT stored in `localStorage` under `playvix_token`
- Axios request interceptor attaches token automatically
- Axios response interceptor redirects to `/login` on 401
- `AuthContext` provides user state across all components

### Real-time Architecture
- `useSocket` hook manages Socket.io connection
- Joins `pitch:{id}` room when viewing a pitch
- Handles `slot:reserved`, `slot:booked`, `slot:available` events
- Immutable state updates for slot status changes

### 2-Minute Reservation
- User selects slot → API reserves for 120 seconds
- `ConfirmModal` displays countdown with visual progress bar
- At 0 seconds: reservation expires, slot becomes available
- User can confirm (creates booking) or cancel (releases slot)

### Error Handling
- Centralized error messages in `constants/messages.js`
- Axios interceptors for consistent error processing
- User-friendly error display with toast notifications
- Graceful fallbacks for network issues

---

## API Integration

### Authentication Endpoints
```javascript
POST /v1/auth/register    # Register new user
POST /v1/auth/login       # Login user
POST /v1/auth/logout      # Logout user
GET  /v1/auth/me          # Get current user
```

### Pitch Endpoints
```javascript
GET /v1/pitches           # List all pitches
GET /v1/pitches/:id       # Get pitch details
```

### Slot Endpoints
```javascript
GET /v1/slots?pitchId=&date=  # Get slots with availability
```

### Booking Endpoints
```javascript
POST /v1/bookings/reserve-slot    # Reserve slot (2 min hold)
POST /v1/bookings/confirm-booking # Confirm reservation
GET  /v1/bookings/my-bookings     # Get user's bookings
DELETE /v1/bookings/:id           # Cancel booking
```

---

## Development

### Available Scripts
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
```

### Code Style
- ES6+ syntax with React hooks
- Functional components with arrow functions
- TailwindCSS for all styling
- Component-based architecture

---

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Troubleshooting

### Common Issues

**Issue:** Cannot connect to backend
- **Solution:** Check `VITE_API_BASE_URL` in `.env` matches backend port

**Issue:** Real-time updates not working
- **Solution:** Verify Redis is running and `VITE_SOCKET_URL` is correct

**Issue:** Login redirects not working
- **Solution:** Clear localStorage and try again

---

## License
MIT
