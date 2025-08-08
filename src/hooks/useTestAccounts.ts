import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTestAccounts = () => {
  const { toast } = useToast();

  const loginAsAdmin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'admin@manga.com',
        password: 'manga_admin_2025',
      });

      if (error) {
        // If admin account doesn't exist, create it
        if (error.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'admin@manga.com',
            password: 'manga_admin_2025',
            options: {
              data: {
                name: 'Admin User',
                role: 'admin'
              }
            }
          });

          if (!signUpError) {
            // Try to sign in immediately after signup (for testing)
            const { error: retryError } = await supabase.auth.signInWithPassword({
              email: 'admin@manga.com',
              password: 'manga_admin_2025',
            });

            if (retryError) {
              throw retryError;
            }

            toast({
              title: "Admin Account Created",
              description: "Successfully created and logged in as admin!",
            });
          } else {
            throw signUpError;
          }
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Admin Login",
          description: "Successfully logged in as admin!",
        });
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const loginAsMember = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'member@manga.com',
        password: 'manga_member_2025',
      });

      if (error) {
        // If member account doesn't exist, create it
        if (error.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'member@manga.com',
            password: 'manga_member_2025',
            options: {
              data: {
                name: 'Test Member',
                role: 'user'
              }
            }
          });

          if (!signUpError) {
            // Try to sign in immediately after signup (for testing)
            const { error: retryError } = await supabase.auth.signInWithPassword({
              email: 'member@manga.com',
              password: 'manga_member_2025',
            });

            if (retryError) {
              throw retryError;
            }

            toast({
              title: "Member Account Created",
              description: "Successfully created and logged in as member!",
            });
          } else {
            throw signUpError;
          }
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Member Login",
          description: "Successfully logged in as member!",
        });
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    loginAsAdmin,
    loginAsMember,
  };
};