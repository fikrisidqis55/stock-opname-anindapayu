import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['owner', 'admin', 'cashier']);
export const batchSource = pgEnum('batch_source', ['production', 'purchase']);
export const saleType = pgEnum('sale_type', ['ecer', 'grosir', 'kulakan']);
export const movementType = pgEnum('movement_type', [
  'in_production',
  'in_purchase',
  'sale',
  'opname_adjust',
]);
export const movementRefType = pgEnum('movement_ref_type', ['batch', 'sale', 'opname_item']);
export const opnameStatus = pgEnum('opname_status', ['counting', 'completed', 'cancelled']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: userRole('role').notNull().default('owner'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id),
    photoUrl: text('photo_url'),
    priceModal: integer('price_modal').notNull(),
    priceEcer: integer('price_ecer').notNull(),
    priceGrosir: integer('price_grosir').notNull(),
    priceKulakan: integer('price_kulakan').notNull(),
    stockQty: integer('stock_qty').notNull().default(0),
    minStockQty: integer('min_stock_qty'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check('products_stock_non_negative', sql`${t.stockQty} >= 0`),
    index('products_category_idx').on(t.categoryId),
    index('products_name_idx').on(t.name),
  ],
);

export const stockBatches = pgTable(
  'stock_batches',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    source: batchSource('source').notNull(),
    qty: integer('qty').notNull(),
    unitCost: integer('unit_cost').notNull(),
    totalCost: integer('total_cost').notNull(),
    supplierName: text('supplier_name'),
    note: text('note'),
    receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('stock_batches_product_idx').on(t.productId)],
);

export const sales = pgTable('sales', {
  id: uuid('id').primaryKey().defaultRandom(),
  saleType: saleType('sale_type').notNull(),
  customerName: text('customer_name'),
  totalPrice: integer('total_price').notNull(),
  totalCost: integer('total_cost').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const saleItems = pgTable(
  'sale_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    saleId: uuid('sale_id')
      .notNull()
      .references(() => sales.id),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    qty: integer('qty').notNull(),
    unitPrice: integer('unit_price').notNull(),
    unitCostSnapshot: integer('unit_cost_snapshot').notNull(),
    subtotal: integer('subtotal').notNull(),
  },
  (t) => [index('sale_items_sale_idx').on(t.saleId)],
);

export const stockMovements = pgTable(
  'stock_movements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    type: movementType('type').notNull(),
    qtyChange: integer('qty_change').notNull(),
    refType: movementRefType('ref_type').notNull(),
    refId: uuid('ref_id').notNull(),
    note: text('note'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('stock_movements_product_time_idx').on(t.productId, t.occurredAt)],
);

export const opnameSessions = pgTable(
  'opname_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    label: text('label').notNull(),
    status: opnameStatus('status').notNull().default('counting'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    note: text('note'),
    totalDiffQty: integer('total_diff_qty').notNull().default(0),
    totalDiffValue: integer('total_diff_value').notNull().default(0),
  },
  (t) => [index('opname_sessions_status_idx').on(t.status)],
);

export const opnameItems = pgTable(
  'opname_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => opnameSessions.id),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    systemQty: integer('system_qty').notNull(),
    countedQty: integer('counted_qty'),
  },
  (t) => [uniqueIndex('opname_items_session_product_uq').on(t.sessionId, t.productId)],
);
