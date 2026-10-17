'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

type Workspace={id:string;name:string;role:string;timezone:string};
type Site={id:string;name:string;publicKey:string};
type Campaign={id:string;name:string;utmId:string;source:string;medium:string};
type Report={
  context:{generatedAt:string;timezone:string;model:string};
  totals:{observedOrders:number;observedRevenueVnd:number;verifiedAttributedRevenueVnd:number;unassignedOrders:number;spendVnd:number;roas:number|null};
  campaigns:{id:string;name:string;attributedRevenueVnd:number;spendVnd:number|null;roas:number|null}[];
  orders:{orderId:string;sourceLabel:string;netRevenueVnd:number;attribution:{basis:string}}[];
};
const money=(n:number)=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(n);
async function request<T>(url:string,body?:unknown):Promise<T>{
  const response=await fetch(url,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:undefined,
    body:body?JSON.stringify(body):undefined,cache:'no-store'});
  const data=await response.json() as T & {message?:string};
  if(!response.ok)throw new Error(data.message||'API request failed');
  return data;
}
export function ConsoleClient(){
  const {data:session,isPending}=authClient.useSession();
  const [workspaces,setWorkspaces]=useState<Workspace[]>([]),[workspaceId,setWorkspaceId]=useState('');
  const [sites,setSites]=useState<Site[]>([]),[siteId,setSiteId]=useState('');
  const [campaigns,setCampaigns]=useState<Campaign[]>([]),[report,setReport]=useState<Report|null>(null);
  const [workspaceName,setWorkspaceName]=useState(''),[siteName,setSiteName]=useState(''),[domain,setDomain]=useState('localhost');
  const [name,setName]=useState(''),[utmId,setUtmId]=useState(''),[source,setSource]=useState('facebook'),[medium,setMedium]=useState('paid_social');
  const [from,setFrom]=useState('2026-10-01'),[to,setTo]=useState('2026-10-31'),[model,setModel]=useState('first_touch');
  const [kind,setKind]=useState<'orders'|'spend'>('orders'),[csv,setCsv]=useState(''),[digest,setDigest]=useState('');
  const [preview,setPreview]=useState<{valid:boolean;count:number;errors:{row:number;reason:string}[]}|null>(null);
  const [error,setError]=useState(''),[message,setMessage]=useState('');
  const admin=workspaces.find(w=>w.id===workspaceId)?.role==='admin';
  const reloadWorkspaces=useCallback(async()=>setWorkspaces((await request<{workspaces:Workspace[]}>('/api/v1/workspaces')).workspaces),[]);
  const reloadSites=useCallback(async(id:string)=>setSites((await request<{sites:Site[]}>('/api/v1/sites?workspaceId='+encodeURIComponent(id))).sites),[]);
  const reloadCampaigns=useCallback(async(id:string)=>setCampaigns((await request<{campaigns:Campaign[]}>('/api/v1/campaigns?siteId='+encodeURIComponent(id))).campaigns),[]);
  const loadReport=useCallback(async(id:string,m:string)=>{
    const params=new URLSearchParams({siteId:id,model:m,from,to,windowDays:'7'});
    setReport(await request<Report>('/api/v1/reports/overview?'+params.toString()));
  },[from,to]);
  useEffect(()=>{if(session?.user)void reloadWorkspaces().catch(e=>setError(String(e)));},[session?.user,reloadWorkspaces]);
  useEffect(()=>{if(workspaceId)void reloadSites(workspaceId).catch(e=>setError(String(e)));else setSites([]);setSiteId('');},[workspaceId,reloadSites]);
  useEffect(()=>{if(siteId)void reloadCampaigns(siteId).catch(e=>setError(String(e)));else setCampaigns([]);},[siteId,reloadCampaigns]);
  useEffect(()=>{if(siteId)void loadReport(siteId,model).catch(e=>setError(String(e)));else setReport(null);},[siteId,model,loadReport]);
  async function guarded(job:()=>Promise<void>){setError('');setMessage('');try{await job();}catch(e){setError(e instanceof Error?e.message:'Unexpected error');}}
  async function createWorkspace(e:FormEvent){e.preventDefault();await guarded(async()=>{
    const result=await request<{workspace:{id:string}}>('/api/v1/workspaces',{name:workspaceName});
    await reloadWorkspaces();setWorkspaceId(result.workspace.id);setMessage('Workspace created');setWorkspaceName('');
  });}
  async function createSite(e:FormEvent){e.preventDefault();await guarded(async()=>{
    const result=await request<{site:Site}>('/api/v1/sites',{workspaceId,name:siteName,domain});
    await reloadSites(workspaceId);setSiteId(result.site.id);setSiteName('');setMessage('Site created');
  });}
  async function createCampaign(e:FormEvent){e.preventDefault();await guarded(async()=>{
    await request('/api/v1/campaigns',{siteId,name,utmId,source,medium});await reloadCampaigns(siteId);setMessage('Campaign created');setName('');setUtmId('');
  });}
  async function validateCsv(){await guarded(async()=>{
    const p=await request<{valid:boolean;count:number;digest:string;errors:{row:number;reason:string}[]}>('/api/v1/imports/'+kind+'/preview',{siteId,csv});
    setPreview(p);setDigest(p.digest);
  });}
  async function importCsv(){await guarded(async()=>{
    if(!preview?.valid)throw new Error('Preview and fix CSV errors before committing');
    const result=await request<{count:number;duplicate:boolean}>('/api/v1/imports/'+kind+'/commit',{siteId,csv,digest});
    setMessage(result.duplicate?'No change: identical import previously committed':result.count+' rows imported');
    setPreview(null);setDigest('');await loadReport(siteId,model);
  });}
  if(isPending)return <p role="status">Loading session...</p>;
  if(!session?.user)return <div className="stack-lg"><h1>Sign in required</h1><Link className="button button-primary" href="/login">Sign in</Link></div>;
  const site=sites.find(s=>s.id===siteId);
  return <div className="stack-lg"><div className="eyebrow">PRIVATE / DATA-BACKED CONSOLE</div>
    <div className="section-heading heading-large"><div><h1>Marketing measurement.</h1><p>Site-scoped operations. Attribution values exist only after trusted imports.</p></div>
      <button type="button" className="button button-secondary" onClick={()=>void authClient.signOut().then(()=>location.assign('/login'))}>Sign out</button></div>
    {error&&<p className="error-message" role="alert">{error}</p>}{message&&<p role="status" className="method-note">{message}</p>}
    <section className="panel"><h2>1. Workspace and site</h2>
      <label>Workspace<select value={workspaceId} onChange={e=>{setWorkspaceId(e.target.value);setSiteId('');}}>
        <option value="">Choose</option>{workspaces.map(w=><option value={w.id} key={w.id}>{w.name} ({w.role})</option>)}</select></label>
      <form className="inline-form" onSubmit={createWorkspace}><label>New workspace<input minLength={2} required value={workspaceName} onChange={e=>setWorkspaceName(e.target.value)}/></label>
        <button className="button button-primary">Create workspace</button></form>
      {workspaceId&&<><label>Site<select value={siteId} onChange={e=>setSiteId(e.target.value)}>
        <option value="">Choose</option>{sites.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
        {admin&&<form className="inline-form" onSubmit={createSite}><label>Site name<input required value={siteName} onChange={e=>setSiteName(e.target.value)}/></label>
          <label>Allowed hostname<input required value={domain} onChange={e=>setDomain(e.target.value)}/></label>
          <button className="button button-secondary">Add site</button></form>}</>}
      {site&&<p className="micro-text">Public site key: <code>{site.publicKey}</code> · <Link href={'/store?site_key='+encodeURIComponent(site.publicKey)}>Open tracking sandbox</Link></p>}
    </section>
    {siteId&&<><section className="panel"><h2>2. Campaign registry</h2>
      <div className="table-scroll"><table><thead><tr><th>Campaign</th><th>Source</th><th>Medium</th><th>UTM ID</th></tr></thead><tbody>
        {campaigns.map(c=><tr key={c.id}><td>{c.name}</td><td>{c.source}</td><td>{c.medium}</td><td>{c.utmId}</td></tr>)}
        {campaigns.length===0&&<tr><td colSpan={4}>No campaigns. Create one to map spend and UTM traffic.</td></tr>}
      </tbody></table></div>
      {admin&&<form onSubmit={createCampaign} className="form-grid form-stack">
        <label>Campaign name<input required value={name} onChange={e=>setName(e.target.value)}/></label>
        <label>UTM ID<input required value={utmId} onChange={e=>setUtmId(e.target.value)}/></label>
        <label>Source<input required value={source} onChange={e=>setSource(e.target.value)}/></label>
        <label>Medium<input required value={medium} onChange={e=>setMedium(e.target.value)}/></label>
        <button className="button button-secondary">Save campaign</button>
      </form>}</section>
      <section className="panel"><h2>3. Trusted data imports</h2><p>Preview validates CSV rows before the admin can commit.</p>
        {admin?<><label>Import kind<select value={kind} onChange={e=>{setKind(e.target.value as 'orders'|'spend');setPreview(null);}}>
          <option value="orders">Orders</option><option value="spend">Ad spend</option></select></label>
          <label>CSV data<textarea rows={6} value={csv} onChange={e=>{setCsv(e.target.value);setPreview(null);}}/></label>
          <div className="action-row"><button type="button" disabled={!csv} className="button button-secondary" onClick={()=>void validateCsv()}>Preview CSV</button>
            <button type="button" disabled={!preview?.valid} className="button button-primary" onClick={()=>void importCsv()}>Commit import</button></div>
          {preview&&<div role="status"><p>{preview.count} rows, {preview.valid?'ready':'invalid'}</p>
            {preview.errors.map((x,i)=><p key={i} className="error-message">Row {x.row}: {x.reason}</p>)}</div>}</>:<p>Read-only member: only an admin may import transactions.</p>}
      </section>
      <section className="panel"><h2>4. Attribution and campaign performance</h2>
        <div className="control-bar">
          <label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label>
          <label>To<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
          <label>Model<select value={model} onChange={e=>setModel(e.target.value)}><option value="first_touch">First-touch</option><option value="last_non_direct_touch">Last-non-direct</option></select></label>
          <button type="button" className="button button-secondary" onClick={()=>void guarded(()=>loadReport(siteId,model))}>Refresh</button>
          <a className="button button-secondary" href={'/api/v1/reports/export?'+new URLSearchParams({siteId,from,to,model}).toString()}>Export CSV</a>
        </div>
        {!report?<p>No reporting data loaded. Correct any API error above.</p>:<>
          <div className="metrics">
            <div><span>Observed orders</span><strong>{report.totals.observedOrders}</strong></div>
            <div><span>Observed revenue</span><strong>{money(report.totals.observedRevenueVnd)}</strong></div>
            <div><span>Verified attributed</span><strong>{money(report.totals.verifiedAttributedRevenueVnd)}</strong></div>
            <div><span>Unassigned</span><strong>{report.totals.unassignedOrders}</strong></div>
            <div><span>Spend</span><strong>{money(report.totals.spendVnd)}</strong></div>
            <div><span>Attributed ROAS</span><strong>{report.totals.roas===null?'N/A':report.totals.roas.toFixed(2)+'x'}</strong></div>
          </div>
          <div className="section-heading"><h3>Campaign breakdown</h3><p>Rule-based credit, not incrementality.</p></div>
          <div className="table-scroll"><table><thead><tr><th>Campaign</th><th>Attribution revenue</th><th>Spend</th><th>ROAS</th></tr></thead><tbody>
            {report.campaigns.map(c=><tr key={c.id}><td>{c.name}</td><td className="number">{money(c.attributedRevenueVnd)}</td>
              <td className="number">{c.spendVnd===null?'N/A':money(c.spendVnd)}</td><td className="number">{c.roas===null?'N/A':c.roas.toFixed(2)+'x'}</td></tr>)}
          </tbody></table></div>
          <div className="section-heading"><h3>Source provenance</h3><p>Trusted orders only.</p></div>
          <div className="table-scroll"><table><thead><tr><th>Order</th><th>Attributed source</th><th>Evidence</th><th>Net revenue</th></tr></thead><tbody>
            {report.orders.map(o=><tr key={o.orderId}><td>{o.orderId}</td><td>{o.sourceLabel}</td><td>{o.attribution.basis}</td><td className="number">{money(o.netRevenueVnd)}</td></tr>)}
            {report.orders.length===0&&<tr><td colSpan={4}>No trusted orders for selected date range.</td></tr>}
          </tbody></table></div>
          <p className="micro-text">{report.context.timezone} · VND · order-date basis · {report.context.model} · Calculated {new Date(report.context.generatedAt).toLocaleString('vi-VN')}</p>
        </>}
      </section></>}
  </div>;
}
