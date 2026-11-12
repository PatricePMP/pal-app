'use strict';
const crypto=require('node:crypto');
const COOKIE='pal_session';
const MAX_BYTES=3_500_000;
function env(name){const v=process.env[name];if(!v)throw new Error(`Server-Konfiguration fehlt: ${name}`);return v}
function send(res,status,data){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data))}
function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(x=>{const p=x.trim().indexOf('=');return p<0?['','']:[x.trim().slice(0,p),x.trim().slice(p+1)]}))}
function sign(value){return crypto.createHmac('sha256',env('PAL_SESSION_SECRET')).update(value).digest('hex')}
function valid(req){const c=cookies(req)[COOKIE];if(!c)return false;const [expiry,sig]=c.split('.');if(!/^\d+$/.test(expiry||'')||!sig||Number(expiry)<Date.now())return false;const expected=sign(expiry);const a=Buffer.from(sig,'utf8'),b=Buffer.from(expected,'utf8');return a.length===b.length&&crypto.timingSafeEqual(a,b)}
function setSession(res){const expiry=String(Date.now()+30*86400000);const signature=sign(expiry);res.setHeader('Set-Cookie',`${COOKIE}=${expiry}.${signature}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${30*86400}`)}
function clearSession(res){res.setHeader('Set-Cookie',`${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`)}
function sameSecret(input){const expected=env('PAL_ACCESS_CODE');const a=crypto.createHash('sha256').update(input).digest(),b=crypto.createHash('sha256').update(expected).digest();return crypto.timingSafeEqual(a,b)}
function sameOrigin(req){const origin=req.headers.origin;if(!origin)return false;try{return new URL(origin).host===req.headers.host&&new URL(origin).protocol==='https:'}catch{return false}}
async function database(path,options={}){
 const base=env('SUPABASE_URL').replace(/\/$/,'');const secret=env('SUPABASE_SERVICE_ROLE_KEY');
 const response=await fetch(base+'/rest/v1/'+path,{...options,headers:{apikey:secret,Authorization:`Bearer ${secret}`,Accept:'application/json',...(options.headers||{})}});
 const txt=await response.text();let data;try{data=txt?JSON.parse(txt):null}catch{data=txt}
 if(!response.ok){console.error('PAL DB error',response.status,JSON.stringify(data).slice(0,600));throw new Error('Datenbankanfrage fehlgeschlagen')}
 return data;
}
module.exports={send,valid,setSession,clearSession,sameSecret,sameOrigin,database,MAX_BYTES};
