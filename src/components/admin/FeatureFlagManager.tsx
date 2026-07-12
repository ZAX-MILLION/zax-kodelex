import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFeatureFlags } from '@/hooks/useFeatureFlag';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Settings, Trash2, Users, Eye, EyeOff, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface CreateFlagForm {
  flag_key: string;
  display_name: string;
  description: string;
  visibility: 'public' | 'admin-only';
  allowed_roles: string[];
}

interface EditFlagForm extends CreateFlagForm {
  id: string;
  is_enabled: boolean;
}

export const FeatureFlagManager = () => {
  const { toast } = useToast();
  const { flags, userFlags, isLoading, toggleFlag, createFlag, updateFlag, deleteFlag, setUserFlag, removeUserFlag } = useFeatureFlags();
  
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'admin-only'>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<EditFlagForm | null>(null);
  const [userFlagDialogOpen, setUserFlagDialogOpen] = useState(false);
  const [selectedFlagKey, setSelectedFlagKey] = useState('');

  const [createForm, setCreateForm] = useState<CreateFlagForm>({
    flag_key: '',
    display_name: '',
    description: '',
    visibility: 'admin-only',
    allowed_roles: []
  });

  const [userFlagForm, setUserFlagForm] = useState({
    userId: '',
    enabled: false,
    reason: '',
    expiresAt: ''
  });

  const availableRoles = ['admin', 'editor', 'author', 'member', 'user'];

  const filteredFlags = flags.filter(flag => {
    const matchesText = flag.display_name.toLowerCase().includes(filter.toLowerCase()) ||
                       flag.flag_key.toLowerCase().includes(filter.toLowerCase()) ||
                       flag.description?.toLowerCase().includes(filter.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'enabled' && flag.is_enabled) ||
                         (statusFilter === 'disabled' && !flag.is_enabled);
    
    const matchesVisibility = visibilityFilter === 'all' || flag.visibility === visibilityFilter;
    
    return matchesText && matchesStatus && matchesVisibility;
  });

  const handleToggleFlag = async (flagId: string, enabled: boolean) => {
    try {
      await toggleFlag(flagId, enabled);
      toast({
        title: "Success",
        description: `Feature flag ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle feature flag",
        variant: "destructive",
      });
    }
  };

  const handleCreateFlag = async () => {
    try {
      await createFlag(createForm);
      setCreateDialogOpen(false);
      setCreateForm({
        flag_key: '',
        display_name: '',
        description: '',
        visibility: 'admin-only',
        allowed_roles: []
      });
      toast({
        title: "Success",
        description: "Feature flag created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create feature flag",
        variant: "destructive",
      });
    }
  };

  const handleUpdateFlag = async () => {
    if (!editingFlag) return;
    
    try {
      await updateFlag(editingFlag.id, {
        display_name: editingFlag.display_name,
        description: editingFlag.description,
        visibility: editingFlag.visibility,
        allowed_roles: editingFlag.allowed_roles
      });
      setEditingFlag(null);
      toast({
        title: "Success",
        description: "Feature flag updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update feature flag",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFlag = async (flagId: string) => {
    try {
      await deleteFlag(flagId);
      toast({
        title: "Success",
        description: "Feature flag deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete feature flag",
        variant: "destructive",
      });
    }
  };

  const handleSetUserFlag = async () => {
    try {
      await setUserFlag(
        userFlagForm.userId,
        selectedFlagKey,
        userFlagForm.enabled,
        userFlagForm.reason,
        userFlagForm.expiresAt || undefined
      );
      setUserFlagDialogOpen(false);
      setUserFlagForm({ userId: '', enabled: false, reason: '', expiresAt: '' });
      toast({
        title: "Success",
        description: "User flag override set successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set user flag override",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading feature flags...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground">Manage feature flags and role-based access control</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Flag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
              <DialogDescription>
                Create a new feature flag to control access to features
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="flag_key">Flag Key</Label>
                  <Input
                    id="flag_key"
                    value={createForm.flag_key}
                    onChange={(e) => setCreateForm({ ...createForm, flag_key: e.target.value })}
                    placeholder="e.g., premium_features"
                  />
                </div>
                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={createForm.display_name}
                    onChange={(e) => setCreateForm({ ...createForm, display_name: e.target.value })}
                    placeholder="e.g., Premium Features"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Describe what this feature flag controls"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select value={createForm.visibility} onValueChange={(value: 'public' | 'admin-only') => setCreateForm({ ...createForm, visibility: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="admin-only">Admin Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Allowed Roles</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableRoles.map(role => (
                      <Button
                        key={role}
                        type="button"
                        variant={createForm.allowed_roles.includes(role) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newRoles = createForm.allowed_roles.includes(role)
                            ? createForm.allowed_roles.filter(r => r !== role)
                            : [...createForm.allowed_roles, role];
                          setCreateForm({ ...createForm, allowed_roles: newRoles });
                        }}
                      >
                        {role}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleCreateFlag}>Create Flag</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search flags..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={(value: 'all' | 'enabled' | 'disabled') => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={visibilityFilter} onValueChange={(value: 'all' | 'public' | 'admin-only') => setVisibilityFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visibility</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="admin-only">Admin Only</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground flex items-center">
              {filteredFlags.length} of {flags.length} flags
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags List */}
      <div className="grid gap-4">
        {filteredFlags.map((flag) => (
          <Card key={flag.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-lg">{flag.display_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{flag.flag_key}</code>
                      <Badge variant={flag.visibility === 'public' ? 'default' : 'secondary'}>
                        {flag.visibility === 'public' ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                        {flag.visibility}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={flag.is_enabled}
                    onCheckedChange={(enabled) => handleToggleFlag(flag.id, enabled)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFlagKey(flag.flag_key);
                      setUserFlagDialogOpen(true);
                    }}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingFlag({
                      id: flag.id,
                      flag_key: flag.flag_key,
                      display_name: flag.display_name,
                      description: flag.description || '',
                      visibility: flag.visibility,
                      allowed_roles: flag.allowed_roles,
                      is_enabled: flag.is_enabled
                    })}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Feature Flag</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{flag.display_name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteFlag(flag.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{flag.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {flag.allowed_roles.map(role => (
                  <Badge key={role} variant="outline">{role}</Badge>
                ))}
                {flag.allowed_roles.length === 0 && (
                  <Badge variant="outline">No role restrictions</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Usage: {flag.usage_count}</span>
                {flag.last_toggled_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last toggled: {format(new Date(flag.last_toggled_at), 'PPp')}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Flag Dialog */}
      <Dialog open={!!editingFlag} onOpenChange={() => setEditingFlag(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Feature Flag</DialogTitle>
            <DialogDescription>
              Update the feature flag configuration
            </DialogDescription>
          </DialogHeader>
          
          {editingFlag && (
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="edit_display_name">Display Name</Label>
                <Input
                  id="edit_display_name"
                  value={editingFlag.display_name}
                  onChange={(e) => setEditingFlag({ ...editingFlag, display_name: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={editingFlag.description}
                  onChange={(e) => setEditingFlag({ ...editingFlag, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_visibility">Visibility</Label>
                  <Select value={editingFlag.visibility} onValueChange={(value: 'public' | 'admin-only') => setEditingFlag({ ...editingFlag, visibility: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="admin-only">Admin Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Allowed Roles</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableRoles.map(role => (
                      <Button
                        key={role}
                        type="button"
                        variant={editingFlag.allowed_roles.includes(role) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newRoles = editingFlag.allowed_roles.includes(role)
                            ? editingFlag.allowed_roles.filter(r => r !== role)
                            : [...editingFlag.allowed_roles, role];
                          setEditingFlag({ ...editingFlag, allowed_roles: newRoles });
                        }}
                      >
                        {role}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={handleUpdateFlag}>Update Flag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Flag Override Dialog */}
      <Dialog open={userFlagDialogOpen} onOpenChange={setUserFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set User Flag Override</DialogTitle>
            <DialogDescription>
              Override the flag setting for a specific user
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="user_id">User ID</Label>
              <Input
                id="user_id"
                value={userFlagForm.userId}
                onChange={(e) => setUserFlagForm({ ...userFlagForm, userId: e.target.value })}
                placeholder="Enter user UUID"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="user_enabled"
                checked={userFlagForm.enabled}
                onCheckedChange={(enabled) => setUserFlagForm({ ...userFlagForm, enabled })}
              />
              <Label htmlFor="user_enabled">Enable for this user</Label>
            </div>
            
            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                value={userFlagForm.reason}
                onChange={(e) => setUserFlagForm({ ...userFlagForm, reason: e.target.value })}
                placeholder="Reason for override"
              />
            </div>
            
            <div>
              <Label htmlFor="expires_at">Expires At (optional)</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={userFlagForm.expiresAt}
                onChange={(e) => setUserFlagForm({ ...userFlagForm, expiresAt: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleSetUserFlag}>Set Override</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Flag Overrides */}
      {userFlags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>User Flag Overrides</CardTitle>
            <CardDescription>Individual user flag overrides currently active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userFlags.map((userFlag) => (
                <div key={userFlag.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{userFlag.flag_key}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      User: {userFlag.user_id}
                    </span>
                    {userFlag.reason && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        Reason: {userFlag.reason}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={userFlag.is_enabled ? 'default' : 'secondary'}>
                      {userFlag.is_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    {userFlag.expires_at && (
                      <span className="text-xs text-muted-foreground">
                        Expires: {format(new Date(userFlag.expires_at), 'PPp')}
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeUserFlag(userFlag.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};