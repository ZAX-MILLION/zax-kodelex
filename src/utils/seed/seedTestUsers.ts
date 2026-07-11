import { supabase } from '@/integrations/supabase/client';

export interface TestUser {
  email: string;
  password: string;
  role: 'admin' | 'author' | 'editor' | 'member' | 'user';
  description: string;
}

export const testUsers: TestUser[] = [
  {
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    description: 'Full admin access to all areas'
  },
  {
    email: 'author@test.com',
    password: 'author123',
    role: 'author',
    description: 'Author dashboard and content creation access'
  },
  {
    email: 'editor@test.com',
    password: 'editor123',
    role: 'editor',
    description: 'Content editing and moderation access'
  },
  {
    email: 'member@test.com',
    password: 'member123',
    role: 'member',
    description: 'Standard user with enhanced features'
  },
  {
    email: 'user@test.com',
    password: 'user123',
    role: 'user',
    description: 'Basic user with free tier access'
  }
];

export const seedTestUsers = async () => {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  console.log('🌱 Seeding test users...');

  for (const testUser of testUsers) {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', testUser.email)
        .single();

      if (existingUser) {
        console.log(`✓ User ${testUser.email} already exists`);
        results.success++;
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
      });

      if (authError) {
        console.error(`❌ Failed to create auth user ${testUser.email}:`, authError.message);
        results.failed++;
        results.errors.push(`${testUser.email}: ${authError.message}`);
        continue;
      }

      if (!authData.user) {
        console.error(`❌ No user data returned for ${testUser.email}`);
        results.failed++;
        results.errors.push(`${testUser.email}: No user data returned`);
        continue;
      }

      // Create profile with role
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          email: testUser.email,
          username: testUser.email.split('@')[0],
          role: testUser.role,
          activity_score: 0,
          login_count: 0,
          chapter_layout_preference: 1,
          is_banned: false
        });

      if (profileError) {
        console.error(`❌ Failed to create profile for ${testUser.email}:`, profileError.message);
        results.failed++;
        results.errors.push(`${testUser.email}: ${profileError.message}`);
        continue;
      }

      console.log(`✅ Created test user: ${testUser.email} (${testUser.role})`);
      results.success++;

    } catch (error) {
      console.error(`❌ Unexpected error creating ${testUser.email}:`, error);
      results.failed++;
      results.errors.push(`${testUser.email}: Unexpected error`);
    }
  }

  console.log(`\n🎯 Test user seeding complete:`);
  console.log(`   ✅ Success: ${results.success}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.log(`   Errors:`, results.errors);
  }

  return results;
};

export const grantTestPremium = async (email: string) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .single();

    if (!profile) {
      throw new Error('User not found');
    }

    // Create test premium subscription
    const { error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: profile.user_id,
        plan: 'premium',
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        auto_renew: true,
        currency: 'USD',
        amount: 9.99
      });

    if (error) throw error;

    console.log(`✅ Granted premium access to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to grant premium to ${email}:`, error);
    return false;
  }
};

export const logSecurityEvent = (event: string, details: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    ...details,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  console.warn(`[SECURITY] ${event}:`, logEntry);
  
  // In production, send to monitoring service
  // await supabase.from('security_logs').insert(logEntry);
  
  return logEntry;
};