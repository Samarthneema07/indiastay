const express=require("express");
const db=require("../db/database");
const {requireAuth}=require("../middleware/requireAuth");
const router=express.Router({mergeParams:true});

router.get("/",(req,res)=>{
  const reviews=db.prepare(`
    SELECT r.id,r.rating,r.text,r.created_at,r.booking_id,u.name author,
           CASE WHEN r.booking_id IS NOT NULL THEN 1 ELSE 0 END verified
    FROM reviews r JOIN users u ON u.id=r.user_id
    WHERE r.hotel_id=? AND r.status='published'
    ORDER BY r.created_at DESC
  `).all(req.params.hotelId);
  res.json(reviews);
});

router.post("/",requireAuth,(req,res)=>{
  const rating=Number(req.body.rating); const text=String(req.body.text||"").trim();
  if(!Number.isInteger(rating)||rating<1||rating>5)return res.status(400).json({error:"Rating must be between 1 and 5."});
  if(text.length<5)return res.status(400).json({error:"Review must contain at least 5 characters."});

  const eligible=db.prepare(`
    SELECT b.id FROM bookings b
    WHERE b.id IN (SELECT id FROM bookings WHERE user_id=? AND hotel_id=?)
      AND b.user_id=? AND b.hotel_id=? AND b.status='completed'
      AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.booking_id=b.id)
    ORDER BY b.check_out DESC LIMIT 1
  `).get(req.userId,req.params.hotelId,req.userId,req.params.hotelId);
  if(!eligible)return res.status(403).json({error:"Reviews are available after a completed stay. Each completed booking can be reviewed once."});

  const result=db.prepare("INSERT INTO reviews(hotel_id,user_id,booking_id,rating,text) VALUES(?,?,?,?,?)")
    .run(req.params.hotelId,req.userId,eligible.id,rating,text);
  res.status(201).json({id:result.lastInsertRowid,verified:true});
});
module.exports=router;
