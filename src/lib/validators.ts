import { z } from 'zod';

export const productInputSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(120),
  categoryId: z.uuid(),
  photoUrl: z.string().nullish().or(z.literal('')),
  priceModal: z.coerce.number().int().min(0),
  priceEcer: z.coerce.number().int().min(0),
  priceGrosir: z.coerce.number().int().min(0),
  priceKulakan: z.coerce.number().int().min(0),
  minStockQty: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.coerce.number().int().min(0).nullable(),
  ),
});
export type ProductInput = z.infer<typeof productInputSchema>;

export const stockInInputSchema = z.object({
  productId: z.uuid(),
  source: z.enum(['production', 'purchase']),
  qty: z.coerce.number().int().min(1),
  unitCost: z.coerce.number().int().min(0),
  supplierName: z.string().max(120).optional().or(z.literal('')),
  note: z.string().max(200).optional().or(z.literal('')),
  updateModal: z.boolean().default(false),
});
export type StockInInput = z.infer<typeof stockInInputSchema>;

export const saleInputSchema = z
  .object({
    saleType: z.enum(['ecer', 'grosir', 'kulakan']),
    customerName: z.string().max(120).optional().or(z.literal('')),
    note: z.string().max(200).optional().or(z.literal('')),
    items: z
      .array(
        z.object({
          productId: z.uuid(),
          qty: z.coerce.number().int().min(1),
          unitPrice: z.coerce.number().int().min(0),
        }),
      )
      .min(1, 'Minimal satu produk'),
  })
  .refine(
    (v) => v.saleType !== 'kulakan' || (v.customerName?.trim().length ?? 0) > 0,
    { message: 'Nama bakul wajib diisi untuk kulakan', path: ['customerName'] },
  );
export type SaleInput = z.infer<typeof saleInputSchema>;
