import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { categories, opnameItems, opnameSessions, products } from '@/server/db/schema';

export function listOpnameSessions() {
  return db.select().from(opnameSessions).orderBy(desc(opnameSessions.startedAt));
}

export async function getSessionDetail(sessionId: string) {
  const [session] = await db
    .select()
    .from(opnameSessions)
    .where(eq(opnameSessions.id, sessionId));
  if (!session) return null;
  const items = await db
    .select({
      item: opnameItems,
      productName: products.name,
      categoryName: categories.name,
      priceModal: products.priceModal,
    })
    .from(opnameItems)
    .innerJoin(products, eq(opnameItems.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(opnameItems.sessionId, sessionId))
    .orderBy(asc(categories.name), asc(products.name));
  return { session, items };
}
