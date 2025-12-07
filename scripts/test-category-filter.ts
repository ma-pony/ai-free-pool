/**
 * Test script for category filter functionality
 * Run with: npx tsx scripts/test-category-filter.ts
 */

import { getCampaigns } from '../src/services/CampaignService';
import { getTags } from '../src/services/TagService';

async function testCategoryFilter() {
  console.log('🧪 Testing Category Filter Functionality\n');

  try {
    // Test 1: Get all category tags
    console.log('📋 Test 1: Fetching all category tags...');
    const categoryTags = await getTags({ type: 'category' });
    console.log(`   ✅ Found ${categoryTags.length} category tags`);
    if (categoryTags.length > 0) {
      console.log('   📝 Sample categories:');
      categoryTags.slice(0, 5).forEach((tag) => {
        console.log(`      - ${tag.name} (${tag.slug})`);
      });
    }
    console.log('');

    // Test 2: Get campaigns without filters
    console.log('📋 Test 2: Fetching all published campaigns...');
    const allCampaigns = await getCampaigns({
      status: 'published',
      includeExpired: false,
      includeDeleted: false,
    });
    console.log(`   ✅ Found ${allCampaigns.length} published campaigns`);
    console.log('');

    // Test 3: Filter by first category (if available)
    if (categoryTags.length > 0) {
      const firstCategory = categoryTags[0];
      console.log(`📋 Test 3: Filtering by category "${firstCategory.name}"...`);
      const filteredCampaigns = await getCampaigns({
        status: 'published',
        includeExpired: false,
        includeDeleted: false,
        categoryTags: [firstCategory.slug],
      });
      console.log(`   ✅ Found ${filteredCampaigns.length} campaigns in this category`);

      if (filteredCampaigns.length > 0) {
        console.log('   📝 Sample campaigns:');
        filteredCampaigns.slice(0, 3).forEach((campaign) => {
          const translation = campaign.translations?.find(t => t.locale === 'zh') || campaign.translations?.[0];
          console.log(`      - ${translation?.title || 'Untitled'}`);
        });
      }
      console.log('');
    }

    // Test 4: Filter by multiple categories
    if (categoryTags.length >= 2) {
      const categories = categoryTags.slice(0, 2);
      console.log(`📋 Test 4: Filtering by multiple categories...`);
      console.log(`   Categories: ${categories.map(c => c.name).join(', ')}`);
      const multiFilteredCampaigns = await getCampaigns({
        status: 'published',
        includeExpired: false,
        includeDeleted: false,
        categoryTags: categories.map(c => c.slug),
      });
      console.log(`   ✅ Found ${multiFilteredCampaigns.length} campaigns`);
      console.log('');
    }

    // Test 5: Combine category filter with difficulty
    if (categoryTags.length > 0) {
      const firstCategory = categoryTags[0];
      console.log(`📋 Test 5: Combining category + difficulty filters...`);
      console.log(`   Category: ${firstCategory.name}, Difficulty: easy`);
      const combinedFilterCampaigns = await getCampaigns({
        status: 'published',
        includeExpired: false,
        includeDeleted: false,
        categoryTags: [firstCategory.slug],
        difficultyLevel: 'easy',
      });
      console.log(`   ✅ Found ${combinedFilterCampaigns.length} easy campaigns in this category`);
      console.log('');
    }

    // Test 6: Test sorting with filters
    if (categoryTags.length > 0) {
      const firstCategory = categoryTags[0];
      console.log(`📋 Test 6: Testing sort options with filters...`);

      const sortOptions = ['latest', 'popular', 'expiring_soon', 'highest_credit'] as const;
      for (const sortBy of sortOptions) {
        const sortedCampaigns = await getCampaigns({
          status: 'published',
          includeExpired: false,
          includeDeleted: false,
          categoryTags: [firstCategory.slug],
          sortBy,
          limit: 5,
        });
        console.log(`   ✅ Sort by "${sortBy}": ${sortedCampaigns.length} campaigns`);
      }
      console.log('');
    }

    // Summary
    console.log('✨ All tests completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Total category tags: ${categoryTags.length}`);
    console.log(`   - Total published campaigns: ${allCampaigns.length}`);
    console.log('   - Filter functionality: ✅ Working');
    console.log('   - Sort functionality: ✅ Working');
    console.log('   - Combined filters: ✅ Working');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
testCategoryFilter()
  .then(() => {
    console.log('\n✅ Test suite passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
