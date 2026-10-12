const express=require("express");
const crypto=require("crypto");
const db=require("../db/database");
const {requireAuth}=require("../middleware/requireAuth");
const router=express.Router();

/*
 * IndiaStay Demo Payment Gateway
 * --------------------------------
 * This is intentionally a simulated payment flow for the college/demo build.
 * No real card, UPI, PIN, bank credentials or money are processed.
 */
router.post("/demo/complete",requireAuth,(req,res)=>{
  const {bookingId,paymentMethod="upi"}=req.body;
  const b=db.prepare("SELECT * FROM bookings WHERE id=? AND user_id=?").get(bookingId,req.userId);
  if(!b)return res.status(404).json({error:"Booking not found."});
  if(b.payment_method!=="online")return res.status(409).json({error:"This booking was created with pay-later."});
  if(b.status==="cancelled")return res.status(409).json({error:"This booking has been cancelled."});
  if(b.payment_status==="paid")return res.json({success:true,alreadyPaid:true,bookingId:b.id,status:b.status});
  const ref="DEMO-"+Date.now()+"-"+crypto.randomBytes(2).toString("hex").toUpperCase();
  db.prepare(`
    UPDATE bookings
    SET payment_status='paid',
        payment_provider='demo',
        payment_reference=?,
        status='pending',
        updated_at=datetime('now')
    WHERE id=?
  `).run(ref,b.id);
  db.prepare("INSERT INTO audit_logs(actor_user_id,action,entity_type,entity_id,metadata) VALUES(?,?,?,?,?)")
    .run(req.userId,"demo_payment_completed","booking",String(b.id),JSON.stringify({method:paymentMethod,reference:ref}));
  res.json({
    success:true,
    demo:true,
    bookingId:b.id,
    paymentStatus:"paid",
    status:"pending",
    paymentReference:ref,
    message:"Demo payment successful. Booking is now pending hotel approval."
  });
});

/*
 * Legacy Razorpay endpoints are kept so the project can be upgraded later.
 * They are not used by the current demo UI.
 */
router.post("/create-order",requireAuth,async(req,res)=>{
  const b=db.prepare("SELECT * FROM bookings WHERE id=? AND user_id=?").get(req.body.bookingId,req.userId);
  if(!b)return res.status(404).json({error:"Booking not found."});
  if(b.payment_method!=="online")return res.status(409).json({error:"This booking was created with pay-later."});
  if(b.payment_status==="paid")return res.status(409).json({error:"This booking has already been paid."});
  if(process.env.PAYMENT_PROVIDER!=="razorpay")return res.status(503).json({error:"Razorpay is disabled in this demo build. Use the IndiaStay Demo Payment gateway."});
  const key=process.env.RAZORPAY_KEY_ID, secret=process.env.RAZORPAY_KEY_SECRET;
  if(!key||!secret)return res.status(503).json({error:"Razorpay keys are missing from the server environment."});
  try{
    const auth=Buffer.from(`${key}:${secret}`).toString("base64");
    const r=await fetch("https://api.razorpay.com/v1/orders",{method:"POST",headers:{"Authorization":`Basic ${auth}`,"Content-Type":"application/json"},body:JSON.stringify({
      amount:b.total*100,currency:"INR",receipt:b.confirmation_code,notes:{booking_id:String(b.id)}
    })});
    const data=await r.json();
    if(!r.ok)return res.status(502).json({error:"Payment provider rejected the order.",details:data.error?.description});
    db.prepare("UPDATE bookings SET payment_status='pending',payment_provider='razorpay',payment_reference=?,status='pending_payment',updated_at=datetime('now') WHERE id=?").run(data.id,b.id);
    res.json({provider:"razorpay",keyId:key,order:data});
  }catch(e){res.status(502).json({error:"Could not reach the payment provider."});}
});

router.post("/verify",requireAuth,(req,res)=>{
  const {bookingId,razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;
  const b=db.prepare("SELECT * FROM bookings WHERE id=? AND user_id=?").get(bookingId,req.userId);
  if(!b)return res.status(404).json({error:"Booking not found."});
  if(!razorpay_order_id||!razorpay_payment_id||!razorpay_signature)return res.status(400).json({error:"Incomplete payment verification data."});
  if(b.payment_reference!==razorpay_order_id)return res.status(400).json({error:"Payment order does not match this booking."});
  const secret=process.env.RAZORPAY_KEY_SECRET;
  if(!secret)return res.status(503).json({error:"Payment verification is not configured."});
  const expected=crypto.createHmac("sha256",secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if(expected.length!==String(razorpay_signature).length || !crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(String(razorpay_signature))))return res.status(401).json({error:"Payment signature verification failed."});
  db.prepare("UPDATE bookings SET payment_status='paid',payment_provider='razorpay',payment_reference=?,status='pending',updated_at=datetime('now') WHERE id=?").run(razorpay_payment_id,b.id);
  res.json({success:true,bookingId:b.id});
});

router.post("/razorpay/webhook",(req,res)=>{
  const secret=process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature=req.headers["x-razorpay-signature"];
  if(!secret||!signature)return res.status(400).json({error:"Webhook not configured."});
  const expected=crypto.createHmac("sha256",secret).update(req.rawBody || Buffer.from(JSON.stringify(req.body))).digest("hex");
  if(expected.length!==String(signature).length || !crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(String(signature))))return res.status(401).json({error:"Invalid webhook signature."});
  let body; try { body=JSON.parse((req.rawBody || Buffer.from(JSON.stringify(req.body))).toString("utf8")); } catch(_) { return res.status(400).json({error:"Invalid JSON webhook."}); }
  const event=body.event, entity=body.payload?.payment?.entity, orderId=entity?.order_id;
  if(orderId){
    const b=db.prepare("SELECT id FROM bookings WHERE payment_reference=?").get(orderId);
    if(b){
      if(event==="payment.captured"||event==="order.paid") db.prepare("UPDATE bookings SET payment_status='paid',status=CASE WHEN status IN ('pending_payment','awaiting_payment') THEN 'pending' ELSE status END,updated_at=datetime('now') WHERE id=?").run(b.id);
      else if(event==="payment.failed") db.prepare("UPDATE bookings SET payment_status='failed',status='pending_payment',updated_at=datetime('now') WHERE id=?").run(b.id);
    }
  }
  res.json({received:true});
});
module.exports=router;
