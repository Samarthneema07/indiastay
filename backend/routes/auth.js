const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/database");
const { JWT_SECRET } = require("../middleware/requireAuth");

const router = express.Router();

function publicUser(u) {
  return { id:u.id, name:u.name, email:u.email, role:u.role || "guest" };
}
function sign(user) {
  return jwt.sign({ userId:user.id, role:user.role }, JWT_SECRET, { expiresIn:"7d" });
}

router.post("/signup", (req,res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!name || !email || !password) return res.status(400).json({error:"Name, email and password are all required."});
  if (password.length < 6) return res.status(400).json({error:"Password must be at least 6 characters."});
  const existing = db.prepare("SELECT id FROM users WHERE email=?").get(email);
  if (existing) return res.status(409).json({error:"An account with that email already exists."});
  const hash = bcrypt.hashSync(password,10);
  const result = db.prepare("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,'guest')").run(name,email,hash);
  const user = db.prepare("SELECT id,name,email,role FROM users WHERE id=?").get(result.lastInsertRowid);
  res.status(201).json({token:sign(user),user:publicUser(user)});
});

router.post("/login",(req,res) => {
  const email=String(req.body.email||"").trim().toLowerCase();
  const password=String(req.body.password||"");
  const user=db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!user || !user.active || !bcrypt.compareSync(password,user.password_hash)) return res.status(401).json({error:"Incorrect email or password."});
  res.json({token:sign(user),user:publicUser(user)});
});

router.get("/me", require("./../middleware/requireAuth").requireAuth, (req,res)=>res.json({user:publicUser(req.user)}));

module.exports=router;
