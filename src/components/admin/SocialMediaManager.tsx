import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  ExternalLink,
  GripVertical,
  Users,
  Heart,
  DollarSign,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SocialPlatform {
  id: string;
  platform_name: string;
  platform_url: string;
  icon_type: string;
  custom_icon_url?: string;
  is_enabled: boolean;
  display_order: number;
  platform_color?: string;
  created_at: string;
  updated_at: string;
}

const getIconForPlatform = (platformName: string) => {
  switch (platformName.toLowerCase()) {
    case 'patreon':
      return Heart;
    case 'discord':
      return Users;
    case 'paypal':
      return DollarSign;
    case 'ko-fi':
      return Zap;
    default:
      return Heart;
  }
};

const SocialMediaManager = () => {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPlatform, setNewPlatform] = useState({
    platform_name: '',
    platform_url: '',
    platform_color: '#ff0000',
    is_enabled: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_settings')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPlatforms(data || []);
    } catch (error) {
      console.error('Error fetching platforms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load social media platforms',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (platform: SocialPlatform) => {
    try {
      const { error } = await supabase
        .from('social_media_settings')
        .update({
          platform_name: platform.platform_name,
          platform_url: platform.platform_url,
          platform_color: platform.platform_color,
          is_enabled: platform.is_enabled
        })
        .eq('id', platform.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Platform updated successfully'
      });

      setEditingId(null);
      fetchPlatforms();
    } catch (error) {
      console.error('Error updating platform:', error);
      toast({
        title: 'Error',
        description: 'Failed to update platform',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this platform?')) return;

    try {
      const { error } = await supabase
        .from('social_media_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Platform deleted successfully'
      });

      fetchPlatforms();
    } catch (error) {
      console.error('Error deleting platform:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete platform',
        variant: 'destructive'
      });
    }
  };

  const handleAddNew = async () => {
    if (!newPlatform.platform_name || !newPlatform.platform_url) {
      toast({
        title: 'Error',
        description: 'Platform name and URL are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const maxOrder = Math.max(...platforms.map(p => p.display_order), 0);
      
      const { error } = await supabase
        .from('social_media_settings')
        .insert({
          platform_name: newPlatform.platform_name,
          platform_url: newPlatform.platform_url,
          platform_color: newPlatform.platform_color,
          is_enabled: newPlatform.is_enabled,
          display_order: maxOrder + 1,
          icon_type: 'lucide'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'New platform added successfully'
      });

      setIsAddingNew(false);
      setNewPlatform({
        platform_name: '',
        platform_url: '',
        platform_color: '#ff0000',
        is_enabled: true
      });
      fetchPlatforms();
    } catch (error) {
      console.error('Error adding platform:', error);
      toast({
        title: 'Error',
        description: 'Failed to add platform',
        variant: 'destructive'
      });
    }
  };

  const updateDisplayOrder = async (platforms: SocialPlatform[]) => {
    try {
      const updates = platforms.map((platform, index) => ({
        id: platform.id,
        display_order: index + 1
      }));

      for (const update of updates) {
        await supabase
          .from('social_media_settings')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      toast({
        title: 'Success',
        description: 'Display order updated successfully'
      });
    } catch (error) {
      console.error('Error updating display order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update display order',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Social Media Platforms</CardTitle>
          <Button
            onClick={() => setIsAddingNew(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Platform
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Platform Form */}
        {isAddingNew && (
          <Card className="border-dashed border-2">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input
                    id="platform-name"
                    value={newPlatform.platform_name}
                    onChange={(e) => setNewPlatform(prev => ({ ...prev, platform_name: e.target.value }))}
                    placeholder="e.g., Patreon, Discord"
                  />
                </div>
                <div>
                  <Label htmlFor="platform-url">Platform URL</Label>
                  <Input
                    id="platform-url"
                    value={newPlatform.platform_url}
                    onChange={(e) => setNewPlatform(prev => ({ ...prev, platform_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div>
                  <Label htmlFor="platform-color">Color</Label>
                  <Input
                    id="platform-color"
                    type="color"
                    value={newPlatform.platform_color}
                    onChange={(e) => setNewPlatform(prev => ({ ...prev, platform_color: e.target.value }))}
                    className="w-20 h-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="platform-enabled"
                    checked={newPlatform.is_enabled}
                    onCheckedChange={(checked) => setNewPlatform(prev => ({ ...prev, is_enabled: checked }))}
                  />
                  <Label htmlFor="platform-enabled">Enabled</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddNew} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button 
                  onClick={() => setIsAddingNew(false)} 
                  variant="outline" 
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Platforms */}
        <div className="space-y-3">
          {platforms.map((platform) => {
            const IconComponent = getIconForPlatform(platform.platform_name);
            const isEditing = editingId === platform.id;

            return (
              <Card key={platform.id} className="relative">
                <CardContent className="p-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Platform Name</Label>
                          <Input
                            value={platform.platform_name}
                            onChange={(e) => {
                              setPlatforms(platforms.map(p => 
                                p.id === platform.id ? { ...p, platform_name: e.target.value } : p
                              ));
                            }}
                          />
                        </div>
                        <div>
                          <Label>Platform URL</Label>
                          <Input
                            value={platform.platform_url}
                            onChange={(e) => {
                              setPlatforms(platforms.map(p => 
                                p.id === platform.id ? { ...p, platform_url: e.target.value } : p
                              ));
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div>
                          <Label>Color</Label>
                          <Input
                            type="color"
                            value={platform.platform_color || '#ff0000'}
                            onChange={(e) => {
                              setPlatforms(platforms.map(p => 
                                p.id === platform.id ? { ...p, platform_color: e.target.value } : p
                              ));
                            }}
                            className="w-20 h-10"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={platform.is_enabled}
                            onCheckedChange={(checked) => {
                              setPlatforms(platforms.map(p => 
                                p.id === platform.id ? { ...p, is_enabled: checked } : p
                              ));
                            }}
                          />
                          <Label>Enabled</Label>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => handleSave(platform)} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          onClick={() => setEditingId(null)} 
                          variant="outline" 
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: platform.platform_color + '20' }}
                        >
                          <IconComponent 
                            className="h-4 w-4" 
                            style={{ color: platform.platform_color }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{platform.platform_name}</h3>
                            {platform.is_enabled ? (
                              <Badge variant="default" className="bg-green-500/20 text-green-600">
                                Enabled
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                Disabled
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{platform.platform_url}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(platform.platform_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(platform.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(platform.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {platforms.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No social media platforms configured yet.</p>
            <p className="text-sm">Click "Add Platform" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialMediaManager;
