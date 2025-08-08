import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CursorSettings {
  cursor_type: string;
  cursor_size: number;
  cursor_trail: boolean;
  cursor_glow: boolean;
  custom_cursor_url?: string;
}

export const CursorSettings = () => {
  const [settings, setSettings] = useState<CursorSettings>({
    cursor_type: 'default',
    cursor_size: 16,
    cursor_trail: false,
    cursor_glow: false,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();

      if (data && !error) {
        setSettings({
          cursor_type: (data as any).cursor_type || 'default',
          cursor_size: (data as any).cursor_size || 16,
          cursor_trail: (data as any).cursor_trail || false,
          cursor_glow: (data as any).cursor_glow || false,
          custom_cursor_url: (data as any).custom_cursor_url,
        });
      }
    } catch (error) {
      console.error('Error loading cursor settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          ...(settings as any),
        } as any);

      if (error) throw error;

      // Apply cursor settings immediately
      applyCursorStyles();

      toast({
        title: "Success",
        description: "Cursor settings saved successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyCursorStyles = () => {
    const root = document.documentElement;
    
    // Remove existing cursor classes
    document.body.className = document.body.className.replace(/cursor-\w+/g, '');
    
    // Apply new cursor settings
    if (settings.cursor_type !== 'default') {
      document.body.classList.add(`cursor-${settings.cursor_type}`);
    }
    
    root.style.setProperty('--cursor-size', `${settings.cursor_size}px`);
    
    if (settings.cursor_trail) {
      document.body.classList.add('cursor-trail');
    }
    
    if (settings.cursor_glow) {
      document.body.classList.add('cursor-glow');
    }
  };

  const cursorTypes = [
    { value: 'default', label: 'Default' },
    { value: 'pointer', label: 'Pointer' },
    { value: 'crosshair', label: 'Crosshair' },
    { value: 'text', label: 'Text' },
    { value: 'wait', label: 'Wait' },
    { value: 'help', label: 'Help' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mouse Cursor Customization</CardTitle>
          <CardDescription>
            Customize the mouse cursor appearance and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cursor-type">Cursor Type</Label>
            <Select
              value={settings.cursor_type}
              onValueChange={(value) => setSettings(prev => ({ ...prev, cursor_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cursor type" />
              </SelectTrigger>
              <SelectContent>
                {cursorTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cursor-size">Cursor Size: {settings.cursor_size}px</Label>
            <Slider
              value={[settings.cursor_size]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, cursor_size: value }))}
              max={32}
              min={12}
              step={2}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="cursor-trail"
              checked={settings.cursor_trail}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, cursor_trail: checked }))}
            />
            <Label htmlFor="cursor-trail">Enable Cursor Trail</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="cursor-glow"
              checked={settings.cursor_glow}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, cursor_glow: checked }))}
            />
            <Label htmlFor="cursor-glow">Enable Cursor Glow</Label>
          </div>

          <Button onClick={saveSettings} disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Cursor Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};