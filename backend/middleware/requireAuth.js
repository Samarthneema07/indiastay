const jwt = require("jsonwebtoken");
const db = require("../db/database");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-this-in-production";

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Log in to do that." });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare("SELECT id,name,email,role,active FROM users WHERE id=?").get(payload.userId);
    if (!user || !user.active) return res.status(401).json({ error: "Your account is inactive." });
    req.userId = user.id;
    req.user = user;
    next();
  } catch (_) {
    return res.status(401).json({ error: "Your session has expired. Please log in again." });
  }
}

function requireRole(...roles) {
  return (req,res,next) => {
    if (!req.user) return res.status(401).json({error:"Authentication required."});
    if (!roles.includes(req.user.role)) return res.status(403).json({error:"You do not have permission to access this area."});
    next();
  };
}

module.exports = { requireAuth, requireRole, JWT_SECRET };
