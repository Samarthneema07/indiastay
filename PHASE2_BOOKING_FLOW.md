# IndiaStay Phase 2 booking flow

## Guest flow
1. Guest selects hotel, room type, dates, rooms and guests.
2. Guest chooses `Pay securely online` or `Reserve now, pay later`.
3. Clicking **Send booking request** creates a booking with status `pending`.
4. The booking is visible in **My Bookings** as **Pending approval**.
5. The hotel/admin reviews the request.
6. For pay-later bookings, admin approval changes the booking to `confirmed`.
7. For online-payment bookings, admin approval changes the booking to `awaiting_payment`.
8. The guest then sees **Pay now** in My Bookings and Razorpay Checkout opens when clicked.
9. Server-side Razorpay verification changes the booking to `confirmed` and payment to `paid`.
10. Guest cancellation changes the booking to `cancelled`; the record remains visible instead of being deleted.

## Admin flow
- `pending` -> **Approve**
- Pay-later: approval -> `confirmed`
- Online: approval -> `awaiting_payment` -> guest pays -> `confirmed`
- Admin can later move confirmed bookings through `checked_in`, `completed`, `cancelled`, or `no_show`.
- Receptionists cannot approve new booking requests.

## Payment configuration
Online payment requires Razorpay test/live credentials in `backend/.env`:

```env
PAYMENT_PROVIDER=razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

No payment is charged before admin approval.
