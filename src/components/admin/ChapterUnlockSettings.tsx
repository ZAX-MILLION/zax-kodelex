import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Coins, Lock, Unlock, Save } from 'lucide-react';

interface ChapterUnlockConfig {
  default_unlock_cost: number;
  enable_premium_chapters: boolean;
  free_chapters_per_series: number;
  unlock_duration_hours: number;
}

const ChapterUnlockSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ChapterUnlockConfig>({
    default_unlock_cost: 10,
    enable_premium_chapters: true,
    free_chapters_per_series: 3,
    unlock_duration_hours: 168, // 7 days
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would save to a settings table
      // For now, we'll just store in localStorage
      localStorage.setItem('chapter_unlock_config', JSON.stringify(config));
      
      toast({
        title: "Settings Saved",
        description: "Chapter unlock settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load existing config from localStorage
    const stored = localStorage.getItem('chapter_unlock_config');
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading config:', error);
      }
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Lock className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Chapter Unlock Settings</h1>
          <p className="text-muted-foreground">Configure premium chapter access and coin costs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Premium Chapters Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Premium Chapter Settings
            </CardTitle>
            <CardDescription>
              Configure how users access premium content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-premium">Enable Premium Chapters</Label>
              <Switch
                id="enable-premium"
                checked={config.enable_premium_chapters}
                onCheckedChange={(checked) =>
                  setConfig(prev => ({ ...prev, enable_premium_chapters: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-cost">Default Unlock Cost (Coins)</Label>
              <Input
                id="default-cost"
                type="number"
                value={config.default_unlock_cost}
                onChange={(e) =>
                  setConfig(prev => ({ ...prev, default_unlock_cost: parseInt(e.target.value) || 0 }))
                }
                min="1"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="free-chapters">Free Chapters per Series</Label>
              <Input
                id="free-chapters"
                type="number"
                value={config.free_chapters_per_series}
                onChange={(e) =>
                  setConfig(prev => ({ ...prev, free_chapters_per_series: parseInt(e.target.value) || 0 }))
                }
                min="0"
                max="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unlock-duration">Unlock Duration (Hours)</Label>
              <Input
                id="unlock-duration"
                type="number"
                value={config.unlock_duration_hours}
                onChange={(e) =>
                  setConfig(prev => ({ ...prev, unlock_duration_hours: parseInt(e.target.value) || 0 }))
                }
                min="1"
                max="8760"
              />
              <p className="text-sm text-muted-foreground">
                How long chapters remain unlocked (168 hours = 7 days)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview & Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Unlock className="h-5 w-5" />
              Configuration Summary
            </CardTitle>
            <CardDescription>
              Preview of current settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Premium Chapters:</span>
                <span className="text-sm">
                  {config.enable_premium_chapters ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Default Cost:</span>
                <span className="text-sm">{config.default_unlock_cost} coins</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Free Chapters:</span>
                <span className="text-sm">{config.free_chapters_per_series} per series</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Unlock Duration:</span>
                <span className="text-sm">
                  {config.unlock_duration_hours} hours 
                  ({Math.round(config.unlock_duration_hours / 24)} days)
                </span>
              </div>
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChapterUnlockSettings;