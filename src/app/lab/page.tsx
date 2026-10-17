'use client';

import { useMemo, useState } from 'react';
import { attributeOrder, calculateRoas, type AttributionModel, type TrustedOrder, type Touchpoint } from '@/domain/attribution';

const touchpoints: Touchpoint[] = [
  { id: 'T-001', siteId: 'demo-store', visitorId: 'demo-visitor', occurredAt: '2026-10-01T09:00:00Z', consented: true, source: 'Facebook', medium: 'paid_social', campaignId: 'facebook-autumn', isDirect: false },
  { id: 'T-002', siteId: 'demo-store', visitorId: 'demo-visitor', occurredAt: '2026-10-03T10:00:00Z', consented: true, source: 'Google', medium: 'cpc', campaignId: 'google-branded', isDirect: false },
  { id: 'T-003', siteId: 'demo-store', visitorId: 'demo-visitor', occurredAt: '2026-10-05T11:00:00Z', consented: true, source: null, medium: null, campaignId: null, isDirect: true },
];
const baseOrder: TrustedOrder = { id: 'ORD-A', siteId: 'demo-store', orderedAt: '2026-10-06T12:00:00Z', status: 'paid', netRevenueVnd: 900000, verifiedVisitorId: 'demo-visitor' };
const money = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

export default function AttributionLabPage() {
  const [model, setModel] = useState<AttributionModel>('first_touch');
  const [windowDays, setWindowDays] = useState<1 | 7 | 30>(7);
  const [linked, setLinked] = useState(true);
  const order = useMemo(() => ({ ...baseOrder, verifiedVisitorId: linked ? 'demo-visitor' : null }), [linked]);
  const attribution = useMemo(() => attributeOrder(order, touchpoints, model, windowDays), [order, model, windowDays]);
  const first = attributeOrder(order, touchpoints, 'first_touch', windowDays);
  const last = attributeOrder(order, touchpoints, 'last_non_direct_touch', windowDays);
  const winningSource = attribution.basis === 'unassigned' ? 'Unassigned' : attribution.source ?? 'Unknown';
  const roas = attribution.campaignId === 'facebook-autumn' ? calculateRoas(attribution.attributedRevenueVnd, 300000) : null;

  return <div className="stack-lg">
    <div className="eyebrow">WORKBENCH / ATTRIBUTION / GOLDEN FIXTURE</div>
    <div className="section-heading heading-large"><div><h1>One order. Two attribution stories.</h1><p>Thay đổi model và cửa sổ attribution để xem credit biến đổi, trong khi doanh thu đơn hàng vẫn không đổi.</p></div><span className="tag tag-demo">DEMO DATA · FIXED SCENARIO</span></div>
    <section className="control-bar" aria-label="Attribution controls">
      <label>Attribution model <select value={model} onChange={e => setModel(e.target.value as AttributionModel)}><option value="first_touch">First-touch</option><option value="last_non_direct_touch">Last-non-direct-touch</option></select></label>
      <label>Lookback window <select value={windowDays} onChange={e => setWindowDays(Number(e.target.value) as 1 | 7 | 30)}><option value="1">1 day</option><option value="7">7 days</option><option value="30">30 days</option></select></label>
      <label className="checkbox-label"><input type="checkbox" checked={linked} onChange={e => setLinked(e.target.checked)} /> Verified checkout link exists</label>
    </section>
    <section aria-labelledby="journey-heading" className="split-layout">
      <div className="panel journey-panel">
        <div className="section-heading"><h2 id="journey-heading">Observed journey</h2><span className="micro-text">UTC · consented synthetic visitor</span></div>
        <ol className="journey-list">
          {touchpoints.map((t, i) => <li key={t.id} className="journey-item"><span className="journey-index">0{i + 1}</span><div><strong>{t.source ?? 'Direct return'}</strong><p>{t.isDirect ? 'No non-direct campaign at this visit' : t.medium + ' · ' + t.campaignId}</p><time dateTime={t.occurredAt}>{new Date(t.occurredAt).toLocaleString('vi-VN', { timeZone: 'UTC', day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:false })} UTC</time></div><span className={attribution.touchpointId === t.id ? 'tag tag-ready' : 'tag'}>{attribution.touchpointId === t.id ? 'Credited' : 'Observed'}</span></li>)}
          <li className="journey-item order-item"><span className="journey-index">04</span><div><strong>Order {baseOrder.id}</strong><p>Paid · source of truth: trusted order fixture</p><time dateTime={baseOrder.orderedAt}>06/10/2026 12:00 UTC</time></div><strong className="money">{money(baseOrder.netRevenueVnd)}</strong></li>
        </ol>
      </div>
      <div className="panel result-panel" aria-live="polite">
        <p className="overline">SELECTED MODEL CREDIT</p><h2>{winningSource}</h2>
        <p className="result-money">{money(attribution.attributedRevenueVnd)}</p>
        <p className="result-desc">{attribution.basis === 'unassigned' ? 'Không có liên kết verified nên không thể gán credit theo touchpoint.' : model === 'first_touch' ? 'Earliest eligible observed touchpoint trong lookback.' : 'Latest eligible non-direct touchpoint trong lookback.'}</p>
        <dl className="key-values"><div><dt>Evidence basis</dt><dd>{attribution.basis}</dd></div><div><dt>Model version</dt><dd>{attribution.modelVersion}</dd></div><div><dt>Facebook ROAS (sample)</dt><dd>{roas === null ? 'N/A' : roas.toFixed(2) + 'x'}</dd></div><div><dt>Observed order total</dt><dd>{money(baseOrder.netRevenueVnd)}</dd></div></dl>
      </div>
    </section>
    <section aria-labelledby="comparison-heading" className="panel comparison-panel"><div className="section-heading"><h2 id="comparison-heading">Same revenue, different credit</h2><p>Đây là hai cách nhìn, không phải hai đơn hàng khác nhau.</p></div><div className="table-scroll"><table><thead><tr><th>Model</th><th>Credited source</th><th>Attributed revenue</th><th>Observed order total</th></tr></thead><tbody><tr><td>First-touch</td><td>{first.source ?? 'Unassigned'}</td><td className="number">{money(first.attributedRevenueVnd)}</td><td className="number">{money(first.eligibleOrderRevenueVnd)}</td></tr><tr><td>Last-non-direct</td><td>{last.source ?? 'Unassigned'}</td><td className="number">{money(last.attributedRevenueVnd)}</td><td className="number">{money(last.eligibleOrderRevenueVnd)}</td></tr></tbody></table></div></section>
    <p className="method-note"><strong>Method note:</strong> Đây là một golden fixture cố định, không thu thập hành vi người dùng. Token verified chỉ là trạng thái mô phỏng. Attribution không chứng minh doanh thu được tạo thêm nhờ quảng cáo; kết quả có thể thiếu traffic do consent hoặc ad blockers.</p>
  </div>;
}
