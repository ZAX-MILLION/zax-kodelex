import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Crown,
  Star,
  Plus,
  Edit,
  Trash2,
  Users,
  AlertTriangle,
  Settings,
  Palette,
  Gift
} from 'lucide-react';

interface AdminProfileControlsProps {
  userId?: string;
}

export const AdminProfileControls: React.FC<AdminProfileControlsProps> = ({ userId }) => {
  const [badges, setBadges] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [newBadge, setNewBadge] = useState({
    badge_id: '',
    badge_name: '',
    badge_description: '',
    badge_color: '#3B82F6',
    badge_rarity: 'common',
    is_premium: false,
    coin_cost: 0
  });
  const [newTheme, setNewTheme] = useState({
    theme_id: '',
    theme_name: '',
    theme_description: '',
    css_variables: '{}',
    is_premium: false,
    coin_cost: 0
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Load badges
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('*')
        .order('created_at', { ascending: false });
      setBadges(badgesData || []);

      // Load themes
      const { data: themesData } = await supabase
        .from('profile_themes')
        .select('*')
        .order('created_at', { ascending: false });
      setThemes(themesData || []);

      // Load users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, email, role, is_banned')
        .order('created_at', { ascending: false })
        .limit(100);
      setUsers(usersData || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBadge = async () => {
    try {
      const { error } = await supabase
        .from('user_badges')
        .insert([newBadge]);

      if (error) throw error;

      toast({
        title: "Badge created",
        description: "New badge has been created successfully.",
      });

      setNewBadge({
        badge_id: '',
        badge_name: '',
        badge_description: '',
        badge_color: '#3B82F6',
        badge_rarity: 'common',
        is_premium: false,
        coin_cost: 0
      });
      
      loadData();
    } catch (error) {
      console.error('Error creating badge:', error);
      toast({
        title: "Error",
        description: "Failed to create badge.",
        variant: "destructive",
      });
    }
  };

  const createTheme = async () => {
    try {
      let cssVariables = {};
      try {
        cssVariables = JSON.parse(newTheme.css_variables);
      } catch {
        cssVariables = {};
      }

      const { error } = await supabase
        .from('profile_themes')
        .insert([{
          ...newTheme,
          css_variables: cssVariables
        }]);

      if (error) throw error;

      toast({
        title: "Theme created",
        description: "New theme has been created successfully.",
      });

      setNewTheme({
        theme_id: '',
        theme_name: '',
        theme_description: '',
        css_variables: '{}',
        is_premium: false,
        coin_cost: 0
      });
      
      loadData();
    } catch (error) {
      console.error('Error creating theme:', error);
      toast({
        title: "Error",
        description: "Failed to create theme.",
        variant: "destructive",
      });
    }
  };

  const assignBadgeToUser = async (badgeId: string, targetUserId: string) => {
    try {
      const { error } = await supabase
        .from('user_badge_assignments')
        .insert([{
          user_id: targetUserId,
          badge_id: badgeId,
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error && !error.message.includes('duplicate')) throw error;

      toast({
        title: "Badge assigned",
        description: "Badge has been assigned to the user.",
      });
    } catch (error) {
      console.error('Error assigning badge:', error);
      toast({
        title: "Error",
        description: "Failed to assign badge.",
        variant: "destructive",
      });
    }
  };

  const toggleUserBan = async (targetUserId: string, isBanned: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !isBanned })
        .eq('user_id', targetUserId);

      if (error) throw error;

      toast({
        title: isBanned ? "User unbanned" : "User banned",
        description: `User has been ${isBanned ? 'unbanned' : 'banned'} successfully.`,
      });

      loadData();
    } catch (error) {
      console.error('Error updating user ban status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (targetUserId: string, newRole: "author" | "admin" | "user" | "editor" | "member" | "uploader" | "seo_manager") => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', targetUserId);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });

      loadData();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const deleteBadge = async (badgeId: string) => {
    try {
      // First remove all assignments
      await supabase
        .from('user_badge_assignments')
        .delete()
        .eq('badge_id', badgeId);

      // Then delete the badge
      const { error } = await supabase
        .from('user_badges')
        .delete()
        .eq('badge_id', badgeId);

      if (error) throw error;

      toast({
        title: "Badge deleted",
        description: "Badge has been deleted successfully.",
      });

      loadData();
    } catch (error) {
      console.error('Error deleting badge:', error);
      toast({
        title: "Error",
        description: "Failed to delete badge.",
        variant: "destructive",
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-yellow-500';
      case 'epic':
        return 'text-purple-500';
      case 'rare':
        return 'text-blue-500';
      case 'uncommon':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center">
          <Shield className="h-6 w-6 mr-2" />
          Admin Profile Controls
        </h1>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.slice(0, 12).map((user) => (
              <div key={user.user_id} className="border rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="font-medium">
                    {user.display_name || user.username || 'Unknown'}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                      {user.role}
                    </Badge>
                    {user.is_banned && (
                      <Badge variant="destructive">Banned</Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select
                    value={user.role}
                    onValueChange={(role) => updateUserRole(user.user_id, role as "author" | "admin" | "user" | "editor" | "member" | "uploader" | "seo_manager")}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="author">Author</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={user.is_banned ? "outline" : "destructive"}
                    size="sm"
                    onClick={() => toggleUserBan(user.user_id, user.is_banned)}
                  >
                    {user.is_banned ? "Unban" : "Ban"}
                  </Button>
                </div>

                {/* Quick Badge Assignment */}
                <div className="space-y-2">
                  <Label className="text-xs">Quick Badge Assignment</Label>
                  <div className="flex flex-wrap gap-1">
                    {badges.slice(0, 4).map((badge) => (
                      <Button
                        key={badge.badge_id}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => assignBadgeToUser(badge.badge_id, user.user_id)}
                      >
                        {badge.badge_name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badge Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Badge Management
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Badge
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Badge</DialogTitle>
                  <DialogDescription>
                    Create a new badge that can be assigned to users.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="badge-id">Badge ID</Label>
                    <Input
                      id="badge-id"
                      value={newBadge.badge_id}
                      onChange={(e) => setNewBadge({ ...newBadge, badge_id: e.target.value })}
                      placeholder="unique-badge-id"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badge-name">Badge Name</Label>
                    <Input
                      id="badge-name"
                      value={newBadge.badge_name}
                      onChange={(e) => setNewBadge({ ...newBadge, badge_name: e.target.value })}
                      placeholder="Badge Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badge-description">Description</Label>
                    <Textarea
                      id="badge-description"
                      value={newBadge.badge_description}
                      onChange={(e) => setNewBadge({ ...newBadge, badge_description: e.target.value })}
                      placeholder="Badge description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="badge-color">Color</Label>
                      <Input
                        id="badge-color"
                        type="color"
                        value={newBadge.badge_color}
                        onChange={(e) => setNewBadge({ ...newBadge, badge_color: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="badge-rarity">Rarity</Label>
                      <Select
                        value={newBadge.badge_rarity}
                        onValueChange={(value) => setNewBadge({ ...newBadge, badge_rarity: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="common">Common</SelectItem>
                          <SelectItem value="uncommon">Uncommon</SelectItem>
                          <SelectItem value="rare">Rare</SelectItem>
                          <SelectItem value="epic">Epic</SelectItem>
                          <SelectItem value="legendary">Legendary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newBadge.is_premium}
                        onCheckedChange={(checked) => setNewBadge({ ...newBadge, is_premium: checked })}
                      />
                      <Label>Premium Badge</Label>
                    </div>

                    {newBadge.is_premium && (
                      <div className="space-y-2">
                        <Label htmlFor="coin-cost">Coin Cost</Label>
                        <Input
                          id="coin-cost"
                          type="number"
                          value={newBadge.coin_cost}
                          onChange={(e) => setNewBadge({ ...newBadge, coin_cost: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    )}
                  </div>

                  <Button onClick={createBadge} className="w-full">
                    Create Badge
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div key={badge.badge_id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{badge.badge_name}</h3>
                    <p className="text-sm text-muted-foreground">{badge.badge_description}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteBadge(badge.badge_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className={`capitalize ${getRarityColor(badge.badge_rarity)}`}>
                    {badge.badge_rarity}
                  </span>
                  {badge.is_premium && (
                    <Badge variant="secondary">
                      <Crown className="h-3 w-3 mr-1" />
                      {badge.coin_cost} coins
                    </Badge>
                  )}
                </div>

                <div 
                  className="h-2 rounded"
                  style={{ backgroundColor: badge.badge_color }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Theme Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Theme Management
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Theme
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Theme</DialogTitle>
                  <DialogDescription>
                    Create a new profile theme for users.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme-id">Theme ID</Label>
                    <Input
                      id="theme-id"
                      value={newTheme.theme_id}
                      onChange={(e) => setNewTheme({ ...newTheme, theme_id: e.target.value })}
                      placeholder="unique-theme-id"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme-name">Theme Name</Label>
                    <Input
                      id="theme-name"
                      value={newTheme.theme_name}
                      onChange={(e) => setNewTheme({ ...newTheme, theme_name: e.target.value })}
                      placeholder="Theme Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme-description">Description</Label>
                    <Textarea
                      id="theme-description"
                      value={newTheme.theme_description}
                      onChange={(e) => setNewTheme({ ...newTheme, theme_description: e.target.value })}
                      placeholder="Theme description..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="css-variables">CSS Variables (JSON)</Label>
                    <Textarea
                      id="css-variables"
                      value={newTheme.css_variables}
                      onChange={(e) => setNewTheme({ ...newTheme, css_variables: e.target.value })}
                      placeholder='{"bg": "#ffffff", "text": "#000000"}'
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newTheme.is_premium}
                        onCheckedChange={(checked) => setNewTheme({ ...newTheme, is_premium: checked })}
                      />
                      <Label>Premium Theme</Label>
                    </div>

                    {newTheme.is_premium && (
                      <div className="space-y-2">
                        <Label htmlFor="theme-coin-cost">Coin Cost</Label>
                        <Input
                          id="theme-coin-cost"
                          type="number"
                          value={newTheme.coin_cost}
                          onChange={(e) => setNewTheme({ ...newTheme, coin_cost: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    )}
                  </div>

                  <Button onClick={createTheme} className="w-full">
                    Create Theme
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <div key={theme.theme_id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{theme.theme_name}</h3>
                    <p className="text-sm text-muted-foreground">{theme.theme_description}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {theme.is_premium && (
                  <Badge variant="secondary">
                    <Crown className="h-3 w-3 mr-1" />
                    {theme.coin_cost} coins
                  </Badge>
                )}

                <div 
                  className="h-8 rounded border"
                  style={{
                    backgroundColor: theme.css_variables?.bg || '#ffffff',
                    color: theme.css_variables?.text || '#000000'
                  }}
                >
                  <div className="p-1 text-xs">Preview</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Use these quick actions to manage users efficiently. Be careful as some actions are irreversible.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>Bulk Badge Assignment</span>
              <span className="text-xs text-muted-foreground">Assign badges to multiple users</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex-col">
              <Crown className="h-6 w-6 mb-2" />
              <span>Premium Management</span>
              <span className="text-xs text-muted-foreground">Manage premium features</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              <span>Global Settings</span>
              <span className="text-xs text-muted-foreground">Configure profile system</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};