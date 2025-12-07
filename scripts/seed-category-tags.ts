/**
 * Seed script to add default category tags
 * Run with: npx tsx scripts/seed-category-tags.ts
 */

// Load environment variables
import { config } from 'dotenv';

import { and, eq } from 'drizzle-orm';
import { CATEGORIES } from '../src/config/categories';
import { db } from '../src/libs/DB';
import { tags } from '../src/models/Schema';

config({ path: '.env.local' });

// 从统一配置生成种子数据
const defaultCategories = CATEGORIES.map(cat => ({
  name: cat.nameZh,
  slug: cat.slug,
  nameEn: cat.nameEn,
}));

async function seedCategoryTags() {
  console.log('🌱 Starting to seed category tags...');

  let created = 0;
  let skipped = 0;

  for (const category of defaultCategories) {
    try {
      // Check if tag already exists
      const existing = await db
        .select()
        .from(tags)
        .where(and(eq(tags.slug, category.slug), eq(tags.type, 'category')))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️  Skipping "${category.name}" (already exists)`);
        skipped++;
        continue;
      }

      // Create the tag
      await db.insert(tags).values({
        name: category.name,
        slug: category.slug,
        type: 'category',
      });

      console.log(`✅ Created category: "${category.name}" (${category.slug})`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating category "${category.name}":`, error);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📝 Total: ${defaultCategories.length}`);
  console.log('\n✨ Done!');
}

// Run the seed function
seedCategoryTags()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
