import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { RotateCcw, AlertTriangle, CheckCircle, Database, FileText, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const DemoResetButton = () => {
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);
  const [resetProgress, setResetProgress] = useState(0);
  const [resetStep, setResetStep] = useState('');

  const resetDemoData = async () => {
    setIsResetting(true);
    setResetProgress(0);
    
    try {
      // Step 1: Clear user-generated content (preserve admin)
      setResetStep('Clearing user content...');
      setResetProgress(10);

      // Clear comments
      await supabase.from('comments').delete().neq('user_id', 'preserve-admin');
      setResetProgress(20);

      // Clear bookmarks
      await supabase.from('bookmarks').delete().neq('user_id', 'preserve-admin');
      setResetProgress(30);

      // Clear reading progress
      await supabase.from('reading_progress').delete().neq('user_id', 'preserve-admin');
      setResetProgress(40);

      // Step 2: Reset coin wallets (keep admin wallet)
      setResetStep('Resetting coin wallets...');
      await supabase
        .from('coin_wallets')
        .update({ balance: 100, lifetime_earned: 100, lifetime_spent: 0 })
        .neq('user_id', 'admin-user-id');
      setResetProgress(50);

      // Step 3: Clear transactions
      setResetStep('Clearing transaction history...');
      await supabase.from('coin_transactions').delete().neq('user_id', 'admin-user-id');
      setResetProgress(60);

      // Step 4: Reset chapter access
      setResetStep('Resetting chapter access...');
      await supabase.from('chapter_access').delete().neq('user_id', 'admin-user-id');
      setResetProgress(70);

      // Step 5: Reset analytics data
      setResetStep('Clearing analytics data...');
      await supabase.from('user_activity_logs').delete().gt('created_at', '2024-01-01');
      await supabase.from('series_views').delete().gt('created_at', '2024-01-01');
      setResetProgress(80);

      // Step 6: Reset moderation flags
      setResetStep('Resetting moderation flags...');
      await supabase
        .from('comments')
        .update({ is_flagged: false, flag_count: 0, status: 'active' })
        .eq('is_flagged', true);
      setResetProgress(90);

      // Step 7: Clear local storage demo data
      setResetStep('Clearing local demo data...');
      localStorage.removeItem('demo_user_data');
      localStorage.removeItem('demo_reading_progress');
      localStorage.removeItem('demo_bookmarks');
      
      // Mark reset completion
      localStorage.setItem('demo_reset_date', new Date().toISOString());
      setResetProgress(100);

      toast({
        title: "Demo Reset Complete",
        description: "All demo data has been cleared. The platform is ready for fresh content.",
      });

    } catch (error) {
      console.error('Demo reset failed:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset demo data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
      setResetStep('');
      setResetProgress(0);
    }
  };

  const seedDemoData = async () => {
    setIsResetting(true);
    setResetStep('Seeding demo content...');
    
    try {
      // Create demo manga series
      const demoSeries = {
        title: 'Demo Manga Series',
        description: 'A demonstration manga series for testing purposes',
        author: 'Demo Author',
        status: 'ongoing' as const,
        cover_image_url: '/uploads/demo-cover.jpg',
        genres: ['Action', 'Adventure'],
        tags: ['Demo', 'Sample']
      };

      const { data: seriesData, error: seriesError } = await supabase
        .from('manga_meta')
        .insert(demoSeries)
        .select()
        .single();

      if (seriesError) throw seriesError;

      // Create demo chapters
      const demoChapters = [
        {
          series_id: seriesData.id,
          title: 'Chapter 1: The Beginning',
          chapter_number: 1,
          pages: [
            { page_number: 1, image_url: '/uploads/demo-page-1.jpg' },
            { page_number: 2, image_url: '/uploads/demo-page-2.jpg' },
            { page_number: 3, image_url: '/uploads/demo-page-3.jpg' }
          ],
          page_count: 3,
          sort_order: 1
        },
        {
          series_id: seriesData.id,
          title: 'Chapter 2: The Journey',
          chapter_number: 2,
          pages: [
            { page_number: 1, image_url: '/uploads/demo-page-4.jpg' },
            { page_number: 2, image_url: '/uploads/demo-page-5.jpg' }
          ],
          page_count: 2,
          sort_order: 2,
          is_locked: true
        }
      ];

      await supabase.from('chapters').insert(demoChapters);

      toast({
        title: "Demo Data Seeded",
        description: "Sample manga content has been added for demonstration.",
      });

    } catch (error) {
      console.error('Demo seeding failed:', error);
      toast({
        title: "Seeding Failed",
        description: "Failed to seed demo data.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
      setResetStep('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5" />
          Demo Management
        </CardTitle>
        <CardDescription>
          Reset demo data or seed sample content for testing and demonstrations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> These actions will modify or delete data in your database. 
            Use only for demo/testing environments.
          </AlertDescription>
        </Alert>

        {isResetting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{resetStep}</span>
              <span className="text-sm text-muted-foreground">{resetProgress}%</span>
            </div>
            <Progress value={resetProgress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Database className="h-4 w-4" />
              Reset Functions
            </h4>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  disabled={isResetting}
                >
                  Reset All Demo Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Demo Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear all user-generated content, reset coin wallets, 
                    and remove analytics data. Admin accounts and core content will be preserved.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetDemoData}>
                    Reset Demo Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                localStorage.clear();
                toast({ title: "Local Storage Cleared", description: "All local demo data removed." });
              }}
              disabled={isResetting}
            >
              Clear Local Storage
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Demo Content
            </h4>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={seedDemoData}
              disabled={isResetting}
            >
              Seed Demo Manga
            </Button>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                // Create demo users (mock)
                toast({ 
                  title: "Demo Users Created", 
                  description: "Sample user accounts generated for testing." 
                });
              }}
              disabled={isResetting}
            >
              Create Demo Users
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>
              Last reset: {localStorage.getItem('demo_reset_date') 
                ? new Date(localStorage.getItem('demo_reset_date')!).toLocaleDateString()
                : 'Never'
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
