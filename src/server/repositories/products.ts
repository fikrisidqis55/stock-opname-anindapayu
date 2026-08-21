import { asc, eq, ilike } from 'drizzle-orm';
import type { ProductInput } from '@/lib/validators';
import { db } from '@/server/db';
import { categories, products } from '@/server/db/schema';

export async function listProductsGroupedByCategory(search?: string) {
  const rows = await db
    .select({ product: products, categoryName: categories.name })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(search ? ilike(products.name, `%${search}%`) : undefined)
    .orderBy(asc(categories.name), asc(products.name));

  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = groups.get(row.categoryName) ?? [];
    list.push(row);
    groups.set(row.categoryName, list);
  }
  return groups;
}

export async function listActiveProducts() {
  return db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.name));
}

export async function getProductById(id: string) {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  return product ?? null;
}

export function createProduct(input: ProductInput) {
  return db.insert(products).values({
    name: input.name,
    categoryId: input.categoryId,
    photoUrl: input.photoUrl || null,
    priceModal: input.priceModal,
    priceEcer: input.priceEcer,
    priceGrosir: input.priceGrosir,
    priceKulakan: input.priceKulakan,
    minStockQty: input.minStockQty ?? null,
  });
}

export function updateProduct(id: string, input: ProductInput) {
  return db
    .update(products)
    .set({
      name: input.name,
      categoryId: input.categoryId,
      photoUrl: input.photoUrl || null,
      priceModal: input.priceModal,
      priceEcer: input.priceEcer,
      priceGrosir: input.priceGrosir,
      priceKulakan: input.priceKulakan,
      minStockQty: input.minStockQty ?? null,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));
}
