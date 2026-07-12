import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  change_type: string;
  release_date: string;
  version: string;
}

interface ChangelogIndicatorProps {
  componentName: string;
  className?: string;
}

export const ChangelogIndicator = ({ componentName, className = "" }: ChangelogIndicatorProps) => {
  const [latestEntries, setLatestEntries] = useState<ChangelogEntry[]>([]);
  const [showChangelog, setShowChangelog] = useState(false);

  useEffect(() => {
    loadLatestChanges();
  }, [componentName]);

  const loadLatestChanges = async () => {
    try {
      const { data, error } = await supabase
        .from('system_changelog')
        .select('*')
        .eq('is_published', true)
        .order('release_date', { ascending: false })
        .limit(3);

      if (error) throw error;
      
      // Filter for entries that might affect this component
      const relevantEntries = (data || []).filter(entry => 
        entry.developer_notes?.toLowerCase().includes(componentName.toLowerCase()) ||
        entry.description?.toLowerCase().includes(componentName.toLowerCase()) ||
        entry.title?.toLowerCase().includes(componentName.toLowerCase())
      );
      
      setLatestEntries(relevantEntries.slice(0, 2));
    } catch (error) {
      console.error('Error loading changelog:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'default';
      case 'bugfix':
        return 'destructive';
      case 'security':
        return 'secondary';
      case 'performance':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Only show if there are recent relevant changes
  if (latestEntries.length === 0) return null;

  return (
    <TooltipProvider>
      <Dialog open={showChangelog} onOpenChange={setShowChangelog}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 ${className}`}
              >
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Recent changes to {componentName}</p>
          </TooltipContent>
        </Tooltip>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Recent Changes - {componentName}
            </DialogTitle>
            <DialogDescription>
              Latest updates and improvements
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {latestEntries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant={getTypeColor(entry.change_type) as any} className="text-xs">
                    {entry.change_type}
                  </Badge>
                  {entry.version && (
                    <Badge variant="outline" className="text-xs">
                      {entry.version}
                    </Badge>
                  )}
                </div>
                <h4 className="font-medium text-sm mb-1">{entry.title}</h4>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {entry.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(entry.release_date), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};