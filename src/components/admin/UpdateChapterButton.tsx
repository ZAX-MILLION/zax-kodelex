import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateAllChaptersWithTenPages } from '@/utils/updateChapterPages';
import { BookOpen, Loader2 } from 'lucide-react';

export const UpdateChapterButton = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdateAll = async () => {
    setIsUpdating(true);
    try {
      const result = await updateAllChaptersWithTenPages();
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Updated ${result.successCount} chapters with 10 pages each`,
          variant: "default"
        });
      } else {
        toast({
          title: "Partial Success",
          description: `Updated ${result.successCount}/${result.totalChapters} chapters. ${result.errorCount} failed.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update chapters",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button 
      onClick={handleUpdateAll}
      disabled={isUpdating}
      className="gap-2"
    >
      {isUpdating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <BookOpen className="h-4 w-4" />
      )}
      Update ALL Chapters with 10 Pages
    </Button>
  );
};