'use strict';
const {send,valid,setSession,sameSecret,sameOrigin}=require('../lib/pal-server');
module.exports=async(req,res)=>{
 try{
  if(req.method==='GET')return send(res,200,{authenticated:valid(req)});
  if(req.method!=='POST')return send(res,405,{error:'Methode nicht erlaubt'});
  if(!sameOrigin(req))return send(res,403,{error:'Ungültiger Ursprung'});
  const code=req.body?.code;
  if(typeof code!=='string'||code.length>256||!sameSecret(code))return send(res,401,{error:'Zugangscode stimmt nicht'});
  setSession(res);return send(res,200,{authenticated:true});
 }catch(e){console.error('PAL auth',e.message);return send(res,500,{error:'Server nicht vollständig eingerichtet'})}
};
