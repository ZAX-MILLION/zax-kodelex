import { supabase } from '@/integrations/supabase/client';

export const createTestAccounts = async () => {
  const accounts = [
    { email: 'admin@manga.com', password: 'manga_admin_2025', role: 'admin', name: 'Admin User' },
    { email: 'member@manga.com', password: 'manga_member_2025', role: 'user', name: 'Test Member' }
  ];

  const results = [];

  for (const account of accounts) {
    try {
      // Delete existing user if any
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', account.email)
        .single();

      if (existingUser) {
        // User exists, try to sign in
        const { error } = await supabase.auth.signInWithPassword({
          email: account.email,
          password: account.password,
        });
        
        if (!error) {
          results.push({ email: account.email, status: 'already_exists', success: true });
          continue;
        }
      }

      // Create new account
      const { data, error } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            name: account.name,
            role: account.role
          },
          // Skip email confirmation for test accounts
          emailRedirectTo: undefined
        }
      });

      if (error) {
        results.push({ email: account.email, status: 'error', error: error.message, success: false });
      } else {
        results.push({ email: account.email, status: 'created', success: true });
      }
    } catch (error) {
      results.push({ email: account.email, status: 'error', error: (error as Error).message, success: false });
    }
  }

  return results;
};