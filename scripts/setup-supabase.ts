/**
 * One-time setup script to create required Supabase storage buckets
 * Run with: npx ts-node scripts/setup-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('\n❌ Missing environment variables!\n');
  console.log('Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.');
  console.log('\nTo find your service role key:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings → API');
  console.log('4. Copy the "service_role" key (under "Project API keys")\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function setup() {
  console.log('\n🚀 Setting up Supabase storage buckets...\n');

  const bucketsToCreate = [
    { name: 'gallery', public: true },
    { name: 'backgrounds', public: true },
    { name: 'thumbnails', public: true },
  ];

  for (const bucket of bucketsToCreate) {
    // Check if bucket exists
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const exists = existingBuckets?.some(b => b.name === bucket.name);

    if (exists) {
      console.log(`✓ Bucket "${bucket.name}" already exists`);
    } else {
      const { error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: 5242880, // 5MB
      });

      if (error) {
        console.error(`✗ Failed to create "${bucket.name}":`, error.message);
      } else {
        console.log(`✓ Created bucket "${bucket.name}" (public: ${bucket.public})`);
      }
    }
  }

  console.log('\n✅ Setup complete!\n');
}

setup().catch(console.error);
