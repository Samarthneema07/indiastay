const express=require("express");
const db=require("../db/database");
const router=express.Router();

function roomAvailability(roomTypeId,checkIn,checkOut){
  const rt=db.prepare("SELECT quantity FROM room_types WHERE id=? AND active=1").get(roomTypeId);
  if(!rt) return 0;
  if(!checkIn||!checkOut) return rt.quantity;
  const row=db.prepare(`
    SELECT COALESCE(SUM(rooms),0) booked FROM bookings
    WHERE room_type_id=? AND status IN ('confirmed','checked_in')
      AND check_in < ? AND check_out > ?
  `).get(roomTypeId,checkOut,checkIn);
  return Math.max(0,rt.quantity-(row.booked||0));
}
function hotelData(h,checkIn,checkOut){
  const rating=db.prepare("SELECT AVG(rating) avgRating,COUNT(*) reviewCount FROM reviews WHERE hotel_id=? AND status='published'").get(h.id);
  const rooms=db.prepare("SELECT * FROM room_types WHERE hotel_id=? AND active=1 ORDER BY price,id").all(h.id)
    .map(r=>({...r,amenities:JSON.parse(r.amenities||"[]"),availableRooms:roomAvailability(r.id,checkIn,checkOut)}));
  const totalRooms=rooms.reduce((n,r)=>n+r.quantity,0) || h.total_rooms;
  const availableRooms=rooms.reduce((n,r)=>n+r.availableRooms,0);
  return {...h,amenities:JSON.parse(h.amenities||"[]"),rating:rating.avgRating?Math.round(rating.avgRating*10)/10:null,reviewCount:rating.reviewCount,
    total_rooms:totalRooms,availableRooms,roomTypes:rooms,price:rooms[0]?.price ?? h.price};
}
router.get("/",(req,res)=>{
  const {city,checkIn,checkOut,minRating,maxPrice}=req.query;
  let sql="SELECT * FROM hotels WHERE active=1"; const args=[];
  if(city){sql+=" AND city=?";args.push(city);}
  if(maxPrice){sql+=" AND price<=?";args.push(Number(maxPrice));}
  const hotels=db.prepare(sql).all(...args).map(h=>hotelData(h,checkIn,checkOut));
  const out=minRating?hotels.filter(h=>(h.rating||0)>=Number(minRating)):hotels;
  res.json(out);
});
router.get("/:id",(req,res)=>{
  const h=db.prepare("SELECT * FROM hotels WHERE id=? AND active=1").get(req.params.id);
  if(!h)return res.status(404).json({error:"Hotel not found."});
  res.json(hotelData(h,req.query.checkIn,req.query.checkOut));
});
module.exports=router;
