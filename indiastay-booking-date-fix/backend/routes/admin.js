const express=require("express");
const bcrypt=require("bcryptjs");
const db=require("../db/database");
const {requireAuth,requireRole}=require("../middleware/requireAuth");
const {processCancellation}=require("../services/refunds");
const router=express.Router();
router.use(requireAuth,requireRole("super_admin","hotel_manager","receptionist"));

function log(req,action,type,id,metadata={}){
  db.prepare("INSERT INTO audit_logs(actor_user_id,action,entity_type,entity_id,metadata) VALUES(?,?,?,?,?)")
    .run(req.userId,action,type,id==null?null:String(id),JSON.stringify(metadata));
}
function canManage(role){return ["super_admin","hotel_manager","receptionist"].includes(role);}
function localDateString(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

router.get("/me",(req,res)=>res.json({user:req.user}));

router.get("/dashboard",(req,res)=>{
  const totals={
    users:db.prepare("SELECT COUNT(*) c FROM users WHERE active=1").get().c,
    hotels:db.prepare("SELECT COUNT(*) c FROM hotels WHERE active=1").get().c,
    bookings:db.prepare("SELECT COUNT(*) c FROM bookings").get().c,
    pending:db.prepare("SELECT COUNT(*) c FROM bookings WHERE status='pending'").get().c,
    confirmed:db.prepare("SELECT COUNT(*) c FROM bookings WHERE status='confirmed'").get().c,
    completed:db.prepare("SELECT COUNT(*) c FROM bookings WHERE status='completed'").get().c,
    cancelled:db.prepare("SELECT COUNT(*) c FROM bookings WHERE status='cancelled'").get().c,
    revenue:db.prepare("SELECT COALESCE(SUM(total),0) n FROM bookings WHERE status IN ('confirmed','checked_in','completed') AND payment_status IN ('paid','not_required')").get().n
  };
  const recent=db.prepare(`
    SELECT b.id,b.confirmation_code,b.check_in,b.check_out,b.rooms,b.guests,b.total,b.status,b.payment_status,
           h.name hotel_name,u.name guest_name
    FROM bookings b JOIN hotels h ON h.id=b.hotel_id JOIN users u ON u.id=b.user_id
    ORDER BY b.created_at DESC LIMIT 12
  `).all();
  const topHotels=db.prepare(`
    SELECT h.id,h.name,COUNT(b.id) bookings,COALESCE(SUM(CASE WHEN b.status<>'cancelled' THEN b.total ELSE 0 END),0) revenue
    FROM hotels h LEFT JOIN bookings b ON b.hotel_id=h.id
    GROUP BY h.id ORDER BY bookings DESC LIMIT 8
  `).all();
  res.json({totals,recent,topHotels});
});

router.get("/hotels",(req,res)=>{
  const hotels=db.prepare("SELECT h.*,COUNT(r.id) room_type_count FROM hotels h LEFT JOIN room_types r ON r.hotel_id=h.id GROUP BY h.id ORDER BY h.city,h.name").all();
  res.json(hotels);
});
router.post("/hotels",(req,res)=>{
  if(req.user.role==="receptionist")return res.status(403).json({error:"Receptionists cannot create hotels."});
  const {id,name,city,area,price,image,description,long_description,amenities,total_rooms}=req.body;
  if(!id||!name||!city||!area||!Number(price))return res.status(400).json({error:"id, name, city, area and price are required."});
  try{
    db.prepare(`INSERT INTO hotels(id,name,city,area,price,image,description,long_description,amenities,total_rooms) VALUES(?,?,?,?,?,?,?,?,?,?)`)
      .run(String(id),String(name),String(city),String(area),Number(price),image||"",description||"",long_description||"",JSON.stringify(amenities||[]),Number(total_rooms)||1);
    db.prepare(`INSERT INTO room_types(hotel_id,name,price,capacity,quantity,amenities,image) VALUES(?,?,?,?,?,?,?)`)
      .run(id,"Standard Room",Number(price),2,Number(total_rooms)||1,JSON.stringify(amenities||[]),image||"");
    log(req,"hotel_created","hotel",id,{name});
    res.status(201).json({id});
  }catch(e){res.status(409).json({error:"Hotel id already exists or the data is invalid."});}
});
router.patch("/hotels/:id",(req,res)=>{
  if(req.user.role==="receptionist")return res.status(403).json({error:"Receptionists cannot edit hotels."});
  const h=db.prepare("SELECT * FROM hotels WHERE id=?").get(req.params.id);
  if(!h)return res.status(404).json({error:"Hotel not found."});
  const fields=["name","city","area","price","image","description","long_description","total_rooms","active"];
  const sets=[];const args=[];
  for(const f of fields)if(req.body[f]!==undefined){sets.push(`${f}=?`);args.push(f==="price"||f==="total_rooms"||f==="active"?Number(req.body[f]):req.body[f]);}
  if(!sets.length)return res.json(h);
  sets.push("updated_at=datetime('now')");args.push(req.params.id);
  db.prepare(`UPDATE hotels SET ${sets.join(",")} WHERE id=?`).run(...args);
  log(req,"hotel_updated","hotel",req.params.id,{fields});
  res.json(db.prepare("SELECT * FROM hotels WHERE id=?").get(req.params.id));
});

router.get("/hotels/:hotelId/rooms",(req,res)=>{
  res.json(db.prepare("SELECT * FROM room_types WHERE hotel_id=? ORDER BY active DESC,price").all(req.params.hotelId).map(r=>({...r,amenities:JSON.parse(r.amenities||"[]")})));
});
router.post("/hotels/:hotelId/rooms",(req,res)=>{
  if(req.user.role==="receptionist")return res.status(403).json({error:"Receptionists cannot manage room types."});
  const {name,description,price,capacity,quantity,amenities,image}=req.body;
  if(!name||Number(price)<0||Number(capacity)<1||Number(quantity)<1)return res.status(400).json({error:"Valid name, price, capacity and quantity are required."});
  const result=db.prepare(`INSERT INTO room_types(hotel_id,name,description,price,capacity,quantity,amenities,image) VALUES(?,?,?,?,?,?,?,?)`)
    .run(req.params.hotelId,name,description||"",Number(price),Number(capacity),Number(quantity),JSON.stringify(amenities||[]),image||"");
  log(req,"room_type_created","room_type",result.lastInsertRowid,{hotelId:req.params.hotelId});
  res.status(201).json({id:result.lastInsertRowid});
});
router.patch("/rooms/:id",(req,res)=>{
  if(req.user.role==="receptionist")return res.status(403).json({error:"Receptionists cannot manage room types."});
  const allowed=["name","description","price","capacity","quantity","amenities","image","active"];
  const sets=[],args=[];
  for(const f of allowed)if(req.body[f]!==undefined){sets.push(`${f}=?`);args.push(f==="amenities"?JSON.stringify(req.body[f]):req.body[f]);}
  if(!sets.length)return res.status(400).json({error:"Nothing to update."});
  args.push(req.params.id);db.prepare(`UPDATE room_types SET ${sets.join(",")},updated_at=datetime('now') WHERE id=?`).run(...args);
  log(req,"room_type_updated","room_type",req.params.id,{fields:sets});
  res.json({success:true});
});

router.get("/bookings",(req,res)=>{
  const q=String(req.query.q||"").trim();
  let sql=`SELECT b.*,h.name hotel_name,h.city hotel_city,u.name guest_name,u.email guest_email,r.name room_type_name
           FROM bookings b JOIN hotels h ON h.id=b.hotel_id JOIN users u ON u.id=b.user_id
           LEFT JOIN room_types r ON r.id=b.room_type_id WHERE 1=1`;
  const args=[];
  if(q){sql+=" AND (b.confirmation_code LIKE ? OR u.email LIKE ? OR h.name LIKE ?)";const x=`%${q}%`;args.push(x,x,x);}
  if(req.query.status){sql+=" AND b.status=?";args.push(req.query.status);}
  sql+=" ORDER BY b.created_at DESC LIMIT 200";
  res.json(db.prepare(sql).all(...args));
});

router.patch("/bookings/:id/status",(req,res)=>{
  const requested=String(req.body.status||"");
  const allowed=["pending","awaiting_payment","confirmed","checked_in","completed","cancelled","no_show"];
  if(!allowed.includes(requested))return res.status(400).json({error:"Invalid booking status."});
  if(req.user.role==="receptionist"&&!['checked_in','completed','cancelled','no_show'].includes(requested))return res.status(403).json({error:"Receptionists cannot approve bookings."});
  const b=db.prepare("SELECT * FROM bookings WHERE id=?").get(req.params.id);
  if(!b)return res.status(404).json({error:"Booking not found."});

  const transitions={
    pending:["confirmed","cancelled"],
    pending_payment:["cancelled"],
    awaiting_payment:["confirmed","cancelled"],
    confirmed:["checked_in","cancelled","no_show"],
    checked_in:["completed"],
    completed:[], cancelled:[], no_show:[]
  };
  if(!(transitions[b.status]||[]).includes(requested)) {
    return res.status(409).json({error:`A booking cannot move from '${b.status}' to '${requested}'.`});
  }

  // Booking dates are calendar dates (YYYY-MM-DD), not timestamps.
  // Enforce lifecycle dates on the server so direct API calls cannot bypass the admin UI.
  const today=localDateString();
  if(requested==="checked_in" && today < b.check_in) {
    return res.status(409).json({error:`This guest cannot be checked in before the check-in date (${b.check_in}).`});
  }
  if(requested==="completed" && today < b.check_out) {
    return res.status(409).json({error:`This booking cannot be completed before the check-out date (${b.check_out}).`});
  }
  // No check-in time/deadline is configured in this project, so only mark no-show
  // once the entire check-in calendar date has passed.
  if(requested==="no_show" && today <= b.check_in) {
    return res.status(409).json({error:`This booking can only be marked no-show after the check-in date (${b.check_in}) has passed.`});
  }

  let status=requested;
  // Guest request -> manager approval. For online-payment bookings the guest
  // pays first, then the booking stays pending until the admin approves it.
  // Pay-later bookings can be confirmed directly by the admin.
  if(requested==='confirmed' && b.payment_method==='online' && b.payment_status!=='paid') {
    return res.status(409).json({error:"This guest selected online payment. Payment must be completed before approval."});
  }
  if(requested==='confirmed' && b.status==='pending' && b.payment_method==='online' && b.payment_status==='paid') status='confirmed';
  if(requested==='confirmed' && b.status==='pending_payment') {
    return res.status(409).json({error:"This booking is still waiting for the guest to complete payment."});
  }

  // Requests and unpaid payment attempts do not consume inventory. Inventory is
  // checked at the moment of approval, so two pending requests cannot overbook.
  if(requested==='confirmed' && b.status!=='confirmed') {
    const approvedRooms = db.prepare(`SELECT COALESCE(SUM(rooms),0) AS n FROM bookings
      WHERE room_type_id=? AND status IN ('confirmed','checked_in')
      AND check_in < ? AND check_out > ? AND id<>?`).get(b.room_type_id,b.check_out,b.check_in,b.id).n;
    const roomType = db.prepare('SELECT quantity,active FROM room_types WHERE id=?').get(b.room_type_id);
    if(!roomType || !roomType.active || approvedRooms + Number(b.rooms) > Number(roomType.quantity)) {
      return res.status(409).json({error:'Not enough rooms remain for these dates. This booking was not approved; please adjust availability or choose different dates/room type.'});
    }
  }

  if(status==='cancelled') {
    const result=processCancellation(b,`Cancelled by hotel (${req.user.role})`,{waiveFee:true});
    log(req,"booking_cancelled_by_hotel","booking",b.id,{from:b.status,to:"cancelled",cancellationFee:result.cancellationFee||0,feeWaived:true,paymentStatus:result.paymentStatus,refundStatus:result.refundStatus,refundAmount:result.refundAmount,refundReference:result.refundReference});
    return res.json({success:true,status:"cancelled",cancellationFee:0,feeWaived:true,refundStatus:result.refundStatus,refundAmount:result.refundAmount,refundReference:result.refundReference,paymentStatus:result.paymentStatus,message:"Hotel-initiated cancellation: no cancellation fee charged; any collected payment is fully refunded (demo)."});
  }

  db.prepare(`UPDATE bookings SET status=?,checked_in_at=CASE WHEN ?='checked_in' THEN datetime('now') ELSE checked_in_at END,
    checked_out_at=CASE WHEN ?='completed' THEN datetime('now') ELSE checked_out_at END,updated_at=datetime('now') WHERE id=?`)
    .run(status,status,status,b.id);
  log(req,"booking_status_changed","booking",b.id,{from:b.status,to:status,paymentStatus:b.payment_status});
  res.json({success:true,status});
});

router.get("/users",(req,res)=>{
  if(req.user.role!=="super_admin")return res.status(403).json({error:"Only the super admin can manage users."});
  res.json(db.prepare("SELECT id,name,email,role,active,created_at FROM users ORDER BY created_at DESC").all());
});
router.post("/users",(req,res)=>{
  if(req.user.role!=="super_admin")return res.status(403).json({error:"Only the super admin can create staff accounts."});
  const {name,email,password,role}=req.body;
  if(!name||!email||!password||!["super_admin","hotel_manager","receptionist"].includes(role))return res.status(400).json({error:"name, email, password and valid staff role are required."});
  try{
    const r=db.prepare("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)").run(name,email.toLowerCase(),bcrypt.hashSync(password,10),role);
    log(req,"staff_created","user",r.lastInsertRowid,{role});
    res.status(201).json({id:r.lastInsertRowid});
  }catch(e){res.status(409).json({error:"That email is already registered."});}
});
router.patch("/users/:id",(req,res)=>{
  if(req.user.role!=="super_admin")return res.status(403).json({error:"Only the super admin can manage users."});
  const allowedRoles=["guest","super_admin","hotel_manager","receptionist"];
  if(req.body.role && !allowedRoles.includes(req.body.role))return res.status(400).json({error:"Invalid role."});
  const sets=[],args=[];
  if(req.body.role!==undefined){sets.push("role=?");args.push(req.body.role);}
  if(req.body.active!==undefined){sets.push("active=?");args.push(req.body.active?1:0);}
  if(req.body.name!==undefined){sets.push("name=?");args.push(String(req.body.name));}
  if(!sets.length)return res.status(400).json({error:"Nothing to update."});
  args.push(req.params.id);db.prepare(`UPDATE users SET ${sets.join(",")} WHERE id=?`).run(...args);
  log(req,"user_updated","user",req.params.id,{fields:sets});
  res.json({success:true});
});

router.get("/reviews",(req,res)=>res.json(db.prepare(`
 SELECT r.*,u.name guest_name,u.email guest_email,h.name hotel_name
 FROM reviews r JOIN users u ON u.id=r.user_id JOIN hotels h ON h.id=r.hotel_id
 ORDER BY r.created_at DESC LIMIT 200
`).all()));
router.patch("/reviews/:id",(req,res)=>{
  const status=["published","hidden","flagged"].includes(req.body.status)?req.body.status:null;
  if(!status)return res.status(400).json({error:"Invalid review status."});
  db.prepare("UPDATE reviews SET status=?,updated_at=datetime('now') WHERE id=?").run(status,req.params.id);
  log(req,"review_moderated","review",req.params.id,{status});
  res.json({success:true});
});
router.get("/audit",(req,res)=>{
  if(req.user.role!=="super_admin")return res.status(403).json({error:"Only the super admin can view audit logs."});
  res.json(db.prepare(`SELECT a.*,u.name actor_name,u.email actor_email FROM audit_logs a LEFT JOIN users u ON u.id=a.actor_user_id ORDER BY a.created_at DESC LIMIT 300`).all());
});
module.exports=router;
