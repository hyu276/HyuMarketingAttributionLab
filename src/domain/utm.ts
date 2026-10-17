export interface UtmFields {
  source: string;
  medium: string;
  campaign: string;
  id?: string;
  content?: string;
  term?: string;
}

export function normalizeUtm(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '').replace(/_+/g, '_').slice(0, 120);
}

export function buildUtmUrl(destination: string, fields: UtmFields, replaceExisting = false): string {
  let url: URL;
  try { url = new URL(destination); } catch { throw new Error('Enter a valid absolute destination URL'); }
  const devHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !devHttp) throw new Error('HTTPS is required (HTTP allowed only for local development)');
  if (url.username || url.password) throw new Error('Destination URLs may not contain credentials');
  const query = new Map([
    ['utm_source', fields.source], ['utm_medium', fields.medium], ['utm_campaign', fields.campaign],
    ['utm_id', fields.id], ['utm_content', fields.content], ['utm_term', fields.term],
  ]);
  for (const [key, raw] of query) {
    if (raw === undefined || raw === '') continue;
    const normalized = normalizeUtm(raw);
    if (!normalized) throw new Error(`${key} must contain a valid name`);
    if (url.searchParams.has(key) && !replaceExisting && url.searchParams.get(key) !== normalized) {
      throw new Error(`${key} already exists: confirm replacement before overwriting`);
    }
    url.searchParams.set(key, normalized);
  }
  if (!url.searchParams.get('utm_source') || !url.searchParams.get('utm_medium') || !url.searchParams.get('utm_campaign')) {
    throw new Error('Source, medium and campaign are required');
  }
  return url.toString();
}
