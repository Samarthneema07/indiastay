# IndiaStay — Phase 2/Production-Oriented Build

IndiaStay is now a full-stack hotel-booking college project built around the existing UI and stack:

- Vanilla HTML/CSS/JavaScript customer website
- Node.js + Express REST API
- SQLite + better-sqlite3
- bcrypt password hashing
- JWT authentication
- Live date-overlap room availability
- Room types with independent price/capacity/inventory
- Booking lifecycle and payment lifecycle fields
- Verified-stay review rules
- Role-based admin control center
- Audit logs
- Razorpay-ready payment integration
- Non-destructive database migrations

## Important: the existing customer UI was preserved

The original home, hotel listing, search, filters, hotel detail, login/signup, booking and My Bookings flows remain the customer-facing experience. The backend is extended underneath them instead of replacing the project.

## Run locally on Windows

Use Node 22.x. The project was tested against the Node 22 line because `better-sqlite3` is a native module.

```powershell
cd D:\hotel-management\indiastay-phase1\indiastay\backend
npm install
npm run seed
npm start
```

Then open:

```text
http://localhost:4000/
```

The old method of opening `index.html` directly also remains supported.

### First admin account

Create a local `.env` in `backend/` from `.env.example` and set:

```text
ADMIN_NAME=IndiaStay Super Admin
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=choose-a-strong-password
```

Then:

```powershell
npm run create-admin
```

Open:

```text
http://localhost:4000/admin
```

The admin area is intentionally separate from the customer UI.

## Staff roles

- `super_admin` — full access, staff management, audit logs
- `hotel_manager` — hotel/room inventory and operational management
- `receptionist` — operational booking/check-in/check-out actions
- `guest` — customer account

The database is structured so hotel-scoped staff permissions can be expanded later without changing the customer architecture.

## Booking lifecycle

A booking can move through:

`pending_payment -> confirmed -> checked_in -> completed`

Alternative terminal paths:

`confirmed -> cancelled`

or

`confirmed -> no_show`

Cancellation is now a status change, not a destructive DELETE. The old `DELETE /api/bookings/:id` endpoint remains as a compatibility endpoint but performs a soft cancellation.

After checkout date passes, eligible confirmed/checked-in bookings are automatically marked completed when booking data is read.

## Payment lifecycle

Payment state is separate from booking state:

`pending -> paid`

or:

`pending -> failed`

and future refund support can use:

`paid -> refunded`

Razorpay support is implemented behind environment variables. The server never trusts a browser redirect as proof of payment; the webhook signature is verified before changing payment state.

Set:

```text
PAYMENT_PROVIDER=razorpay
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

If payment is not configured, the existing college-demo booking flow remains usable and clearly stores `not_required` rather than pretending a card/payment was processed.

## Room types

Every existing hotel is automatically migrated to a `Standard Room` type using its existing:

- price
- total room quantity
- hotel amenities
- hotel image

This keeps the original 96 hotels working.

New room types can have:

- name
- description
- price/night
- guest capacity
- quantity
- amenities
- image
- active/inactive state

Availability is calculated per room type using overlapping active bookings, preventing the old hotel-level inventory model from becoming a limitation.

## Reviews

New reviews require a completed stay and can only be submitted once per completed booking. Such reviews are returned with a verified flag.

Legacy reviews from the original dataset remain visible so existing content is not silently deleted.

## Production direction

The project is deliberately SQLite-compatible for the college demo, while the schema and API are organized around a future PostgreSQL migration.

Before a real public launch:

- use PostgreSQL or another durable hosted database
- use HTTPS
- set a strong JWT secret
- restrict CORS to the deployed frontend origin
- configure real payment credentials and webhook URL
- use secure production authentication/session storage
- add email/SMS provider credentials
- move hotel images to durable object storage/CDN
- add centralized logging, backups and monitoring
- add rate limiting/WAF and stronger request validation
- review cancellation/refund policies with the payment provider

Do not commit `.env`, credentials, or `node_modules`.


## Demo payment gateway
The current college build uses an IndiaStay Demo Payment Gateway. It simulates UPI, Card and Net Banking without charging real money. A successful online demo payment changes the booking to `pending` (Pending Approval); an admin can then approve it from the Admin Control Center.
