const express=require("express");
const db=require("../db/database");
const {requireAuth}=require("../middleware/requireAuth");
const router=express.Router();
router.use(requireAuth);
router.get("/",(req,res)=>res.json(db.prepare(`SELECT h.* FROM wishlist w JOIN hotels h ON h.id=w.hotel_id WHERE w.user_id=? ORDER BY w.created_at DESC`).all(req.userId)));
router.post("/:hotelId",(req,res)=>{
  const h=db.prepare("SELECT id FROM hotels WHERE id=? AND active=1").get(req.params.hotelId);
  if(!h)return res.status(404).json({error:"Hotel not found."});
  db.prepare("INSERT OR IGNORE INTO wishlist(user_id,hotel_id) VALUES(?,?)").run(req.userId,h.id);
  res.status(201).json({saved:true});
});
router.delete("/:hotelId",(req,res)=>{db.prepare("DELETE FROM wishlist WHERE user_id=? AND hotel_id=?").run(req.userId,req.params.hotelId);res.json({saved:false});});
module.exports=router;
