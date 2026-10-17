'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getConsent, setConsent, track } from '@/tracker/client';
export function StoreClient(){
  const search=useSearchParams();
  const key=search.get('site_key')||'';
  const [choice,choose]=useState<'accepted'|'rejected'|'unset'>('unset');
  const [status,setStatus]=useState('No events collected');
  const configuration={siteKey:key,collectorUrl:'/api/v1/collect',policyVersion:'demo-1'};
  useEffect(()=>{choose(getConsent());},[]);
  async function update(value:'accepted'|'rejected'){
    setConsent(value,configuration);choose(value);
    if(value==='accepted'&&key){const result=await track('page_view');setStatus(result.sent?'Page view delivered':'Collector rejected event');}
    else setStatus('No analytics event sent');
  }
  async function event(name:'view_item'|'add_to_cart'|'begin_checkout'){
    try{const result=await track(name,{product_id:'demo-laptop'});setStatus(result.sent?name+' delivered':'Collector rejected event');}
    catch{setStatus('Collector request failed');}
  }
  return <div className="stack-lg">
    <div className="eyebrow">SANDBOX / DEMO COMMERCE</div>
    <div className="heading-large"><h1>Demo Laptop</h1><p>Không xử lý thanh toán. Sử dụng site key từ một site đã tạo để thử API tracking.</p></div>
    {!key && <p className="method-note">Chưa có site_key trong URL, không gửi event. Cấu hình site domain localhost trước.</p>}
    <section className="panel">
      <h2>Analytics consent</h2>
      <p>Chỉ thu thập hoạt động truy cập sau khi bạn chọn đồng ý. Có thể từ chối hoặc rút lại bất cứ lúc nào.</p>
      <p>Current choice: <strong>{choice}</strong></p>
      <div className="action-row">
        <button className="button button-primary" onClick={()=>void update('accepted')}>Accept analytics</button>
        <button className="button button-secondary" onClick={()=>void update('rejected')}>Reject / revoke analytics</button>
      </div>
    </section>
    <section className="panel"><h2>Try tracked interactions</h2><p>These buttons issue optional analytics events only if you opted in.</p>
      <div className="action-row">
        <button className="button button-secondary" onClick={()=>void event('view_item')}>View item</button>
        <button className="button button-secondary" onClick={()=>void event('add_to_cart')}>Add to cart</button>
        <button className="button button-secondary" onClick={()=>void event('begin_checkout')}>Begin checkout</button>
      </div>
      <p role="status">{status}</p>
    </section>
  </div>;
}
