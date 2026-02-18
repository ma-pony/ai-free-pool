#!/usr/bin/env tsx
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { platforms, campaigns, campaignTranslations } from '../src/models/Schema';
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), '.env.local') });
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  const allP = await db.select().from(platforms);
  console.log("=== PLATFORMS (" + allP.length + ") ===");
  for (const p of allP) console.log(p.name + " | " + p.slug + " | " + p.status);

  const allC = await db.select().from(campaigns);
  console.log("\n=== CAMPAIGNS (" + allC.length + ") ===");
  for (const c of allC) console.log(c.title + " | status:" + c.status + " | pid:" + c.platformId);

  const allT = await db.select().from(campaignTranslations);
  console.log("\n=== TRANSLATIONS (" + allT.length + ") ===");
  for (const t of allT) console.log(t.campaignId?.substring(0,8) + " | " + t.locale + " | " + t.title?.substring(0,40));
}
main();
