import { useToast } from '@/hooks/use-toast';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { isRealAuthEnabled } from '@/features/demo/demoAuthPolicy';

const UNAVAILABLE = {
  message: 'Test accounts are only available in development with real Supabase auth.',
};

export const useTestAccounts = () => {
  const { toast } = useToast();
  const allowed = import.meta.env.DEV && isRealAuthEnabled() && isSupabaseConfigured;

  const loginAsAdmin = async () => {
    if (!allowed) {
      return { error: UNAVAILABLE };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'admin@manga.com',
        password: 'manga_admin_2025',
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'admin@manga.com',
            password: 'manga_admin_2025',
            options: {
              data: {
                username: 'admin',
                name: 'Admin User',
              },
            },
          });

          if (!signUpError) {
            const { error: retryError } = await supabase.auth.signInWithPassword({
              email: 'admin@manga.com',
              password: 'manga_admin_2025',
            });

            if (retryError) throw retryError;

            toast({
              title: 'Admin Account Created',
              description: 'Successfully created and logged in as admin!',
            });
          } else {
            throw signUpError;
          }
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Admin Login',
          description: 'Successfully logged in as admin!',
        });
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const loginAsMember = async () => {
    if (!allowed) {
      return { error: UNAVAILABLE };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'member@manga.com',
        password: 'manga_member_2025',
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'member@manga.com',
            password: 'manga_member_2025',
            options: {
              data: {
                username: 'member',
                name: 'Member User',
              },
            },
          });

          if (!signUpError) {
            const { error: retryError } = await supabase.auth.signInWithPassword({
              email: 'member@manga.com',
              password: 'manga_member_2025',
            });

            if (retryError) throw retryError;

            toast({
              title: 'Member Account Created',
              description: 'Successfully created and logged in as member!',
            });
          } else {
            throw signUpError;
          }
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Member Login',
          description: 'Successfully logged in as member!',
        });
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  return { loginAsAdmin, loginAsMember };
};
