import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Link, 
  Unlink, 
  Search, 
  BookOpen, 
  FileText,
  CheckCircle,
  X
} from 'lucide-react';

interface Series {
  id: string;
  title: string;
  cover_image_url: string;
  genres?: string[];
  description?: string;
  status?: string;
}

interface SeriesLinkingPanelProps {
  currentSeriesId: string;
  onLinkedSeriesUpdate?: () => void;
}

export const SeriesLinkingPanel: React.FC<SeriesLinkingPanelProps> = ({
  currentSeriesId,
  onLinkedSeriesUpdate
}) => {
  const [currentSeries, setCurrentSeries] = useState<Series | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableSeries, setAvailableSeries] = useState<Series[]>([]);
  const [linkedSeries, setLinkedSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentSeries();
    loadAvailableSeries();
  }, [currentSeriesId]);

  const loadCurrentSeries = async () => {
    try {
      const { data, error } = await supabase
        .from('manga_meta')
        .select('id, title, cover_image_url, genres, description, status')
        .eq('id', currentSeriesId)
        .single();

      if (error) throw error;
      setCurrentSeries(data);

      // Note: Series linking will be available once database migration is complete
    } catch (error) {
      console.error('Error loading current series:', error);
    }
  };

  const loadAvailableSeries = async () => {
    try {
      const { data, error } = await supabase
        .from('manga_meta')
        .select('id, title, cover_image_url, genres, description, status')
        .neq('id', currentSeriesId)
        .order('title');

      if (error) throw error;
      setAvailableSeries(data || []);
    } catch (error) {
      console.error('Error loading available series:', error);
    }
  };

  const handleLinkSeries = async (targetSeriesId: string) => {
    setLoading(true);
    try {
      toast({
        title: "Coming Soon",
        description: "Series linking feature requires database migration to add linked_series_id field.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error linking series:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkSeries = async () => {
    if (!linkedSeries) return;

    setLoading(true);
    try {
      toast({
        title: "Coming Soon",
        description: "Series unlinking feature requires database migration to add linked_series_id field.",
        variant: "default",
      });

      setLinkedSeries(null);
      onLinkedSeriesUpdate?.();

    } catch (error) {
      console.error('Error unlinking series:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'manga':
      case 'webtoon':
        return <BookOpen className="h-4 w-4" />;
      case 'novel':
      case 'light_novel':
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const filteredSeries = availableSeries.filter(series =>
    series.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentSeries) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Link Series (Manga ↔ Novel)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Series Info */}
        <div>
          <Label className="text-sm font-medium">Current Series</Label>
          <div className="mt-2 flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-12 h-16 rounded bg-background overflow-hidden">
              <img
                src={currentSeries.cover_image_url}
                alt={currentSeries.title}
                className="w-full h-full object-cover"
                onError={(e) => e.currentTarget.src = '/placeholder.svg'}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{currentSeries.title}</h3>
              <Badge variant="outline" className="mt-1">
                <BookOpen className="h-4 w-4" />
                <span className="ml-2">Series</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Current Link Status */}
        {linkedSeries ? (
          <div>
            <Label className="text-sm font-medium">Currently Linked To</Label>
            <div className="mt-2 flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="w-12 h-16 rounded bg-background overflow-hidden">
                <img
                  src={linkedSeries.cover_image_url}
                  alt={linkedSeries.title}
                  className="w-full h-full object-cover"
                  onError={(e) => e.currentTarget.src = '/placeholder.svg'}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{linkedSeries.title}</h3>
                <Badge variant="outline" className="mt-1">
                  <BookOpen className="h-4 w-4" />
                  <span className="ml-2">Series</span>
                </Badge>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleUnlinkSeries}
                disabled={loading}
              >
                <Unlink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Label className="text-sm font-medium">Link Status</Label>
            <div className="mt-2 p-3 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground">
              No linked series
            </div>
          </div>
        )}

        <Separator />

        {/* Search and Link New Series */}
        {!linkedSeries && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">Link to Another Series</Label>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for series to link..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Available Series */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredSeries.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  {searchQuery ? 'No series found matching your search.' : 'No available series to link.'}
                </div>
              ) : (
                filteredSeries.map((series) => (
                  <div
                    key={series.id}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-14 rounded bg-background overflow-hidden">
                      <img
                        src={series.cover_image_url}
                        alt={series.title}
                        className="w-full h-full object-cover"
                        onError={(e) => e.currentTarget.src = '/placeholder.svg'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{series.title}</h4>
                      <Badge variant="outline" className="mt-1 text-xs">
                        <BookOpen className="h-4 w-4" />
                        <span className="ml-1">Series</span>
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleLinkSeries(series.id)}
                      disabled={loading}
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};