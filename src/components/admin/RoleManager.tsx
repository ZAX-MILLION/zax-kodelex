import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Shield, 
  Crown, 
  Edit, 
  Search, 
  UserPlus,
  AlertCircle,
  Ban,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  username: string | null;
  role: 'admin' | 'editor' | 'author' | 'member' | 'user' | 'uploader' | 'seo_manager';
  is_banned: boolean;
  activity_score: number;
  login_count: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

interface RolePermissions {
  [key: string]: {
    name: string;
    description: string;
    permissions: string[];
    badge_color: string;
  };
}

const ROLE_DEFINITIONS: RolePermissions = {
  admin: {
    name: 'Administrator',
    description: 'Full system access and management',
    permissions: [
      'Manage all content',
      'User management',
      'System settings',
      'Revenue access',
      'Moderation tools'
    ],
    badge_color: 'bg-red-500'
  },
  editor: {
    name: 'Editor',
    description: 'Content management and moderation',
    permissions: [
      'Content moderation',
      'Comment management',
      'Series approval',
      'User content review'
    ],
    badge_color: 'bg-purple-500'
  },
  author: {
    name: 'Author',
    description: 'Content creation and series management',
    permissions: [
      'Upload series',
      'Manage own content',
      'Chapter publishing',
      'Author dashboard'
    ],
    badge_color: 'bg-blue-500'
  },
  member: {
    name: 'Premium Member',
    description: 'Premium content access',
    permissions: [
      'Premium content access',
      'Ad-free experience',
      'Early chapter access',
      'Priority support'
    ],
    badge_color: 'bg-yellow-500'
  },
  user: {
    name: 'Regular User',
    description: 'Basic platform access',
    permissions: [
      'Read free content',
      'Comment on chapters',
      'Basic profile',
      'Bookmarking'
    ],
    badge_color: 'bg-gray-500'
  }
};

export const RoleManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdateLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole as 'admin' | 'editor' | 'author' | 'member' | 'user',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_actions').insert({
        action_type: 'role_change',
        target_type: 'user',
        target_id: userId,
        description: `Changed user role to ${newRole}`,
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        metadata: { new_role: newRole, previous_role: selectedUser?.role }
      });

      toast({
        title: "Success",
        description: `User role updated to ${ROLE_DEFINITIONS[newRole]?.name || newRole}`
      });

      setEditDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const toggleUserBan = async (userId: string, currentBanStatus: boolean) => {
    setUpdateLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_banned: !currentBanStatus,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_actions').insert({
        action_type: currentBanStatus ? 'unban_user' : 'ban_user',
        target_type: 'user',
        target_id: userId,
        description: `${currentBanStatus ? 'Unbanned' : 'Banned'} user`,
        admin_user_id: (await supabase.auth.getUser()).data.user?.id
      });

      toast({
        title: "Success",
        description: `User ${currentBanStatus ? 'unbanned' : 'banned'} successfully`
      });

      loadUsers();
    } catch (error: any) {
      console.error('Error updating ban status:', error);
      toast({
        title: "Error",
        description: "Failed to update ban status",
        variant: "destructive"
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const getRoleBadge = (role: string, isBanned: boolean = false) => {
    const roleInfo = ROLE_DEFINITIONS[role];
    if (isBanned) {
      return <Badge variant="destructive"><Ban className="h-3 w-3 mr-1" />Banned</Badge>;
    }
    if (!roleInfo) {
      return <Badge variant="outline">{role}</Badge>;
    }
    return (
      <Badge variant="outline" className="text-white" style={{ backgroundColor: roleInfo.badge_color.replace('bg-', '') }}>
        {role === 'admin' && <Crown className="h-3 w-3 mr-1" />}
        {role === 'editor' && <Shield className="h-3 w-3 mr-1" />}
        {role === 'author' && <Edit className="h-3 w-3 mr-1" />}
        {role === 'member' && <CheckCircle className="h-3 w-3 mr-1" />}
        {role === 'user' && <Users className="h-3 w-3 mr-1" />}
        {roleInfo.name}
      </Badge>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(ROLE_DEFINITIONS).map(([role, info]) => (
          <Card key={role}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${info.badge_color}`}></div>
                <div>
                  <p className="text-sm font-medium">{info.name}</p>
                  <p className="text-2xl font-bold">{roleStats[role] || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Definitions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understanding user roles and their capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ROLE_DEFINITIONS).map(([role, info]) => (
              <Card key={role} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  {getRoleBadge(role)}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{info.description}</p>
                <div className="space-y-1">
                  {info.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{permission}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user roles and permissions
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by email or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="role-filter">Filter by Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.entries(ROLE_DEFINITIONS).map(([role, info]) => (
                    <SelectItem key={role} value={role}>{info.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No users found {searchQuery && `matching "${searchQuery}"`}
                </AlertDescription>
              </Alert>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h4 className="font-semibold">{user.email}</h4>
                          {user.username && (
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          )}
                        </div>
                        {getRoleBadge(user.role, user.is_banned)}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                        <p>Activity Score: {user.activity_score} | Logins: {user.login_count}</p>
                        {user.last_login_at && (
                          <p>Last Login: {new Date(user.last_login_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog open={editDialogOpen && selectedUser?.id === user.id} onOpenChange={setEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit Role
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User Role</DialogTitle>
                            <DialogDescription>
                              Change the role for {user.email}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Current Role</Label>
                              <div>{getRoleBadge(user.role)}</div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="new-role">New Role</Label>
                              <Select defaultValue={user.role} onValueChange={(value) => {
                                if (confirm(`Are you sure you want to change ${user.email}'s role to ${ROLE_DEFINITIONS[value]?.name}?`)) {
                                  updateUserRole(user.user_id, value);
                                }
                              }}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(ROLE_DEFINITIONS).map(([role, info]) => (
                                    <SelectItem key={role} value={role}>
                                      {info.name} - {info.description}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        size="sm"
                        variant={user.is_banned ? "default" : "destructive"}
                        onClick={() => {
                          const action = user.is_banned ? 'unban' : 'ban';
                          if (confirm(`Are you sure you want to ${action} ${user.email}?`)) {
                            toggleUserBan(user.user_id, user.is_banned);
                          }
                        }}
                        disabled={updateLoading}
                      >
                        {user.is_banned ? (
                          <><CheckCircle className="h-4 w-4 mr-1" />Unban</>
                        ) : (
                          <><Ban className="h-4 w-4 mr-1" />Ban</>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};