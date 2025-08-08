import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { seedComprehensiveData } from '@/utils/seedComprehensiveData';
import { useToast } from '@/hooks/use-toast';
import { Database, Loader2 } from 'lucide-react';

export const TestDataSeedButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    try {
      setLoading(true);
      const result = await seedComprehensiveData();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Comprehensive test data has been seeded successfully!",
        });
      } else {
        throw new Error("Seeding failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to seed test data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSeed} 
      disabled={loading}
      variant="outline"
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {loading ? 'Seeding...' : 'Seed Test Data'}
    </Button>
  );
};