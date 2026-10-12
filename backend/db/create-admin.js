require("../config/loadEnv")();
const bcrypt=require("bcryptjs");
const db=require("./database");
const email=String(process.env.ADMIN_EMAIL||"").trim().toLowerCase();
const password=String(process.env.ADMIN_PASSWORD||"");
const name=String(process.env.ADMIN_NAME||"IndiaStay Admin").trim();
if(!email||!password){console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD before running npm run create-admin");process.exit(1)}
const existing=db.prepare("SELECT id FROM users WHERE email=?").get(email);
if(existing){
  db.prepare("UPDATE users SET role='super_admin',active=1,name=?,password_hash=? WHERE id=?").run(name,bcrypt.hashSync(password,10),existing.id);
  console.log(`Updated super admin: ${email}`);
}else{
  db.prepare("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,'super_admin')").run(name,email,bcrypt.hashSync(password,10));
  console.log(`Created super admin: ${email}`);
}
