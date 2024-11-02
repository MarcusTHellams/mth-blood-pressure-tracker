import { int, sqliteTable } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const readingsTable = sqliteTable('bp_readings', {
	readingId: int('readingId').primaryKey({ autoIncrement: true }),
	systolic: int('systolic').notNull(),
	diastolic: int('diastolic').notNull(),
	createdAt: int('createdAt', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});

export type Readings = typeof readingsTable.$inferSelect;
export type ReadingsInsert = typeof readingsTable.$inferInsert;
