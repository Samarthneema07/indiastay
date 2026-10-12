# IndiaStay API

Express + SQLite backend for the IndiaStay hotel booking application.

## Main API areas

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/hotels`
- `GET /api/hotels/:id?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD`
- `GET /api/hotels/:hotelId/reviews`
- `POST /api/hotels/:hotelId/reviews`
- `GET /api/bookings`
- `POST /api/bookings`
- `PATCH /api/bookings/:id/cancel`
- `DELETE /api/bookings/:id` (compatibility soft-cancel)
- `GET /api/admin/dashboard`
- `GET/PATCH /api/admin/bookings`
- `GET/POST/PATCH /api/admin/hotels`
- `GET/POST/PATCH /api/admin/hotels/:hotelId/rooms`
- `GET/PATCH /api/admin/reviews`
- `GET/POST/PATCH /api/admin/users`
- `GET /api/admin/audit`
- `POST /api/payments/create-order`
- `POST /api/payments/razorpay/webhook`

## Local setup

Use Node 22.x:

```powershell
npm install
npm run seed
npm start
```

Create a super admin:

```powershell
$env:ADMIN_NAME="IndiaStay Super Admin"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="change-me"
npm run create-admin
```

For a persistent setup, place the same values in `backend/.env`.

## Database migrations

`db/database.js` runs non-destructive migrations automatically. It preserves existing hotels, users, bookings and reviews and creates a Standard Room type for each legacy hotel.

The API does not rely on the frontend to enforce inventory. Booking availability is checked again on the server immediately before the booking insert.
