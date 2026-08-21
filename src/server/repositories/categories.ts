import { asc } from 'drizzle-orm';
import { db } from '@/server/db';
import { categories } from '@/server/db/schema';

export function listCategories() {
  return db.select().from(categories).orderBy(asc(categories.name));
}
