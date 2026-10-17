export type AttributionModel = 'first_touch' | 'last_non_direct_touch';
export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded' | 'partially_refunded';
export type AttributionBasis = 'observed_touch' | 'direct' | 'coupon_fallback' | 'unassigned' | 'ineligible_order';
export const MODEL_VERSION = 'mal-attribution-v1' as const;

export interface Touchpoint {
  id: string;
  siteId: string;
  visitorId: string;
  occurredAt: string;
  consented: boolean;
  source: string | null;
  medium: string | null;
  campaignId: string | null;
  isDirect: boolean;
}

export interface TrustedOrder {
  id: string;
  siteId: string;
  orderedAt: string;
  status: OrderStatus;
  netRevenueVnd: number;
  /** Only a trusted server that has validated a checkout token may populate this. */
  verifiedVisitorId: string | null;
  /** Campaign IDs resolved through a validated coupon registry, not guessed. */
  verifiedCouponCampaignIds?: readonly string[];
}

export interface AttributionResult {
  orderId: string;
  model: AttributionModel;
  modelVersion: typeof MODEL_VERSION;
  windowDays: 1 | 7 | 30;
  basis: AttributionBasis;
  campaignId: string | null;
  touchpointId: string | null;
  source: string | null;
  attributedRevenueVnd: number;
  eligibleOrderRevenueVnd: number;
}

function utcMs(input: string): number {
  const timestamp = Date.parse(input);
  if (!Number.isFinite(timestamp)) throw new Error(`Invalid timestamp: ${input}`);
  return timestamp;
}

function eligibleRevenue(order: TrustedOrder): number {
  if (!Number.isSafeInteger(order.netRevenueVnd) || order.netRevenueVnd < 0) {
    throw new Error('Order revenue must be a nonnegative safe integer in VND');
  }
  return ['paid', 'fulfilled', 'partially_refunded'].includes(order.status) ? order.netRevenueVnd : 0;
}

/** Deterministic rule-based credit, not causal incrementality. */
export function attributeOrder(
  order: TrustedOrder,
  allTouchpoints: readonly Touchpoint[],
  model: AttributionModel,
  windowDays: 1 | 7 | 30 = 7,
): AttributionResult {
  if (model !== 'first_touch' && model !== 'last_non_direct_touch') throw new Error('Unsupported attribution model');
  if (![1, 7, 30].includes(windowDays)) throw new Error('Unsupported lookback window');
  const orderTime = utcMs(order.orderedAt);
  const revenue = eligibleRevenue(order);
  const base = {
    orderId: order.id, model, modelVersion: MODEL_VERSION, windowDays,
    campaignId: null, touchpointId: null, source: null,
    eligibleOrderRevenueVnd: revenue,
  };
  if (['pending', 'cancelled', 'refunded'].includes(order.status)) return { ...base, basis: 'ineligible_order', attributedRevenueVnd: 0 };

  const minTime = orderTime - windowDays * 24 * 60 * 60 * 1000;
  const eligible = order.verifiedVisitorId === null ? [] : allTouchpoints
    .filter((touch) => {
      if (!touch.consented || touch.siteId !== order.siteId || touch.visitorId !== order.verifiedVisitorId) return false;
      const when = Date.parse(touch.occurredAt);
      return Number.isFinite(when) && when >= minTime && when <= orderTime;
    })
    .sort((a, b) => utcMs(a.occurredAt) - utcMs(b.occurredAt) || a.id.localeCompare(b.id));

  const preferred = model === 'first_touch'
    ? eligible[0]
    : eligible.filter((touch) => !touch.isDirect).at(-1) ?? eligible.at(-1);
  if (preferred) {
    return {
      ...base,
      basis: preferred.isDirect ? 'direct' : 'observed_touch',
      campaignId: preferred.isDirect ? null : preferred.campaignId,
      touchpointId: preferred.id,
      source: preferred.isDirect ? 'direct' : (preferred.source ?? 'unknown'),
      attributedRevenueVnd: revenue,
    };
  }

  const matchedCampaigns = [...new Set(order.verifiedCouponCampaignIds ?? [])].filter(Boolean);
  if (matchedCampaigns.length === 1) {
    return { ...base, basis: 'coupon_fallback', campaignId: matchedCampaigns[0], attributedRevenueVnd: revenue };
  }
  return { ...base, basis: 'unassigned', attributedRevenueVnd: 0 };
}

/** Returns null if there is no known positive comparable spend. */
export function calculateRoas(attributedRevenueVnd: number, spendVnd: number | null): number | null {
  if (spendVnd === null || !Number.isSafeInteger(spendVnd) || spendVnd <= 0) return null;
  if (!Number.isSafeInteger(attributedRevenueVnd) || attributedRevenueVnd < 0) throw new Error('Invalid attributed revenue');
  return attributedRevenueVnd / spendVnd;
}
