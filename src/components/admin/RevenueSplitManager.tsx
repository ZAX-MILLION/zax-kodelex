import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  BookOpen,
  Settings,
  Save,
  RotateCcw,
  Calculator
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthorRevenue {
  author_id: string;
  author_name: string;
  series_count: number;
  total_earnings: number;
  default_share: number;
  series: {
    id: string;
    title: string;
    type: 'manga' | 'novel';
    earnings: number;
    current_share: number;
  }[];
}

interface GlobalSettings {
  default_author_share: number;
  platform_fee: number;
  payment_threshold: number;
  payment_schedule: 'weekly' | 'monthly' | 'quarterly';
}

export const RevenueSplitManager: React.FC = () => {
  const { toast } = useToast();
  const [authors, setAuthors] = useState<AuthorRevenue[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    default_author_share: 90,
    platform_fee: 10,
    payment_threshold: 50,
    payment_schedule: 'monthly'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    setLoading(true);
    try {
      // Using mock data since series table doesn't exist yet
      const mockAuthors: AuthorRevenue[] = [
        {
          author_id: 'author1',
          author_name: 'John Doe',
          series_count: 3,
          total_earnings: 2500,
          default_share: 90,
          series: [
            { id: '1', title: 'Adventure Story', type: 'manga', earnings: 1000, current_share: 90 },
            { id: '2', title: 'Mystery Novel', type: 'novel', earnings: 800, current_share: 85 },
            { id: '3', title: 'Action Series', type: 'manga', earnings: 700, current_share: 90 }
          ]
        },
        {
          author_id: 'author2', 
          author_name: 'Jane Smith',
          series_count: 2,
          total_earnings: 1800,
          default_share: 85,
          series: [
            { id: '4', title: 'Romance Story', type: 'novel', earnings: 1200, current_share: 85 },
            { id: '5', title: 'Drama Series', type: 'manga', earnings: 600, current_share: 85 }
          ]
        }
      ];

      setAuthors(mockAuthors);

    } catch (error: any) {
      console.error('Error loading revenue data:', error);
      toast({
        title: "Error",
        description: "Failed to load revenue data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGlobalSettings = async () => {
    setSaving(true);
    try {
      // In a real app, this would update global settings in the database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: "Success",
        description: "Global settings updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateAuthorShare = async (authorId: string, newShare: number) => {
    try {
      // Update default share for author
      const author = authors.find(a => a.author_id === authorId);
      if (!author) return;

      // Mock update until proper analytics table exists
      setAuthors(prev => prev.map(a => 
        a.author_id === authorId 
          ? { 
              ...a, 
              default_share: newShare,
              series: a.series.map(s => ({ ...s, current_share: newShare }))
            }
          : a
      ));

      toast({
        title: "Success",
        description: `Updated revenue share for ${author.author_name}`
      });

      loadRevenueData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update revenue share",
        variant: "destructive"
      });
    }
  };

  const updateSeriesShare = async (seriesId: string, newShare: number) => {
    try {
      // Mock update until proper analytics table exists
      setAuthors(prev => prev.map(author => ({
        ...author,
        series: author.series.map(series => 
          series.id === seriesId 
            ? { ...series, current_share: newShare }
            : series
        )
      })));

      toast({
        title: "Success",
        description: "Series revenue share updated (mock)"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update series share",
        variant: "destructive"
      });
    }
  };

  const resetToDefault = (authorId: string) => {
    updateAuthorShare(authorId, globalSettings.default_author_share);
  };

  const selectedAuthorData = selectedAuthor ? authors.find(a => a.author_id === selectedAuthor) : null;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading revenue data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Revenue Split Manager</h1>
        <p className="text-muted-foreground">Manage author revenue shares and payment settings</p>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Revenue Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label>Default Author Share (%)</Label>
              <div className="space-y-3">
                <Slider
                  value={[globalSettings.default_author_share]}
                  onValueChange={(value) => setGlobalSettings(prev => ({ ...prev, default_author_share: value[0] }))}
                  max={95}
                  min={50}
                  step={5}
                  className="flex-1"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>50%</span>
                  <span className="font-medium">{globalSettings.default_author_share}%</span>
                  <span>95%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Platform Fee (%)</Label>
              <Input
                type="number"
                value={globalSettings.platform_fee}
                onChange={(e) => setGlobalSettings(prev => ({ 
                  ...prev, 
                  platform_fee: Number(e.target.value) 
                }))}
                min={5}
                max={50}
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Threshold ($)</Label>
              <Input
                type="number"
                value={globalSettings.payment_threshold}
                onChange={(e) => setGlobalSettings(prev => ({ 
                  ...prev, 
                  payment_threshold: Number(e.target.value) 
                }))}
                min={10}
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Schedule</Label>
              <Select 
                value={globalSettings.payment_schedule}
                onValueChange={(value) => setGlobalSettings(prev => ({ 
                  ...prev, 
                  payment_schedule: value as any 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={updateGlobalSettings} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Authors</p>
                <p className="text-3xl font-bold">{authors.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Earnings</p>
                <p className="text-3xl font-bold">
                  ${authors.reduce((sum, a) => sum + a.total_earnings, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Avg Revenue Share</p>
                <p className="text-3xl font-bold">
                  {authors.length > 0 
                    ? Math.round(authors.reduce((sum, a) => sum + a.default_share, 0) / authors.length)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Authors Revenue Management */}
      <Card>
        <CardHeader>
          <CardTitle>Author Revenue Shares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {authors.map((author) => (
              <div key={author.author_id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{author.author_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{author.series_count} series</span>
                      <span>${author.total_earnings.toLocaleString()} total earnings</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAuthor(
                        selectedAuthor === author.author_id ? null : author.author_id
                      )}
                    >
                      {selectedAuthor === author.author_id ? 'Hide Details' : 'Show Details'}
                    </Button>
                  </div>
                </div>

                {/* Author-level revenue share */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label>Default Revenue Share for All Series</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[author.default_share]}
                        onValueChange={(value) => {
                          const newShare = value[0];
                          setAuthors(prev => prev.map(a => 
                            a.author_id === author.author_id 
                              ? { ...a, default_share: newShare }
                              : a
                          ));
                        }}
                        max={95}
                        min={50}
                        step={5}
                        className="flex-1"
                      />
                      <span className="min-w-12 font-medium">{author.default_share}%</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateAuthorShare(author.author_id, author.default_share)}
                      >
                        Apply to All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetToDefault(author.author_id)}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Earnings Breakdown</Label>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Gross Earnings:</span>
                        <span>${author.total_earnings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Author Share ({author.default_share}%):</span>
                        <span className="font-semibold text-green-600">
                          ${Math.round(author.total_earnings * author.default_share / 100).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fee:</span>
                        <span>${Math.round(author.total_earnings * (100 - author.default_share) / 100).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Series-level details */}
                {selectedAuthor === author.author_id && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium mb-4">Individual Series Settings</h4>
                    <div className="space-y-3">
                      {author.series.map((series) => (
                        <div key={series.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium">{series.title}</h5>
                              <Badge variant={series.type === 'manga' ? 'default' : 'secondary'}>
                                {series.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ${series.earnings} earnings • {series.current_share}% share
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Slider
                              value={[series.current_share]}
                              onValueChange={(value) => updateSeriesShare(series.id, value[0])}
                              max={95}
                              min={50}
                              step={5}
                              className="w-24"
                            />
                            <span className="min-w-12 text-sm font-medium">{series.current_share}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};