import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	out: './src/db/drizzle',
	schema: './src/db/schema.ts',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
