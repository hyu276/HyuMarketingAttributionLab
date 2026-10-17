import { bigint, boolean, index, integer, jsonb, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
// Design-stage schema. Migration generation and database integration have NOT been tested.
export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', {length:120}).notNull(),
  timezone: varchar('timezone', {length:80}).notNull().default('Asia/Ho_Chi_Minh'),
  currency: varchar('currency', {length:3}).notNull().default('VND'),
});
export const sites = pgTable('sites', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(()=>workspaces.id),
  name: varchar('name',{length:120}).notNull(),
  publicKey: varchar('public_key',{length:120}).notNull(),
  domains: jsonb('domains').$type<string[]>().notNull().default([]),
  active: boolean('active').notNull().default(true),
}, t=>[uniqueIndex('site_key_unique').on(t.publicKey),index('sites_workspace_idx').on(t.workspaceId)]);
export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').notNull().references(()=>sites.id),
  utmId: varchar('utm_id',{length:120}).notNull(),
  name: varchar('name',{length:160}).notNull(),
  source: varchar('source',{length:120}).notNull(),
  medium: varchar('medium',{length:120}).notNull(),
},t=>[uniqueIndex('campaigns_site_utm_unique').on(t.siteId,t.utmId)]);
export const visitors = pgTable('visitors',{
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').notNull().references(()=>sites.id),
  anonId: uuid('anon_id').notNull(),
  createdAt: timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[uniqueIndex('visitors_site_anon_unique').on(t.siteId,t.anonId)]);
export const sessions = pgTable('sessions',{
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').notNull().references(()=>sites.id),
  visitorId: uuid('visitor_id').notNull().references(()=>visitors.id),
  startedAt:timestamp('started_at',{withTimezone:true}).notNull(),
  lastSeenAt:timestamp('last_seen_at',{withTimezone:true}).notNull(),
},t=>[index('sessions_visitor_time_idx').on(t.siteId,t.visitorId,t.startedAt)]);
export const touchpoints = pgTable('touchpoints',{
  id:uuid('id').primaryKey().defaultRandom(),
  siteId:uuid('site_id').notNull().references(()=>sites.id),
  visitorId:uuid('visitor_id').notNull().references(()=>visitors.id),
  sessionId:uuid('session_id').notNull().references(()=>sessions.id),
  campaignId:uuid('campaign_id').references(()=>campaigns.id),
  occurredAt:timestamp('occurred_at',{withTimezone:true}).notNull(),
  source:varchar('source',{length:120}),
  medium:varchar('medium',{length:120}),
  isDirect:boolean('is_direct').notNull().default(false),
},t=>[index('touchpoints_path_idx').on(t.siteId,t.visitorId,t.occurredAt)]);
export const events=pgTable('events',{
  id:uuid('id').primaryKey().defaultRandom(),
  eventId:uuid('event_id').notNull(),
  siteId:uuid('site_id').notNull().references(()=>sites.id),
  visitorId:uuid('visitor_id').notNull().references(()=>visitors.id),
  sessionId:uuid('session_id').notNull().references(()=>sessions.id),
  eventName:varchar('event_name',{length:40}).notNull(),
  occurredAt:timestamp('occurred_at',{withTimezone:true}).notNull(),
  receivedAt:timestamp('received_at',{withTimezone:true}).notNull().defaultNow(),
  path:varchar('path',{length:512}),
  properties:jsonb('properties').$type<Record<string,string|number|boolean>>().notNull().default({}),
},t=>[uniqueIndex('events_site_event_unique').on(t.siteId,t.eventId),index('events_site_time_idx').on(t.siteId,t.occurredAt)]);
export const checkoutLinks=pgTable('checkout_links',{
  id:uuid('id').primaryKey().defaultRandom(),
  siteId:uuid('site_id').notNull().references(()=>sites.id),
  visitorId:uuid('visitor_id').notNull().references(()=>visitors.id),
  tokenHash:varchar('token_hash',{length:128}).notNull(),
  expiresAt:timestamp('expires_at',{withTimezone:true}).notNull(),
  usedAt:timestamp('used_at',{withTimezone:true}),
},t=>[uniqueIndex('checkout_hash_unique').on(t.tokenHash)]);
export const orders=pgTable('orders',{
  id:uuid('id').primaryKey().defaultRandom(),
  siteId:uuid('site_id').notNull().references(()=>sites.id),
  externalOrderId:varchar('external_order_id',{length:160}).notNull(),
  status:varchar('status',{length:24}).notNull(),
  orderedAt:timestamp('ordered_at',{withTimezone:true}).notNull(),
  currency:varchar('currency',{length:3}).notNull().default('VND'),
  gross:bigint('gross',{mode:'number'}).notNull(),
  discount:bigint('discount',{mode:'number'}).notNull(),
  refunded:bigint('refunded',{mode:'number'}).notNull(),
  net:bigint('net',{mode:'number'}).notNull(),
  checkoutLinkId:uuid('checkout_link_id').references(()=>checkoutLinks.id),
  couponCode:varchar('coupon_code',{length:90}),
},t=>[uniqueIndex('orders_site_external_unique').on(t.siteId,t.externalOrderId),index('orders_site_time_idx').on(t.siteId,t.orderedAt)]);
export const costs=pgTable('campaign_costs',{
  id:uuid('id').primaryKey().defaultRandom(),
  siteId:uuid('site_id').notNull().references(()=>sites.id),
  campaignId:uuid('campaign_id').notNull().references(()=>campaigns.id),
  spendDate:varchar('spend_date',{length:10}).notNull(),
  amount:bigint('amount',{mode:'number'}).notNull(),
  currency:varchar('currency',{length:3}).notNull().default('VND'),
  rowKey:varchar('row_key',{length:200}).notNull(),
},t=>[uniqueIndex('cost_site_row_unique').on(t.siteId,t.rowKey),index('cost_campaign_date_idx').on(t.campaignId,t.spendDate)]);
export const attributionResults=pgTable('attribution_results',{
  id:uuid('id').primaryKey().defaultRandom(),
  orderId:uuid('order_id').notNull().references(()=>orders.id),
  model:varchar('model',{length:60}).notNull(),
  modelVersion:varchar('model_version',{length:80}).notNull(),
  windowDays:integer('window_days').notNull(),
  basis:varchar('basis',{length:40}).notNull(),
  campaignId:uuid('campaign_id').references(()=>campaigns.id),
  revenue:bigint('revenue',{mode:'number'}).notNull(),
  credit:numeric('credit',{precision:5,scale:4}).notNull(),
  computedAt:timestamp('computed_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[uniqueIndex('attribution_order_model_unique').on(t.orderId,t.model,t.modelVersion,t.windowDays)]);
export const auditLogs=pgTable('audit_logs',{
  id:uuid('id').primaryKey().defaultRandom(),
  workspaceId:uuid('workspace_id').notNull().references(()=>workspaces.id),
  action:varchar('action',{length:120}).notNull(),
  metadata:jsonb('metadata').$type<Record<string,string>>().notNull().default({}),
  createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[index('audit_workspace_time_idx').on(t.workspaceId,t.createdAt)]);

export const memberships = pgTable('memberships', {
  workspaceId:uuid('workspace_id').notNull().references(()=>workspaces.id,{onDelete:'cascade'}),
  userId:text('user_id').notNull(),
  role:varchar('role',{length:20}).notNull().default('analyst'),
},t=>[uniqueIndex('membership_unique').on(t.workspaceId,t.userId),index('memberships_user_idx').on(t.userId)]);
export const couponCodes=pgTable('campaign_coupon_codes',{
  id:uuid('id').primaryKey().defaultRandom(),
  siteId:uuid('site_id').notNull().references(()=>sites.id),
  campaignId:uuid('campaign_id').notNull().references(()=>campaigns.id),
  code:varchar('code',{length:90}).notNull(),
  active:boolean('active').notNull().default(true),
},t=>[uniqueIndex('coupons_site_code_unique').on(t.siteId,t.code)]);
export const imports=pgTable('imports',{
  id:uuid('id').primaryKey().defaultRandom(),
  siteId:uuid('site_id').notNull().references(()=>sites.id),
  kind:varchar('kind',{length:24}).notNull(),
  contentHash:varchar('content_hash',{length:64}).notNull(),
  status:varchar('status',{length:25}).notNull(),
  rowCount:integer('row_count').notNull(),
  createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[index('imports_site_time_idx').on(t.siteId,t.createdAt)]);
export const deletionRequests=pgTable('deletion_requests',{
  id:uuid('id').primaryKey().defaultRandom(),
  siteId:uuid('site_id').notNull().references(()=>sites.id),
  visitorId:uuid('visitor_id').references(()=>visitors.id),
  status:varchar('status',{length:24}).notNull().default('pending'),
  requestedAt:timestamp('requested_at',{withTimezone:true}).notNull().defaultNow(),
  completedAt:timestamp('completed_at',{withTimezone:true}),
});
