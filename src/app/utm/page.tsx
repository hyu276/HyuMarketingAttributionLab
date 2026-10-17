'use client';

import { useState, type FormEvent } from 'react';
import { buildUtmUrl } from '@/domain/utm';

export default function UtmBuilder() {
  const [destination, setDestination] = useState('https://shop.example.com/products/laptop');
  const [source, setSource] = useState('facebook');
  const [medium, setMedium] = useState('paid_social');
  const [campaign, setCampaign] = useState('autumn_laptop_2026');
  const [id, setId] = useState('cmp_autumn_001');
  const [replace, setReplace] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setCopied(false); try { setResult(buildUtmUrl(destination, {source,medium,campaign,id}, replace)); setError(''); } catch(err) { setResult(''); setError(err instanceof Error ? err.message : 'Invalid input'); } }
  async function copy() { if (!result) return; try { await navigator.clipboard.writeText(result); setCopied(true); } catch { setError('Không thể copy tự động. Hãy chọn và sao chép URL thủ công.'); } }
  return <div className="stack-lg">
    <div className="eyebrow">TOOLS / UTM BUILDER</div>
    <div className="section-heading heading-large"><div><h1>Make campaign links explainable.</h1><p>Tạo URL có UTM nhất quán mà không tự ý ghi đè tham số đã tồn tại. Chưa lưu campaign lên server.</p></div><span className="tag tag-demo">LOCAL TOOL · NO SAVE</span></div>
    <div className="split-layout builder-layout"><section className="panel" aria-labelledby="builder-heading"><h2 id="builder-heading">Link parameters</h2><form onSubmit={submit} className="form-stack">
      <label>Destination URL<input required type="url" value={destination} onChange={e=>setDestination(e.target.value)} /></label>
      <div className="form-grid"><label>utm_source<input required value={source} onChange={e=>setSource(e.target.value)} /></label><label>utm_medium<input required value={medium} onChange={e=>setMedium(e.target.value)} /></label></div>
      <label>utm_campaign<input required value={campaign} onChange={e=>setCampaign(e.target.value)} /></label>
      <label>utm_id <span className="micro-text">Stable campaign identifier, recommended</span><input value={id} onChange={e=>setId(e.target.value)} /></label>
      <label className="checkbox-label"><input type="checkbox" checked={replace} onChange={e=>setReplace(e.target.checked)} /> Allow replacing conflicting existing UTM parameters</label>
      <button className="button button-primary" type="submit">Generate UTM URL</button>
    </form></section><section className="panel result-panel" aria-live="polite"><p className="overline">VALIDATED OUTPUT</p><h2>Campaign destination</h2>
      {error ? <p className="error-message" role="alert">{error}</p> : result ? <><textarea readOnly aria-label="Generated UTM URL" rows={6} value={result} /><button type="button" className="button button-secondary" onClick={copy}>{copied ? 'Copied to clipboard' : 'Copy generated URL'}</button></> : <p className="result-desc">Điền thông tin và tạo link. URL sẽ xuất hiện tại đây; không có thao tác lưu ngầm.</p>}
      <p className="micro-text">UTM parameters identify a tagged URL. They do not prove a paid ad click, customer identity or actual spend.</p></section></div>
  </div>;
}
