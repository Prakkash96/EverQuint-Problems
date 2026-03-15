# Design notes (short)

## Data model

This service uses an **in-memory store** (`repositories/memoryStore.js`) with these collections:

- **Room**
  - `id` (int, auto-increment)
  - `name` (string, unique case-insensitive)
  - `capacity` (int \(\ge 1\))
  - `floor` (int)
  - `amenities` (string[])
  - `createdAt`, `updatedAt` (Date)

- **Booking**
  - `id` (int, auto-increment)
  - `roomId` (int, FK to Room)
  - `title` (string)
  - `organizerEmail` (string)
  - `startTime`, `endTime` (Date)
  - `status` (`CONFIRMED` | `CANCELLED`)
  - `createdAt`, `updatedAt` (Date)

- **IdempotencyRecord**
  - `key` (string; from `Idempotency-Key` header)
  - `organizerEmail` (string)
  - `bookingId` (int)
  - `createdAt` (Date)

## How “no overlaps” is enforced

On booking creation (`services/bookingService.js`), after validating the request, the service calls `findOverlappingBooking(...)` which checks existing **CONFIRMED** bookings for the same room.

Two intervals \([aStart, aEnd)\) and \([bStart, bEnd)\) are treated as overlapping unless:

- \(bEnd \le aStart\) (existing ends before/at new start), or
- \(bStart \ge aEnd\) (existing starts after/at new end)

If an overlap is found, the service throws a **409 Conflict** (`"Booking conflicts with existing booking"`).

## Error handling strategy

- **Where errors originate**
  - Validation/business rules in services and domain functions throw `Error` with an attached `err.statusCode` (usually 400/404/409).
- **How errors are returned**
  - A single Express middleware (`middleware/errorHandler.js`) converts errors into JSON:

```json
{ "error": "ValidationError|NotFoundError|ConflictError|InternalServerError", "message": "..." }
```

- **Logging**
  - Only unexpected **500** errors are logged to stderr (`console.error`).

## How idempotency is implemented

`POST /bookings` reads `Idempotency-Key` and passes it into `createBookingService`.

If present, booking creation uses `createBookingWithIdempotency({ key, organizerEmail, booking })`:

- It looks up an existing idempotency record by **(key, organizerEmail)**.
- If found and the referenced booking still exists, it returns that booking (no new booking is created).
- Otherwise it creates a new booking and stores a new idempotency record mapping `(key, organizerEmail) -> bookingId`.

Scope/assumption: idempotency is **per organizer email**, so two different organizers can reuse the same key without colliding.

## How concurrency issues are handled

This implementation relies on:

- **Single-process, in-memory state**, and
- **Synchronous repository operations** (no `await` / no I/O between “check overlap” and “insert booking”).

In Node.js, this means each request handler runs to completion without another request interleaving into the overlap-check/insert critical section. So within a **single server process**, the overlap check + insert behaves atomically enough for this toy/in-memory design.

Limitations (important):

- If you run **multiple Node processes** (cluster / multiple containers), each has its own memory store, so overlaps/idempotency cannot be globally enforced.
- With a real DB or async storage, you would need a **transaction/lock or unique constraint** (e.g., exclusion constraint on time ranges, or serialized insert with “check then write” guarded by a lock) to prevent race conditions.

## How utilization is calculated (formula & assumptions)

The utilization report (`GET /bookings/reports/room-utilization`) calculates utilization per room over a requested range \([from, to]\).

Business time assumptions (from `domain/bookingRules.js`):

- Only **Mon–Fri**
- Business hours are **08:00–20:00**
- Only the portion of bookings that falls inside both the **requested range** and **business hours** is counted.

Definitions:

- Let \(B\) be the set of business-time intervals within \([from, to]\) (one interval per weekday, clipped to the requested range).
- Let \(I\) be the set of booking intervals for the room (CONFIRMED bookings intersecting \([from, to]\)).
- Total business milliseconds:
  - \(T_{biz} = \sum_{b \in B} duration(b)\)
- Total booked milliseconds (clipped to business time and requested range):
  - \(T_{booked} = \sum_{i \in I} \sum_{b \in B} duration(i \cap b)\)

Outputs:

- `totalBookingHours = T_booked / (1000 * 60 * 60)`
- `utilizationPercent = T_booked / T_biz`
  - Note: this is returned as a **ratio** in \([0,1]\) (despite the name “Percent”). Multiply by 100 on the client if you want a true percentage.

Key assumption:

- Bookings in a room do **not overlap** (enforced by the service). If overlaps existed, this summation would double-count overlapped time.

