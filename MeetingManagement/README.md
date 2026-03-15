## Meeting Room Booking Service (Node.js / Express, In-Memory)

**Stack**: Node.js, Express, in-memory store (no DB), Jest, Supertest.

### Scripts

- **Dev server**: `npm run dev`
- **Start**: `npm start`
- **Tests**: `npm test`

### Running locally

1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`

By default, the API listens on `http://localhost:3000`.

### Key Endpoints

- `POST /rooms`
- `GET /rooms`
- `POST /bookings` (supports `Idempotency-Key` header)
- `GET /bookings`
- `POST /bookings/:id/cancel`
- `GET /bookings/reports/room-utilization?from=...&to=...`
