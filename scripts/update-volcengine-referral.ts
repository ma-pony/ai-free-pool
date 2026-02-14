import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { eq, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { platforms, campaigns } from '../src/models/Schema';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const slugs = ['trae', 'jimeng-seedance'];
  const link = 'https://activity.volcengine.com/2026/newyear-referral?ac=MMADFCCYM3WJ&rc=FSK4RWF7';

  for (const slug of slugs) {
    const [p] = await db.select().from(platforms).where(eq(platforms.slug, slug)).limit(1);
    if (!p) { console.log(`${slug} not found, skip`); continue; }
    const cs = await db.select().from(campaigns).where(eq(campaigns.platformId, p.id));
    for (const c of cs) {
      await db.update(campaigns).set({ officialLink: link }).where(eq(campaigns.id, c.id));
      console.log(`Updated ${p.name} → ${c.slug}`);
    }
  }
  console.log('Done!');
  process.exit(0);
}
main();
