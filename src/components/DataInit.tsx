import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Database, Play } from 'lucide-react';
import { quickDatabaseReset } from '@/utils/seed/quickDataReset';
import { useToast } from '@/hooks/use-toast';

export const DataInit = () => {
  const [hasData, setHasData] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if data exists
    const checkData = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('manga_meta')
          .select('id')
          .limit(1);
        
        if (!error && data && data.length > 0) {
          setHasData(true);
        }
      } catch (error) {
        console.log('No data found, showing init option');
      }
    };

    checkData();
  }, []);

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const success = await quickDatabaseReset();
      if (success) {
        setHasData(true);
        toast({
          title: "Database Initialized",
          description: "Sample data has been created successfully",
        });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast({
          title: "Initialization Failed",
          description: "Please check the console for errors",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Init error:', error);
      toast({
        title: "Error",
        description: "Failed to initialize database",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  if (hasData) {
    return null; // Don't show if data exists
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <CardTitle>Database Setup Required</CardTitle>
          <CardDescription>
            It looks like this is a fresh installation. Would you like to initialize with sample data?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleInitialize} 
            disabled={isInitializing}
            className="w-full"
          >
            {isInitializing ? (
              <>
                <Database className="h-4 w-4 mr-2 animate-pulse" />
                Initializing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Initialize Sample Data
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This will create sample manga and novel series with chapters
          </p>
        </CardContent>
      </Card>
    </div>
  );
};