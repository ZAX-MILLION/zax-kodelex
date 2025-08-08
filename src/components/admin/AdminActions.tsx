import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  RefreshCw, 
  FileText,
  Trash2,
  Edit,
  Upload,
  Shield,
  Eye,
  Ban,
  Settings,
  UserCheck
} from "lucide-react";
import { format } from "date-fns";

interface AdminAction {
  id: string;
  action_type: string;
  admin_user_id: string;
  description: string;
  target_type: string | null;
  target_id: string | null;
  metadata: any;
  created_at: string;
  admin_email?: string;
}

const actionIcons: Record<string, any> = {
  'chapter_upload': Upload,
  'chapter_edit': Edit,
  'chapter_delete': Trash2,
  'seo_update': FileText,
  'user_ban': Ban,
  'user_unban': UserCheck,
  'user_delete': Trash2,
  'role_change': Shield,
  'settings_update': Settings,
  'content_moderate': Eye,
  'default': FileText
};

const actionColors: Record<string, string> = {
  'chapter_upload': 'bg-green-500',
  'chapter_edit': 'bg-blue-500',
  'chapter_delete': 'bg-red-500',
  'seo_update': 'bg-purple-500',
  'user_ban': 'bg-red-600',
  'user_unban': 'bg-green-600',
  'user_delete': 'bg-red-700',
  'role_change': 'bg-orange-500',
  'settings_update': 'bg-gray-500',
  'content_moderate': 'bg-yellow-500',
  'default': 'bg-gray-400'
};

export const AdminActions = () => {
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminActions();
  }, []);

  const fetchAdminActions = async () => {
    try {
      setLoading(true);
      
      // Fetch admin actions with admin profile information  
      const { data, error } = await supabase
        .from('admin_actions')
        .select(`
          *
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      // Get admin emails separately
      const adminIds = [...new Set(data.map(action => action.admin_user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', adminIds);

      // Process the data to include admin email
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);
      const processedActions = data.map(action => ({
        ...action,
        admin_email: profileMap.get(action.admin_user_id) || 'Unknown Admin'
      }));

      setActions(processedActions);
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

  const getFilteredActions = () => {
    let filtered = actions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(action => 
        action.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.admin_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.action_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Action type filter
    if (actionTypeFilter !== "all") {
      filtered = filtered.filter(action => action.action_type === actionTypeFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (dateFilter) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(action => 
        new Date(action.created_at) >= cutoffDate
      );
    }

    return filtered;
  };

  const getActionIcon = (actionType: string) => {
    const IconComponent = actionIcons[actionType] || actionIcons.default;
    return IconComponent;
  };

  const getActionColor = (actionType: string) => {
    return actionColors[actionType] || actionColors.default;
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getUniqueActionTypes = () => {
    const types = new Set(actions.map(action => action.action_type));
    return Array.from(types);
  };

  const getActionStats = () => {
    const filtered = getFilteredActions();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayActions = filtered.filter(action => 
      new Date(action.created_at) >= today
    ).length;

    const uniqueAdmins = new Set(filtered.map(action => action.admin_user_id)).size;
    
    const mostCommonAction = filtered.reduce((acc, action) => {
      acc[action.action_type] = (acc[action.action_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topAction = Object.entries(mostCommonAction)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      total: filtered.length,
      today: todayActions,
      admins: uniqueAdmins,
      topAction: topAction ? formatActionType(topAction[0]) : 'N/A'
    };
  };

  const filteredActions = getFilteredActions();
  const stats = getActionStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{stats.topAction}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Audit Log</CardTitle>
          <CardDescription>
            Track all administrative actions performed by admin users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actions, admins, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {getUniqueActionTypes().map(type => (
                  <SelectItem key={type} value={type}>
                    {formatActionType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchAdminActions} variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No admin actions found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActions.map((action) => {
                    const ActionIcon = getActionIcon(action.action_type);
                    const actionColor = getActionColor(action.action_type);
                    
                    return (
                      <TableRow key={action.id}>
                        <TableCell>
                          <Badge variant="secondary" className={`${actionColor} text-white`}>
                            <ActionIcon className="h-3 w-3 mr-1" />
                            {formatActionType(action.action_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">
                            {action.admin_email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={action.description}>
                            {action.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          {action.target_type && action.target_id ? (
                            <div className="text-sm">
                              <div className="font-medium">{action.target_type}</div>
                              <div className="text-muted-foreground text-xs">
                                {action.target_id.slice(0, 8)}...
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(new Date(action.created_at), 'MMM dd, yyyy')}</div>
                            <div className="text-muted-foreground text-xs">
                              {format(new Date(action.created_at), 'HH:mm:ss')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {action.metadata && Object.keys(action.metadata).length > 0 ? (
                            <div className="text-xs text-muted-foreground">
                              {Object.entries(action.metadata).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium">{key}:</span> {String(value)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};