import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Users, Award } from 'lucide-react';
import { BadgeIcon } from '../badges/BadgeIcon';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Badge {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  color: string;
  rarity: string;
  is_hidden: boolean;
  is_premium: boolean;
  is_animated: boolean;
  category: string;
  sort_order: number;
  requirements: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  username?: string;
}

export const BadgeManager: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBadges();
    fetchUsers();
  }, []);

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch badges.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, username')
        .limit(100);

      if (error) throw error;
      
      const usersList = (data || []).map(profile => ({
        id: profile.user_id,
        email: profile.email,
        username: profile.username
      }));
      
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const deleteBadge = async (badge: Badge) => {
    if (!confirm(`Are you sure you want to delete "${badge.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('badges')
        .delete()
        .eq('id', badge.id);

      if (error) throw error;

      toast({
        title: 'Badge deleted',
        description: `"${badge.name}" has been deleted.`,
      });
      
      fetchBadges();
    } catch (error) {
      console.error('Error deleting badge:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete badge.',
        variant: 'destructive',
      });
    }
  };

  const grantBadgeToUser = async (badgeId: string, userId: string, notes?: string) => {
    try {
      const { data, error } = await supabase.rpc('grant_badge_to_user', {
        target_user_id: userId,
        target_badge_id: badgeId,
        granter_id: (await supabase.auth.getUser()).data.user?.id,
        admin_notes: notes
      });

      if (error) throw error;

      if (data) {
        toast({
          title: 'Badge granted',
          description: 'Badge has been successfully granted to the user.',
        });
      } else {
        toast({
          title: 'Badge already assigned',
          description: 'This user already has this badge.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error granting badge:', error);
      toast({
        title: 'Error',
        description: 'Failed to grant badge.',
        variant: 'destructive',
      });
    }
  };

  const rarityColors = {
    common: 'bg-gray-100 text-gray-800',
    rare: 'bg-blue-100 text-blue-800',
    epic: 'bg-purple-100 text-purple-800',
    legendary: 'bg-yellow-100 text-yellow-800'
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Badge Management</h2>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Badge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Badge</DialogTitle>
              </DialogHeader>
              <BadgeForm
                onSuccess={() => {
                  setShowCreateDialog(false);
                  fetchBadges();
                }}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Award className="h-4 w-4 mr-2" />
                Grant Badge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Grant Badge to User</DialogTitle>
              </DialogHeader>
              <GrantBadgeForm
                badges={badges}
                users={users}
                onGrant={grantBadgeToUser}
                onCancel={() => setShowGrantDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Badges ({badges.length})</TabsTrigger>
          <TabsTrigger value="common">Common</TabsTrigger>
          <TabsTrigger value="rare">Rare</TabsTrigger>
          <TabsTrigger value="epic">Epic</TabsTrigger>
          <TabsTrigger value="legendary">Legendary</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <BadgeList
            badges={badges}
            onEdit={setSelectedBadge}
            onDelete={deleteBadge}
          />
        </TabsContent>

        {['common', 'rare', 'epic', 'legendary'].map((rarity) => (
          <TabsContent key={rarity} value={rarity} className="mt-6">
            <BadgeList
              badges={badges.filter(b => b.rarity === rarity)}
              onEdit={setSelectedBadge}
              onDelete={deleteBadge}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Badge Dialog */}
      <Dialog open={!!selectedBadge} onOpenChange={(open) => !open && setSelectedBadge(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Badge</DialogTitle>
          </DialogHeader>
          {selectedBadge && (
            <BadgeForm
              badge={selectedBadge}
              onSuccess={() => {
                setSelectedBadge(null);
                fetchBadges();
              }}
              onCancel={() => setSelectedBadge(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface BadgeListProps {
  badges: Badge[];
  onEdit: (badge: Badge) => void;
  onDelete: (badge: Badge) => void;
}

const BadgeList: React.FC<BadgeListProps> = ({ badges, onEdit, onDelete }) => {
  const rarityColors = {
    common: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    rare: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    epic: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    legendary: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {badges.map((badge) => (
        <Card key={badge.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <BadgeIcon
                badge={badge}
                size="lg"
                showTooltip={false}
              />
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(badge)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(badge)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">{badge.name}</div>
              {badge.description && (
                <div className="text-sm text-muted-foreground">
                  {badge.description}
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <UIBadge className={rarityColors[badge.rarity as keyof typeof rarityColors]}>
                  {badge.rarity}
                </UIBadge>
                <UIBadge variant="outline">{badge.category}</UIBadge>
                {badge.is_premium && (
                  <UIBadge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    Premium
                  </UIBadge>
                )}
                {badge.is_hidden && (
                  <UIBadge variant="secondary">Hidden</UIBadge>
                )}
                {badge.is_animated && (
                  <UIBadge variant="secondary">Animated</UIBadge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface BadgeFormProps {
  badge?: Badge;
  onSuccess: () => void;
  onCancel: () => void;
}

const BadgeForm: React.FC<BadgeFormProps> = ({ badge, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: badge?.name || '',
    description: badge?.description || '',
    icon_url: badge?.icon_url || '',
    color: badge?.color || '#3B82F6',
    rarity: badge?.rarity || 'common',
    category: badge?.category || 'general',
    is_hidden: badge?.is_hidden || false,
    is_premium: badge?.is_premium || false,
    is_animated: badge?.is_animated || false,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (badge) {
        // Update existing badge
        const { error } = await supabase
          .from('badges')
          .update(formData)
          .eq('id', badge.id);

        if (error) throw error;

        toast({
          title: 'Badge updated',
          description: 'Badge has been successfully updated.',
        });
      } else {
        // Create new badge
        const { error } = await supabase
          .from('badges')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: 'Badge created',
          description: 'Badge has been successfully created.',
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving badge:', error);
      toast({
        title: 'Error',
        description: 'Failed to save badge.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon_url">Icon URL</Label>
        <Input
          id="icon_url"
          value={formData.icon_url}
          onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
          placeholder="https://example.com/icon.svg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rarity">Rarity</Label>
          <Select value={formData.rarity} onValueChange={(value) => setFormData({ ...formData, rarity: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="common">Common</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
              <SelectItem value="epic">Epic</SelectItem>
              <SelectItem value="legendary">Legendary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="achievement">Achievement</SelectItem>
            <SelectItem value="milestone">Milestone</SelectItem>
            <SelectItem value="special">Special</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_hidden"
            checked={formData.is_hidden}
            onCheckedChange={(checked) => setFormData({ ...formData, is_hidden: checked })}
          />
          <Label htmlFor="is_hidden">Hidden Badge</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_premium"
            checked={formData.is_premium}
            onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
          />
          <Label htmlFor="is_premium">Premium Badge</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_animated"
            checked={formData.is_animated}
            onCheckedChange={(checked) => setFormData({ ...formData, is_animated: checked })}
          />
          <Label htmlFor="is_animated">Animated Badge</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : badge ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

interface GrantBadgeFormProps {
  badges: Badge[];
  users: User[];
  onGrant: (badgeId: string, userId: string, notes?: string) => void;
  onCancel: () => void;
}

const GrantBadgeForm: React.FC<GrantBadgeFormProps> = ({ badges, users, onGrant, onCancel }) => {
  const [selectedBadge, setSelectedBadge] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBadge && selectedUser) {
      onGrant(selectedBadge, selectedUser, notes);
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="badge">Badge</Label>
        <Select value={selectedBadge} onValueChange={setSelectedBadge}>
          <SelectTrigger>
            <SelectValue placeholder="Select a badge" />
          </SelectTrigger>
          <SelectContent>
            {badges.map((badge) => (
              <SelectItem key={badge.id} value={badge.id}>
                {badge.name} ({badge.rarity})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="user">User</Label>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger>
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.username || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Reason for granting this badge..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!selectedBadge || !selectedUser}>
          Grant Badge
        </Button>
      </div>
    </form>
  );
};