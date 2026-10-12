const express=require("express");
const crypto=require("crypto");
const db=require("../db/database");
const {requireAuth}=require("../middleware/requireAuth");
const {calculateRefund,processCancellation}=require("../services/refunds");
const router=express.Router();
router.use(requireAuth);

function nightsBetween(a,b){ return Math.round((new Date(b)-new Date(a))/86400000); }
function validDate(s){ return /^\d{4}-\d{2}-\d{2}$/.test(String(s||"")) && !Number.isNaN(new Date(s+"T00:00:00").getTime()); }
function code(){ return "IS-"+new Date().getFullYear()+"-"+crypto.randomBytes(3).toString("hex").toUpperCase(); }

function available(roomTypeId, checkIn, checkOut, excludeId=null){
  const rt=db.prepare("SELECT quantity FROM room_types WHERE id=? AND active=1").get(roomTypeId);
  if(!rt) return 0;
  const row=db.prepare(`
    SELECT COALESCE(SUM(rooms),0) booked
    FROM bookings
    WHERE room_type_id=? AND status IN ('confirmed','checked_in')
      AND check_in < ? AND check_out > ?
      ${excludeId ? "AND id <> ?" : ""}
  `).get(...(excludeId ? [roomTypeId,checkOut,checkIn,excludeId] : [roomTypeId,checkOut,checkIn]));
  return Math.max(0,rt.quantity-(row.booked||0));
}

function refreshCompleted(){
  db.prepare(`
    UPDATE bookings SET status='completed', updated_at=datetime('now')
    WHERE status IN ('confirmed','checked_in') AND check_out <= date('now')
  `).run();
}

router.get("/",(req,res)=>{
  refreshCompleted();
  const rows=db.prepare(`
    SELECT b.*, h.name hotel_name, h.city hotel_city, h.image hotel_image,
           r.name room_type_name
    FROM bookings b JOIN hotels h ON h.id=b.hotel_id
    LEFT JOIN room_types r ON r.id=b.room_type_id
    WHERE b.user_id=? ORDER BY b.created_at DESC
  `).all(req.userId);
  res.json(rows);
});

router.post("/",(req,res)=>{
  const {hotelId,roomTypeId,checkIn,checkOut,rooms,guests,paymentMethod="later"}=req.body;
  const hotel=db.prepare("SELECT * FROM hotels WHERE id=? AND active=1").get(hotelId);
  if(!hotel) return res.status(404).json({error:"Hotel not found."});
  if(!validDate(checkIn)||!validDate(checkOut)) return res.status(400).json({error:"Please provide valid check-in and check-out dates."});
  const nights=nightsBetween(checkIn,checkOut);
  if(nights<=0) return res.status(400).json({error:"Check-out must be after check-in."});
  if(new Date(checkIn+"T00:00:00") < new Date(new Date().toISOString().slice(0,10)+"T00:00:00")) return res.status(400).json({error:"Check-in cannot be in the past."});

  const requested=Math.max(1,Number(rooms)||1);
  const guestCount=Math.max(1,Number(guests)||1);
  const method=paymentMethod === "online" ? "online" : "later";
  // Online payment is a local DEMO gateway for the college build.
  // No real money or external payment provider is used.
  let rt=roomTypeId ? db.prepare("SELECT * FROM room_types WHERE id=? AND hotel_id=? AND active=1").get(roomTypeId,hotelId) : db.prepare("SELECT * FROM room_types WHERE hotel_id=? AND active=1 ORDER BY price,id LIMIT 1").get(hotelId);
  if(!rt) return res.status(409).json({error:"No room type is currently available for this hotel."});
  if(guestCount > rt.capacity*requested) return res.status(400).json({error:`This room type supports up to ${rt.capacity*requested} guest(s) for ${requested} room(s).`});

  const result=db.transaction(()=>{
    const left=available(rt.id,checkIn,checkOut);
    if(requested>left) return {conflict:true,left};
    const total=nights*requested*rt.price;
    const confirmation=code();
    const info=db.prepare(`
      INSERT INTO bookings(user_id,hotel_id,room_type_id,confirmation_code,check_in,check_out,rooms,guests,total,status,payment_status,payment_method,price_per_night,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'))
    `).run(req.userId,hotelId,rt.id,confirmation,checkIn,checkOut,requested,guestCount,total,method === "online" ? "pending_payment" : "pending",method === "online" ? "pending" : "not_required",method,rt.price);
    db.prepare("INSERT INTO audit_logs(actor_user_id,action,entity_type,entity_id,metadata) VALUES(?,?,?,?,?)")
      .run(req.userId,"booking_created","booking",String(info.lastInsertRowid),JSON.stringify({hotelId,roomTypeId:rt.id,total}));
    return {id:info.lastInsertRowid,total,nights,availableRoomsRemaining:left-requested,confirmationCode:confirmation,roomType:rt.name,paymentMethod:method,status:method === "online" ? "pending_payment" : "pending"};
  })();

  if(result.conflict) return res.status(409).json({
    error:result.left<=0?"Sorry — this room type is sold out for those dates.":`Sorry — only ${result.left} room${result.left!==1?"s":""} left for those dates.`,
    availableRooms:result.left
  });
  res.status(201).json(result);
});

function cancelBookingForGuest(req,res,reason="Cancelled by guest"){
  const b=db.prepare("SELECT * FROM bookings WHERE id=?").get(req.params.id);
  if(!b) return res.status(404).json({error:"Booking not found."});
  if(b.user_id!==req.userId) return res.status(403).json({error:"You can only cancel your own bookings."});
  if(!["pending","pending_payment","awaiting_payment","confirmed"].includes(b.status)) return res.status(409).json({error:"This booking can no longer be cancelled."});
  const refundPreview=calculateRefund(b);
  const result=processCancellation(b,reason);
  db.prepare("INSERT INTO audit_logs(actor_user_id,action,entity_type,entity_id,metadata) VALUES(?,?,?,?,?)")
    .run(req.userId,"booking_cancelled","booking",String(b.id),JSON.stringify({reason,refundStatus:result.refundStatus,refundAmount:result.refundAmount,refundReference:result.refundReference}));
  res.json({success:true,bookingId:b.id,status:"cancelled",originalAmount:refundPreview.originalAmount,cancellationFee:result.cancellationFee ?? refundPreview.fee,feePercent:refundPreview.feePercent,daysUntilCheckIn:refundPreview.daysUntilCheckIn,refundAmount:result.refundAmount,refundStatus:result.refundStatus,refundReference:result.refundReference,paymentStatus:result.paymentStatus,message:result.refundStatus==="refunded"?"Booking cancelled. Your demo refund has been processed according to the cancellation policy.":"Booking cancelled. No payment was collected, so no cancellation fee or refund was required."});
}

router.patch("/:id/cancel",(req,res)=>cancelBookingForGuest(req,res,String(req.body.reason||"Cancelled by guest")));

// Backward-compatible DELETE: never physically deletes a booking; it now runs the same refund flow.
router.delete("/:id",(req,res)=>cancelBookingForGuest(req,res,"Cancelled by guest"));

module.exports=router;
