'use client';

// Opt-in only tracking utility. Untrusted first-party telemetry; it never books revenue.
// Do not call init or track until a visitor chooses "Accept analytics".
const STORAGE_KEY='mal_analytics_consent';
const VISITOR_KEY='mal_visitor_id';
const SESSION_KEY='mal_session';
const LAST_KEY='mal_last_active';
const SESSION_TTL=30*60*1000;
export interface TrackerConfig { siteKey:string; collectorUrl:string; policyVersion:string }
let enabled=false;
let config:TrackerConfig|null=null;
export function getConsent(): 'accepted'|'rejected'|'unset' {
  if(typeof window==='undefined')return 'unset';
  const result=localStorage.getItem(STORAGE_KEY);
  return result==='accepted'||result==='rejected'?result:'unset';
}
export function setConsent(value:'accepted'|'rejected',nextConfig:TrackerConfig){
  if(typeof window==='undefined')return;
  localStorage.setItem(STORAGE_KEY,value);
  config=nextConfig;enabled=value==='accepted';
  if(!enabled){
    localStorage.removeItem(VISITOR_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(LAST_KEY);
  }
}
function getOrCreateId(storage:Storage,key:string){
  let value=storage.getItem(key);
  if(!value){value=crypto.randomUUID();storage.setItem(key,value);}
  return value;
}
export async function track(name:'page_view'|'view_item'|'add_to_cart'|'begin_checkout',properties:Record<string,string|number|boolean>={}){
  if(!enabled||!config||getConsent()!=='accepted'||typeof window==='undefined')return {sent:false};
  const last=Number(sessionStorage.getItem(LAST_KEY)||0);
  if(Date.now()-last>SESSION_TTL)sessionStorage.removeItem(SESSION_KEY);
  const visitorId=getOrCreateId(localStorage,VISITOR_KEY);
  const sessionId=getOrCreateId(sessionStorage,SESSION_KEY);
  sessionStorage.setItem(LAST_KEY,String(Date.now()));
  const url=new URL(window.location.href);
  const utm={source:url.searchParams.get('utm_source')||undefined,medium:url.searchParams.get('utm_medium')||undefined,
    campaign:url.searchParams.get('utm_campaign')||undefined,id:url.searchParams.get('utm_id')||undefined};
  const event={site_key:config.siteKey,event_id:crypto.randomUUID(),visitor_id:visitorId,session_id:sessionId,
    event_name:name,occurred_at:new Date().toISOString(),page_path:url.pathname,
    utm,properties,consent:{analytics:true,policy_version:config.policyVersion}};
  const endpoint=new URL(config.collectorUrl,window.location.href);
  endpoint.searchParams.set('site_key',config.siteKey);
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(event),keepalive:true});
  return {sent:response.ok};
}
