const crypto = require("crypto");
const db = require("../db/database");

// College/demo policy based on calendar days remaining before check-in (India time):
// 7+ days: 0% fee; 3-6 days: 10%; 1-2 days: 30%; check-in day/past: 50%.
function daysUntilCheckIn(checkIn) {
  if (!checkIn) return 0;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date());
  const today = `${parts.find(p => p.type === "year").value}-${parts.find(p => p.type === "month").value}-${parts.find(p => p.type === "day").value}`;
  const start = Date.parse(`${today}T00:00:00Z`);
  const checkInDate = Date.parse(`${String(checkIn).slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(checkInDate)) return 0;
  return Math.floor((checkInDate - start) / 86400000);
}

function calculateRefund(booking) {
  const originalAmount = Number(booking.total || 0);
  if (booking.payment_status !== "paid") {
    return { eligible: false, originalAmount, fee: 0, cancellationFee: 0, refundAmount: 0, feePercent: 0, daysUntilCheckIn: daysUntilCheckIn(booking.check_in) };
  }
  const days = daysUntilCheckIn(booking.check_in);
  const feePercent = days >= 7 ? 0 : days >= 3 ? 10 : days >= 1 ? 30 : 50;
  const fee = Math.round(originalAmount * feePercent / 100);
  return {
    eligible: true, originalAmount, fee, cancellationFee: fee,
    refundAmount: originalAmount - fee, feePercent, daysUntilCheckIn: days
  };
}

function processCancellation(booking, reason = "Cancelled by guest", options = {}) {
  const refund = calculateRefund(booking);
  // Hotel/admin-initiated cancellation or rejection must never penalize the guest.
  // If payment was collected, refund the full amount; otherwise no refund is due.
  if (options.waiveFee && refund.eligible) {
    refund.fee = 0;
    refund.cancellationFee = 0;
    refund.refundAmount = refund.originalAmount;
    refund.feePercent = 0;
  }
  const alreadyRefunded = booking.payment_status === "refunded" || booking.refund_status === "refunded";

  if (alreadyRefunded) {
    // If a hotel/admin rejects a booking that was previously recorded with a
    // partial demo refund, correct the demo ledger to the full paid amount.
    // This is a simulated ledger correction; no real payment is moved.
    if (options.waiveFee && refund.eligible && Number(booking.refund_amount || 0) < refund.originalAmount) {
      db.prepare(`
        UPDATE bookings
        SET status='cancelled', cancellation_reason=?,
            payment_status='refunded', refund_status='refunded', refund_amount=?,
            updated_at=datetime('now')
        WHERE id=?
      `).run(String(reason), refund.originalAmount, booking.id);
      return {
        ...refund,
        refundStatus: "refunded",
        refundAmount: refund.originalAmount,
        refundReference: booking.refund_reference || null,
        cancellationFee: 0,
        fee: 0,
        feePercent: 0,
        paymentStatus: "refunded"
      };
    }
    return {
      refundStatus: "refunded",
      refundAmount: Number(booking.refund_amount || 0),
      refundReference: booking.refund_reference || null,
      originalAmount: Number(booking.total || 0),
      cancellationFee: Math.max(0, Number(booking.total || 0) - Number(booking.refund_amount || 0)),
      fee: Math.max(0, Number(booking.total || 0) - Number(booking.refund_amount || 0)),
      feePercent: Number(booking.total || 0) ? Math.round((Number(booking.total || 0) - Number(booking.refund_amount || 0)) / Number(booking.total || 0) * 100) : 0,
      paymentStatus: "refunded"
    };
  }

  if (!refund.eligible) {
    db.prepare(`
      UPDATE bookings
      SET status='cancelled', cancelled_at=datetime('now'), cancellation_reason=?,
          refund_status='not_applicable', refund_amount=0,
          updated_at=datetime('now')
      WHERE id=?
    `).run(String(reason), booking.id);
    return { ...refund, cancellationFee: 0, refundStatus: "not_applicable", refundReference: null, paymentStatus: booking.payment_status };
  }

  // Simulated refund: no real money moves. This mirrors a successful refund response.
  const reference = "REFUND-DEMO-" + Date.now() + "-" + crypto.randomBytes(2).toString("hex").toUpperCase();
  db.prepare(`
    UPDATE bookings
    SET status='cancelled', cancelled_at=datetime('now'), cancellation_reason=?,
        payment_status='refunded', refund_status='refunded', refund_amount=?,
        refund_reference=?, refund_processed_at=datetime('now'), updated_at=datetime('now')
    WHERE id=?
  `).run(String(reason), refund.refundAmount, reference, booking.id);

  return { ...refund, cancellationFee: refund.fee, refundStatus: "refunded", refundReference: reference, paymentStatus: "refunded" };
}

module.exports = { calculateRefund, processCancellation };
