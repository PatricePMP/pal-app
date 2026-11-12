'use strict';
const {send,clearSession,sameOrigin}=require('../lib/pal-server');
module.exports=(req,res)=>{if(req.method!=='POST')return send(res,405,{error:'Methode nicht erlaubt'});if(!sameOrigin(req))return send(res,403,{error:'Ungültiger Ursprung'});clearSession(res);return send(res,200,{ok:true})};
