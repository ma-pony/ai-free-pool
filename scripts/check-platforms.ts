import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { platforms } from './src/models/Schema';
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema: { platforms } });
  const all = await db.query.platforms.findMany({ columns: { id: true, name: true } });
  const targets = ['腾讯元宝', '通义千问', '文心一言', 'OpenAI', 'Anthropic', 'Google Cloud'];
  for (const t of targets) {
    const found = all.find(p => p.name === t);
    console.log(t + ': ' + (found ? 'id=' + found.id : '❌ NOT FOUND'));
  }
  console.log('---all platforms---');
  console.log(all.map(p => p.name).sort().join('\n'));
}
main();
