import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Search, Shield, Eye, Mail, Users, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface UserPrivacyData {
  user_id: string;
  email: string;
  analytics_opt_out: boolean;
  marketing_opt_out: boolean;
  created_at: string;
  updated_at: string;
}

export const UserPrivacyManager = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserPrivacyData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserPrivacyData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    analyticsOptOut: 0,
    marketingOptOut: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPrivacyData();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const loadPrivacyData = async () => {
    try {
      setLoading(true);

      // Get privacy preferences with user profile data
      const { data, error } = await supabase
        .from('user_privacy_preferences')
        .select(`
          user_id,
          analytics_opt_out,
          marketing_opt_out,
          created_at,
          updated_at,
          profiles!inner(email)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform data to include email
      const usersWithEmail = data?.map(item => ({
        user_id: item.user_id,
        email: (item.profiles as any)?.email || 'N/A',
        analytics_opt_out: item.analytics_opt_out,
        marketing_opt_out: item.marketing_opt_out,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];

      setUsers(usersWithEmail);

      // Calculate stats
      const total = usersWithEmail.length;
      const analyticsOptOut = usersWithEmail.filter(u => u.analytics_opt_out).length;
      const marketingOptOut = usersWithEmail.filter(u => u.marketing_opt_out).length;

      setStats({
        total,
        analyticsOptOut,
        marketingOptOut
      });

    } catch (error) {
      console.error('Error loading privacy data:', error);
      toast({
        title: "Error",
        description: "Failed to load user privacy data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportPrivacyData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      statistics: stats,
      users: filteredUsers.map(user => ({
        email: user.email,
        analytics_opt_out: user.analytics_opt_out,
        marketing_opt_out: user.marketing_opt_out,
        preferences_updated: user.updated_at
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-preferences-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Privacy data has been exported successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">User Privacy Manager</h2>
          <p className="text-muted-foreground">Monitor and manage user privacy preferences</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={exportPrivacyData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={loadPrivacyData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users with Preferences</p>
              <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Analytics Opt-out</p>
              <p className="text-2xl font-bold">{stats.analyticsOptOut}</p>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.analyticsOptOut / stats.total) * 100) : 0}% of users
              </p>
            </div>
            <Eye className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Marketing Opt-out</p>
              <p className="text-2xl font-bold">{stats.marketingOptOut}</p>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.marketingOptOut / stats.total) * 100) : 0}% of users
              </p>
            </div>
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {filteredUsers.length} of {users.length} users
            </Badge>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Privacy Preferences
          </h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Analytics Tracking</TableHead>
                <TableHead>Marketing Emails</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Preference Set</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={!user.analytics_opt_out} 
                          disabled 
                          className="pointer-events-none"
                        />
                        <span className="text-sm">
                          {user.analytics_opt_out ? 'Opted Out' : 'Enabled'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={!user.marketing_opt_out} 
                          disabled 
                          className="pointer-events-none"
                        />
                        <span className="text-sm">
                          {user.marketing_opt_out ? 'Opted Out' : 'Enabled'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.updated_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No users found matching your search.' : 'No privacy preferences found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};