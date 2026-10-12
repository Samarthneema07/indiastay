const fs=require("fs"),path=require("path");
function loadEnv(file=path.join(__dirname,"..",".env")){
  if(!fs.existsSync(file))return;
  for(const raw of fs.readFileSync(file,"utf8").split(/\r?\n/)){
    const line=raw.trim();
    if(!line||line.startsWith("#"))continue;
    const i=line.indexOf("="); if(i<1)continue;
    const key=line.slice(0,i).trim(), value=line.slice(i+1).trim().replace(/^['"]|['"]$/g,"");
    if(process.env[key]===undefined)process.env[key]=value;
  }
}
module.exports=loadEnv;
