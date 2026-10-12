require("./config/loadEnv")();
const path=require("path");
const express=require("express");
const cors=require("cors");
const authRoutes=require("./routes/auth");
const hotelRoutes=require("./routes/hotels");
const reviewRoutes=require("./routes/reviews");
const bookingRoutes=require("./routes/bookings");
const adminRoutes=require("./routes/admin");
const paymentRoutes=require("./routes/payments");
const wishlistRoutes=require("./routes/wishlist");
require("./db/database");

const app=express();
const PORT=process.env.PORT||4000;
const FRONTEND=path.join(__dirname,"..");

const allowed=(process.env.CORS_ORIGIN||"*").split(",").map(x=>x.trim()).filter(Boolean);
app.use(cors({origin:(origin,cb)=>{
  if(!origin||allowed.includes("*")||allowed.includes(origin)) return cb(null,true);
  cb(new Error("CORS origin not allowed"));
}}));
app.use(express.json({limit:"1mb",verify:(req,res,buf)=>{req.rawBody=Buffer.from(buf)}}));

// Basic security headers without adding another dependency.
app.disable("x-powered-by");
app.use((req,res,next)=>{
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("X-Frame-Options","SAMEORIGIN");
  res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
  next();
});

app.use("/api/auth",authRoutes);
app.use("/api/hotels",hotelRoutes);
app.use("/api/hotels/:hotelId/reviews",reviewRoutes);
app.use("/api/bookings",bookingRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/payments",paymentRoutes);
app.use("/api/wishlist",wishlistRoutes);

app.get("/api/health",(req,res)=>res.json({status:"ok",service:"IndiaStay API",time:new Date().toISOString()}));

// Serve the existing customer frontend when running the backend.
// Opening index.html directly still works, so this does not remove the old workflow.
app.use(express.static(FRONTEND));
app.get("/admin",(req,res)=>res.sendFile(path.join(FRONTEND,"admin","index.html")));

app.use((err,req,res,next)=>{
  console.error(err);
  if(res.headersSent)return next(err);
  res.status(500).json({error:"Something went wrong on the server."});
});

app.listen(PORT,()=>console.log(`IndiaStay API running at http://localhost:${PORT}`));
