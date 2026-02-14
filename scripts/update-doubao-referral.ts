import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { platforms, campaigns } from '../src/models/Schema';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  // Find doubao platform
  const [platform] = await db.select().from(platforms).where(eq(platforms.slug, 'doubao')).limit(1);
  if (!platform) { console.error('doubao platform not found'); process.exit(1); }
  console.log('Found platform:', platform.name, platform.id);

  // Update campaign officialLink
  const campaignList = await db.select().from(campaigns).where(eq(campaigns.platformId, platform.id));
  for (const c of campaignList) {
    await db.update(campaigns).set({
      officialLink: 'https://activity.volcengine.com/2026/newyear-referral?ac=MMADFCCYM3WJ&rc=FSK4RWF7',
    }).where(eq(campaigns.id, c.id));
    console.log('Updated campaign:', c.slug, '→ referral link');
  }
  console.log('Done!');
  process.exit(0);
}
main();
