#!/usr/bin/env tsx
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { platforms } from '../src/models/Schema';
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  const allPlatforms = await db.select().from(platforms).limit(10);
  console.log(JSON.stringify(allPlatforms, null, 2));
}

main();
