'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { buildUtmUrl } from '@/domain/utm';

type Workspace = { id:string; name:string; role:string; timezone:string };
type Site = { id:string; name:string; publicKey:string; domains:string[] };
type Campaign = { id:string; name:string; utmId:string; source:string; medium:string };
type Coupon = { id:string; campaignId:string; code:string; active:boolean };
type Summary = { model:string; verifiedAttributedRevenueVnd:number; couponRevenueVnd:number; unassignedRevenueVnd:number };
type Report = {
  context:{ generatedAt:string; timezone:string; model:string; windowDays:number; from:string; to:string };
  dataQuality:{ lastOrderImportAt:string|null; lastSpendImportAt:string|null; observedEventCount:number; spendRowCount:number };
  comparison:{ firstTouch:Summary; lastNonDirectTouch:Summary };
  totals:{ observedOrders:number; observedRevenueVnd:number; verifiedAttributionOrders:number;
    verifiedAttributedRevenueVnd:number; couponFallbackOrders:number; couponRevenueVnd:number;
    unassignedOrders:number; unassignedRevenueVnd:number; spendVnd:number; roas:number|null };
  campaigns:{ id:string; name:string; source:string; medium:string; verifiedAttributedRevenueVnd:number;
    couponRevenueVnd:number; spendVnd:number|null; roas:number|null }[];
  sources:{ source:string; basis:string; orders:number; revenue:number }[];
  funnel:Record<string,number>;
  orders:{ orderId:string; occurredAt:string; status:string; sourceLabel:string; netRevenueVnd:number;
    attribution:{basis:string} }[];
};
type Tab = 'overview'|'attribution'|'campaigns'|'imports'|'workspace';
const tabs:{id:Tab;label:string}[]=[
  {id:'overview',label:'Overview'},{id:'attribution',label:'Attribution'},
  {id:'campaigns',label:'Campaigns & UTM'},{id:'imports',label:'Orders & spend'},
  {id:'workspace',label:'Workspace setup'},
];
const money=(n:number)=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(n);
const count=(n:number)=>new Intl.NumberFormat('vi-VN').format(n);
const dateLabel=(value:string|null)=>value?new Date(value).toLocaleString('vi-VN'):'No completed import';
function initialDates(timezone:string){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'})
    .formatToParts(new Date());
  const part=(name:string)=>parts.find(item=>item.type===name)?.value??'';
  const today=part('year')+'-'+part('month')+'-'+part('day');
  return {from:today.slice(0,8)+'01',to:today};
}
async function request<T>(url:string,body?:unknown):Promise<T>{
  const response=await fetch(url,{method:body===undefined?'GET':'POST',
    headers:body===undefined?undefined:{'Content-Type':'application/json'},
    body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
  const data=await response.json() as T & {message?:string};
  if(!response.ok)throw new Error(data.message||'API request failed');
  return data;
}

export function ConsoleClient(){
  const {data:session,isPending}=authClient.useSession();
  const [tab,setTab]=useState<Tab>('overview');
  const [workspaces,setWorkspaces]=useState<Workspace[]>([]),[workspaceId,setWorkspaceId]=useState('');
  const [sites,setSites]=useState<Site[]>([]),[siteId,setSiteId]=useState('');
  const [campaigns,setCampaigns]=useState<Campaign[]>([]),[report,setReport]=useState<Report|null>(null);
  const [coupons,setCoupons]=useState<Coupon[]>([]);
  const [workspaceName,setWorkspaceName]=useState(''),[siteName,setSiteName]=useState(''),[domain,setDomain]=useState('localhost');
  const [name,setName]=useState(''),[utmId,setUtmId]=useState(''),[source,setSource]=useState('facebook'),[medium,setMedium]=useState('paid_social');
  const [from,setFrom]=useState(''),[to,setTo]=useState('');
  const [model,setModel]=useState<'first_touch'|'last_non_direct_touch'>('first_touch');
  const [windowDays,setWindowDays]=useState<1|7|30>(7);
  const [memberEmail,setMemberEmail]=useState(''),[memberRole,setMemberRole]=useState('analyst');
  const [kind,setKind]=useState<'orders'|'spend'>('orders'),[csv,setCsv]=useState('');
  const [preview,setPreview]=useState<{valid:boolean;count:number;digest:string;errors:{row:number;reason:string}[]}|null>(null);
  const [destination,setDestination]=useState(''),[campaignId,setCampaignId]=useState(''),[generatedUrl,setGeneratedUrl]=useState('');
  const [couponCampaignId,setCouponCampaignId]=useState(''),[couponCode,setCouponCode]=useState('');
  const [error,setError]=useState(''),[message,setMessage]=useState(''),[reportError,setReportError]=useState('');
  const [reportLoading,setReportLoading]=useState(false),[busy,setBusy]=useState(false),[refresh,setRefresh]=useState(0);
  const workspace=workspaces.find(w=>w.id===workspaceId);
  const site=sites.find(s=>s.id===siteId);
  const admin=workspace?.role==='admin';
  useEffect(()=>{
    const dates=initialDates(workspace?.timezone??'Asia/Ho_Chi_Minh');
    setFrom(dates.from);setTo(dates.to);
  },[workspace?.timezone]);
  const reloadWorkspaces=useCallback(async()=>setWorkspaces((await request<{workspaces:Workspace[]}>('/api/v1/workspaces')).workspaces),[]);
  const reloadSites=useCallback(async(id:string)=>setSites((await request<{sites:Site[]}>('/api/v1/sites?workspaceId='+encodeURIComponent(id))).sites),[]);
  const reloadCampaigns=useCallback(async(id:string)=>setCampaigns((await request<{campaigns:Campaign[]}>('/api/v1/campaigns?siteId='+encodeURIComponent(id))).campaigns),[]);
  const reloadCoupons=useCallback(async(id:string)=>setCoupons((await request<{coupons:Coupon[]}>('/api/v1/coupons?siteId='+encodeURIComponent(id))).coupons),[]);
  useEffect(()=>{if(session?.user)void reloadWorkspaces().catch(e=>setError(String(e)));},[session?.user,reloadWorkspaces]);
  useEffect(()=>{
    setSites([]);setSiteId('');setReport(null);setCampaigns([]);
    if(workspaceId)void reloadSites(workspaceId).catch(e=>setError(String(e)));
  },[workspaceId,reloadSites]);
  useEffect(()=>{
    setCampaigns([]);setCoupons([]);setPreview(null);setGeneratedUrl('');
    if(siteId)void Promise.all([reloadCampaigns(siteId),reloadCoupons(siteId)]).catch(e=>setError(String(e)));
  },[siteId,reloadCampaigns,reloadCoupons]);
  useEffect(()=>{
    if(!siteId||!from||!to){setReport(null);return;}
    if(to<from){setReport(null);setReportError('End date must be on or after start date.');return;}
    let active=true;
    setReportLoading(true);setReportError('');setReport(null);
    const params=new URLSearchParams({siteId,model,from,to,windowDays:String(windowDays)});
    void request<Report>('/api/v1/reports/overview?'+params).then(data=>{
      if(active)setReport(data);
    }).catch(e=>{if(active)setReportError(e instanceof Error?e.message:String(e));})
      .finally(()=>{if(active)setReportLoading(false);});
    return ()=>{active=false;};
  },[siteId,model,from,to,windowDays,refresh]);
  async function guarded(job:()=>Promise<void>){
    setError('');setMessage('');setBusy(true);
    try{await job();}catch(e){setError(e instanceof Error?e.message:'Unexpected error');}
    finally{setBusy(false);}
  }
  async function createWorkspace(e:FormEvent){e.preventDefault();await guarded(async()=>{
    const result=await request<{workspace:{id:string}}>('/api/v1/workspaces',{name:workspaceName});
    await reloadWorkspaces();setWorkspaceId(result.workspace.id);setWorkspaceName('');setTab('workspace');
    setMessage('Workspace created');
  });}
  async function createSite(e:FormEvent){e.preventDefault();await guarded(async()=>{
    const result=await request<{site:Site}>('/api/v1/sites',{workspaceId,name:siteName,domain});
    await reloadSites(workspaceId);setSiteId(result.site.id);setSiteName('');setMessage('Site created');
  });}
  async function addMember(e:FormEvent){e.preventDefault();await guarded(async()=>{
    await request('/api/v1/members',{workspaceId,email:memberEmail,role:memberRole});
    setMemberEmail('');setMessage('Member added');
  });}
  async function createCampaign(e:FormEvent){e.preventDefault();await guarded(async()=>{
    await request('/api/v1/campaigns',{siteId,name,utmId,source,medium});
    await reloadCampaigns(siteId);setName('');setUtmId('');setMessage('Campaign created');
  });}
  async function createCoupon(e:FormEvent){e.preventDefault();await guarded(async()=>{
    await request('/api/v1/coupons',{siteId,campaignId:couponCampaignId,code:couponCode.trim().toUpperCase()});
    await reloadCoupons(siteId);setCouponCode('');setMessage('Coupon mapping saved');
  });}
  async function validateCsv(){await guarded(async()=>{
    const result=await request<{valid:boolean;count:number;digest:string;errors:{row:number;reason:string}[]}>(
      '/api/v1/imports/'+kind+'/preview',{siteId,csv});
    setPreview(result);
  });}
  async function importCsv(){await guarded(async()=>{
    if(!preview?.valid)throw new Error('Preview and fix CSV errors before committing');
    const result=await request<{count:number;duplicate:boolean}>('/api/v1/imports/'+kind+'/commit',
      {siteId,csv,digest:preview.digest});
    setMessage(result.duplicate?'No change: identical import previously committed':result.count+' rows imported');
    setPreview(null);setRefresh(n=>n+1);
  });}
  function makeLink(e:FormEvent){e.preventDefault();setError('');setGeneratedUrl('');
    const selected=campaigns.find(c=>c.id===campaignId);
    if(!selected){setError('Choose a registered campaign');return;}
    try{
      const url=new URL(destination);
      if(site?.domains.length&&!site.domains.includes(url.hostname))throw new Error('Destination hostname is not registered for this site');
      setGeneratedUrl(buildUtmUrl(destination,{source:selected.source,medium:selected.medium,campaign:selected.utmId,id:selected.utmId}));
    }catch(e){setError(e instanceof Error?e.message:'Invalid destination URL');}
  }
  if(isPending)return <p role="status">Loading session...</p>;
  if(!session?.user)return <div className="stack-lg"><h1>Sign in required</h1><Link className="button button-primary" href="/login">Sign in</Link></div>;
  const exportQuery=new URLSearchParams({siteId,from,to,model,windowDays:String(windowDays)});
  const coverage=report&&report.totals.observedOrders>0
    ?Math.round(report.totals.verifiedAttributionOrders/report.totals.observedOrders*100):null;
  return <div className="console">
    <div className="console-heading"><div><p className="eyebrow">WORKSPACE / MEASUREMENT</p><h1>Attribution console</h1>
      <p>Audit trusted orders, campaign spend and consented touchpoints for one site.</p></div>
      <button type="button" className="button button-secondary" onClick={()=>void authClient.signOut().then(()=>location.assign('/login'))}>Sign out</button></div>
    <div className="console-context">
      <label>Workspace<select value={workspaceId} onChange={e=>{setWorkspaceId(e.target.value);setTab('overview');}}>
        <option value="">Choose workspace</option>{workspaces.map(w=><option value={w.id} key={w.id}>{w.name} ({w.role})</option>)}</select></label>
      <label>Site<select value={siteId} disabled={!workspaceId} onChange={e=>{setSiteId(e.target.value);setTab('overview');}}>
        <option value="">Choose site</option>{sites.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
      {workspace&&<p>{workspace.timezone} · VND · {admin?'Admin':'Read only'}</p>}
    </div>
    <nav className="console-tabs" aria-label="Console sections">
      {tabs.map(item=><button type="button" key={item.id} aria-current={tab===item.id?'page':undefined}
        className={tab===item.id?'console-tab active':'console-tab'} onClick={()=>setTab(item.id)}>{item.label}</button>)}
    </nav>
    {error&&<p className="error-message" role="alert">{error}</p>}
    {message&&<p role="status" className="method-note">{message}</p>}
    {tab==='workspace'&&<section className="panel console-section"><div className="section-heading"><div><h2>Workspace setup</h2>
      <p>Create a workspace, then register its site and grant access to existing users.</p></div></div>
      <form className="inline-form" onSubmit={createWorkspace}><label>New workspace<input minLength={2} required value={workspaceName}
        onChange={e=>setWorkspaceName(e.target.value)}/></label><button disabled={busy} className="button button-primary">Create workspace</button></form>
      {workspaceId&&<><h3>Sites</h3><div className="table-scroll"><table><thead><tr><th>Site</th><th>Allowed hostnames</th><th>Public key</th></tr></thead><tbody>
        {sites.map(s=><tr key={s.id}><td>{s.name}</td><td>{s.domains.join(', ')||'None'}</td><td><code>{s.publicKey}</code></td></tr>)}
        {!sites.length&&<tr><td colSpan={3}>No sites yet. Add one below.</td></tr>}</tbody></table></div>
        {admin&&<form className="inline-form" onSubmit={createSite}><label>Site name<input required value={siteName} onChange={e=>setSiteName(e.target.value)}/></label>
          <label>Allowed hostname<input required value={domain} onChange={e=>setDomain(e.target.value)}/></label>
          <button disabled={busy} className="button button-secondary">Add site</button></form>}
        {admin&&<form className="inline-form" onSubmit={addMember}><label>Add registered member email<input type="email" required value={memberEmail} onChange={e=>setMemberEmail(e.target.value)}/></label>
          <label>Role<select value={memberRole} onChange={e=>setMemberRole(e.target.value)}><option value="analyst">Analyst (read only)</option><option value="admin">Admin</option></select></label>
          <button disabled={busy} className="button button-secondary">Add member</button></form>}</>}
      {site&&<p className="micro-text">Public site key routes telemetry only. It does not grant access. <Link href={'/store?site_key='+encodeURIComponent(site.publicKey)}>Open consent sandbox</Link></p>}
    </section>}
    {tab!=='workspace'&&!workspaceId&&<section className="panel console-section"><h2>Choose or create a workspace</h2><p>Use Workspace setup to create a workspace before opening reports.</p>
      <button className="button button-primary" onClick={()=>setTab('workspace')}>Open workspace setup</button></section>}
    {tab!=='workspace'&&workspaceId&&!siteId&&<section className="panel console-section"><h2>Choose or add a site</h2><p>Reports and campaigns are always scoped to a site.</p>
      <button className="button button-primary" onClick={()=>setTab('workspace')}>Open site setup</button></section>}
    {siteId&&(tab==='overview'||tab==='attribution')&&<section className="console-section">
      <div className="section-heading"><div><h2>{tab==='overview'?'Site overview':'Attribution analysis'}</h2>
        <p>{tab==='overview'?'Trusted order totals and measurement coverage.':'Compare two models over the same order ledger.'}</p></div></div>
      <div className="report-controls">
        <label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label>
        <label>To<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
        <label>Model<select value={model} onChange={e=>setModel(e.target.value as typeof model)}><option value="first_touch">First touch</option><option value="last_non_direct_touch">Last non-direct</option></select></label>
        <label>Lookback<select value={windowDays} onChange={e=>setWindowDays(Number(e.target.value) as 1|7|30)}><option value={1}>1 day</option><option value={7}>7 days</option><option value={30}>30 days</option></select></label>
        <button type="button" className="button button-secondary" disabled={reportLoading} onClick={()=>setRefresh(n=>n+1)}>Refresh</button>
        {report&&<a className="button button-secondary" href={'/api/v1/reports/export?'+exportQuery}>Export orders CSV</a>}
      </div>
      {reportError&&<p role="alert" className="error-message">{reportError} <button type="button" onClick={()=>setRefresh(n=>n+1)}>Retry</button></p>}
      {reportLoading&&<p role="status" className="panel">Loading site report…</p>}
      {report&&!reportLoading&&<div className="report-stack">
        <p className="report-provenance">Order date: {report.context.from}–{report.context.to} · {report.context.timezone} · VND · {report.context.windowDays}-day lookback · Calculated {dateLabel(report.context.generatedAt)}</p>
        {tab==='overview'?<><div className="metrics">
          <div><span>Observed orders</span><strong>{count(report.totals.observedOrders)}</strong><small>Eligible trusted orders</small></div>
          <div><span>Observed revenue</span><strong>{money(report.totals.observedRevenueVnd)}</strong><small>Same total across models</small></div>
          <div><span>Verified attribution</span><strong>{money(report.totals.verifiedAttributedRevenueVnd)}</strong><small>{count(report.totals.verifiedAttributionOrders)} linked orders</small></div>
          <div><span>Coupon fallback</span><strong>{money(report.totals.couponRevenueVnd)}</strong><small>{count(report.totals.couponFallbackOrders)} orders, separate evidence</small></div>
          <div><span>Unassigned</span><strong>{money(report.totals.unassignedRevenueVnd)}</strong><small>{count(report.totals.unassignedOrders)} orders</small></div>
          <div><span>Spend / verified ROAS</span><strong>{money(report.totals.spendVnd)} / {report.totals.roas===null?'N/A':report.totals.roas.toFixed(2)+'×'}</strong><small>ROAS excludes coupon fallback</small></div>
        </div>
        <div className="console-grid"><section className="panel"><h3>Measurement coverage</h3>
          <p className="coverage-number">{coverage===null?'N/A':coverage+'%'}</p>
          <p>Share of eligible orders linked to a consented journey. Missing links remain visible as coupon fallback or unassigned.</p>
          <dl className="compact-facts"><div><dt>Last order import</dt><dd>{dateLabel(report.dataQuality.lastOrderImportAt)}</dd></div>
            <div><dt>Last spend import</dt><dd>{dateLabel(report.dataQuality.lastSpendImportAt)}</dd></div>
            <div><dt>Observed events in window</dt><dd>{count(report.dataQuality.observedEventCount)}</dd></div>
            <div><dt>Spend rows in window</dt><dd>{count(report.dataQuality.spendRowCount)}</dd></div></dl>
          {!report.dataQuality.lastOrderImportAt&&<p className="method-note">No order CSV has been committed for this site. Import trusted orders to produce an operational report.</p>}
        </section><section className="panel"><h3>Next analysis</h3><p>Switch models to see which eligible touch receives credit. Observed revenue stays fixed.</p>
          <button type="button" className="button button-primary" onClick={()=>setTab('attribution')}>Compare models</button>
          <div className="hairline"/><h3>Observed funnel events</h3>
          <p>Event counts are consented telemetry, not customer or order counts.</p>
          <dl className="compact-facts">{Object.entries(report.funnel).map(([event,value])=><div key={event}><dt>{event}</dt><dd>{count(value)}</dd></div>)}</dl></section></div>
        <section className="panel"><div className="section-heading"><h3>Campaign performance</h3><p>Verified journey credit; coupon credit is shown separately.</p></div>
          <div className="table-scroll"><table><thead><tr><th>Campaign</th><th>Source / medium</th><th>Verified credit</th><th>Coupon fallback</th><th>Spend</th><th>ROAS</th></tr></thead><tbody>
            {report.campaigns.map(c=><tr key={c.id}><td>{c.name}</td><td>{c.source} / {c.medium}</td>
              <td className="number">{money(c.verifiedAttributedRevenueVnd)}</td><td className="number">{money(c.couponRevenueVnd)}</td>
              <td className="number">{c.spendVnd===null?'N/A':money(c.spendVnd)}</td>
              <td className="number">{c.roas===null?'N/A':c.roas.toFixed(2)+'×'}</td></tr>)}
            {!report.campaigns.length&&<tr><td colSpan={6}>No campaigns registered. Add one in Campaigns & UTM.</td></tr>}
          </tbody></table></div></section></>:<>
          <section className="panel"><h3>Model comparison</h3><p>Both columns allocate the same observed orders. Do not add the columns together.</p>
            <div className="table-scroll"><table><thead><tr><th>Evidence bucket</th><th>First touch</th><th>Last non-direct</th></tr></thead><tbody>
              <tr><td>Verified journey credit</td><td className="number">{money(report.comparison.firstTouch.verifiedAttributedRevenueVnd)}</td><td className="number">{money(report.comparison.lastNonDirectTouch.verifiedAttributedRevenueVnd)}</td></tr>
              <tr><td>Coupon fallback</td><td className="number">{money(report.comparison.firstTouch.couponRevenueVnd)}</td><td className="number">{money(report.comparison.lastNonDirectTouch.couponRevenueVnd)}</td></tr>
              <tr><td>Unassigned revenue</td><td className="number">{money(report.comparison.firstTouch.unassignedRevenueVnd)}</td><td className="number">{money(report.comparison.lastNonDirectTouch.unassignedRevenueVnd)}</td></tr>
              <tr><th>Observed revenue</th><th className="number">{money(report.totals.observedRevenueVnd)}</th><th className="number">{money(report.totals.observedRevenueVnd)}</th></tr>
            </tbody></table></div></section>
          <section className="panel"><div className="section-heading"><h3>Acquisition credit</h3><p>One credit bucket per eligible order in the selected model.</p></div>
            <div className="table-scroll"><table><thead><tr><th>Source / campaign</th><th>Evidence</th><th>Orders</th><th>Revenue</th></tr></thead><tbody>
              {report.sources.map((s,i)=><tr key={i}><td>{s.source}</td><td>{s.basis}</td><td className="number">{count(s.orders)}</td><td className="number">{money(s.revenue)}</td></tr>)}
              {!report.sources.length&&<tr><td colSpan={4}>No eligible orders in this date range.</td></tr>}</tbody></table></div></section>
          <section className="panel"><div className="section-heading"><h3>Order provenance</h3><p>Trusted imports control status and revenue; browser events cannot create orders.</p></div>
            <div className="table-scroll"><table><thead><tr><th>Order</th><th>Ordered at</th><th>Status</th><th>Credited source</th><th>Evidence</th><th>Net revenue</th></tr></thead><tbody>
              {report.orders.map(o=><tr key={o.orderId}><td>{o.orderId}</td><td>{dateLabel(o.occurredAt)}</td><td>{o.status}</td><td>{o.sourceLabel}</td>
                <td>{o.attribution.basis}</td><td className="number">{money(o.netRevenueVnd)}</td></tr>)}
              {!report.orders.length&&<tr><td colSpan={6}>No trusted orders for this date range.</td></tr>}</tbody></table></div></section>
        </>}
        <p className="micro-text">Rule-based attribution explains allocation. It does not measure incremental lift or prove every customer journey was observed.</p>
      </div>}
    </section>}
    {siteId&&tab==='campaigns'&&<div className="report-stack console-section">
      <section className="panel"><div className="section-heading"><div><h2>Campaign registry</h2><p>Stable UTM IDs connect tagged visits and imported campaign spend.</p></div></div>
        <div className="table-scroll"><table><thead><tr><th>Campaign</th><th>Source</th><th>Medium</th><th>UTM ID</th></tr></thead><tbody>
          {campaigns.map(c=><tr key={c.id}><td>{c.name}</td><td>{c.source}</td><td>{c.medium}</td><td><code>{c.utmId}</code></td></tr>)}
          {!campaigns.length&&<tr><td colSpan={4}>No campaigns yet. An admin can create the first one below.</td></tr>}</tbody></table></div>
        {admin?<form onSubmit={createCampaign} className="form-grid form-stack"><label>Campaign name<input required value={name} onChange={e=>setName(e.target.value)}/></label>
          <label>UTM ID<input required value={utmId} onChange={e=>setUtmId(e.target.value)}/></label>
          <label>Source<input required value={source} onChange={e=>setSource(e.target.value)}/></label>
          <label>Medium<input required value={medium} onChange={e=>setMedium(e.target.value)}/></label>
          <button disabled={busy} className="button button-secondary">Save campaign</button></form>:<p>Read-only access: ask a workspace admin to register a campaign.</p>}
      </section>
      <section className="panel"><h2>Build a registered UTM link</h2><p>The link uses a saved campaign. It is generated locally and can be copied into your campaign workflow.</p>
        <form className="inline-form" onSubmit={makeLink}><label>Destination URL<input type="url" required placeholder="https://example.com/product"
          value={destination} onChange={e=>{setDestination(e.target.value);setGeneratedUrl('');}}/></label>
          <label>Registered campaign<select required value={campaignId} onChange={e=>{setCampaignId(e.target.value);setGeneratedUrl('');}}>
            <option value="">Choose campaign</option>{campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <button className="button button-primary" disabled={!campaigns.length}>Build UTM link</button></form>
        {generatedUrl&&<div className="link-result"><label>Generated URL<input readOnly value={generatedUrl} onFocus={e=>e.target.select()}/></label>
          <button type="button" className="button button-secondary" onClick={()=>void navigator.clipboard.writeText(generatedUrl)
            .then(()=>setMessage('UTM link copied')).catch(()=>setError('Select and copy the URL manually'))}>Copy URL</button></div>}
      </section>
      <section className="panel"><h2>Coupon fallback mapping</h2>
        <p>A unique registered code can assign fallback credit only when no verified journey exists. It remains separate from verified attribution.</p>
        <div className="table-scroll"><table><thead><tr><th>Code</th><th>Campaign</th><th>Status</th></tr></thead><tbody>
          {coupons.map(c=><tr key={c.id}><td><code>{c.code}</code></td><td>{campaigns.find(x=>x.id===c.campaignId)?.name??'Unknown campaign'}</td>
            <td>{c.active?'Active':'Inactive'}</td></tr>)}
          {!coupons.length&&<tr><td colSpan={3}>No coupon mappings for this site.</td></tr>}</tbody></table></div>
        {admin&&<form className="inline-form" onSubmit={createCoupon}><label>Coupon code<input required minLength={2} maxLength={90} value={couponCode}
          onChange={e=>setCouponCode(e.target.value.toUpperCase())}/></label>
          <label>Campaign<select required value={couponCampaignId} onChange={e=>setCouponCampaignId(e.target.value)}>
            <option value="">Choose campaign</option>{campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <button disabled={!campaigns.length||busy} className="button button-secondary">Save coupon mapping</button></form>}
      </section>
    </div>}
    {siteId&&tab==='imports'&&<section className="panel console-section"><div className="section-heading"><div><h2>Trusted data imports</h2>
      <p>Preview validates rows. Only an admin can commit order or spend data to this site.</p></div></div>
      {admin?<><label>Import kind<select value={kind} onChange={e=>{setKind(e.target.value as 'orders'|'spend');setCsv('');setPreview(null);}}>
        <option value="orders">Orders</option><option value="spend">Ad spend</option></select></label>
        <p className="micro-text">{kind==='orders'?'Required columns: order_id, ordered_at, status, currency, gross_item_revenue, discount_amount, refunded_amount, checkout_token, discount_code.':
          'Required columns: row_key, campaign_id, spend_date, currency, amount.'} Maximum 5,000 rows and 1 MB.</p>
        <label>Upload CSV file<input type="file" accept=".csv,text/csv" onChange={e=>{
          const file=e.target.files?.[0];if(!file)return;
          if(file.size>1_000_000){setError('CSV file exceeds the 1 MB limit');return;}
          void file.text().then(value=>{setCsv(value);setPreview(null);setError('');}).catch(()=>setError('Could not read the CSV file'));
        }}/></label>
        <label>CSV data<textarea rows={8} value={csv} onChange={e=>{setCsv(e.target.value);setPreview(null);}}/></label>
        <div className="action-row"><button type="button" disabled={!csv||busy} className="button button-secondary" onClick={()=>void validateCsv()}>Preview CSV</button>
          <button type="button" disabled={!preview?.valid||busy} className="button button-primary" onClick={()=>void importCsv()}>Commit import</button></div>
        {preview&&<div role="status" className={preview.valid?'preview-result':'error-message'}><strong>{preview.count} rows, {preview.valid?'ready':'invalid'}</strong>
          {preview.errors.map((x,i)=><p key={i}>Row {x.row}: {x.reason}</p>)}</div>}</>:<p>Read-only access: only a workspace admin may import transactions.</p>}
    </section>}
  </div>;
}
