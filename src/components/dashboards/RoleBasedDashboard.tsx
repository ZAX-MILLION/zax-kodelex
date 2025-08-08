import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Users, 
  BarChart, 
  Settings, 
  Search, 
  Edit, 
  TrendingUp, 
  BookOpen,
  LayoutDashboard,
  History,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface DashboardConfig {
  theme: string;
  layout: string;
}

interface MenuItem {
  title: string;
  path: string;
  icon: string;
}

interface Permissions {
  [key: string]: boolean;
}

interface RoleDashboardData {
  role_name: string;
  dashboard_config: any;
  menu_items: any[];
  permissions: any;
}

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  BarChart: <BarChart className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
  Upload: <Upload className="h-5 w-5" />,
  History: <History className="h-5 w-5" />,
  Search: <Search className="h-5 w-5" />,
  Edit: <Edit className="h-5 w-5" />,
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  User: <User className="h-5 w-5" />
};

export const RoleBasedDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<RoleDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardConfig = async () => {
      if (!userProfile?.role) return;

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('role_dashboards')
          .select('*')
          .eq('role_name', userProfile.role)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setDashboardData({
            ...data,
            dashboard_config: data.dashboard_config as any,
            menu_items: data.menu_items as any[],
            permissions: data.permissions as any
          });
        } else {
          // Fallback to default member dashboard if no specific config found
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('role_dashboards')
            .select('*')
            .eq('role_name', 'member')
            .maybeSingle();

          if (fallbackError) throw fallbackError;
          if (fallbackData) {
            setDashboardData({
              ...fallbackData,
              dashboard_config: fallbackData.dashboard_config as any,
              menu_items: fallbackData.menu_items as any[],
              permissions: fallbackData.permissions as any
            });
          }
        }
      } catch (error) {
        console.error('Error loading dashboard config:', error);
        toast({
          title: "Dashboard Error",
          description: "Failed to load dashboard configuration",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardConfig();
  }, [userProfile?.role, toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Dashboard Not Available</h2>
        <p className="text-muted-foreground">Unable to load dashboard configuration for your role.</p>
      </div>
    );
  }

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'admin':
        return 'from-red-500/10 to-red-600/10 border-red-200 dark:border-red-800';
      case 'uploader':
        return 'from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800';
      case 'seo':
        return 'from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800';
      case 'author':
        return 'from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800';
      default:
        return 'from-gray-500/10 to-gray-600/10 border-gray-200 dark:border-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'uploader': return 'Content Uploader';
      case 'seo_manager': return 'SEO Manager';
      case 'author': return 'Author';
      default: return 'Member';
    }
  };

  const themeClasses = getThemeClasses(dashboardData.dashboard_config.theme);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {getRoleDisplayName(dashboardData.role_name)} Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here are your available tools and quick actions.
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {getRoleDisplayName(dashboardData.role_name)}
        </Badge>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardData.menu_items.map((item, index) => (
          <Card 
            key={index} 
            className={`bg-gradient-to-br ${themeClasses} hover:shadow-lg transition-all duration-200 group cursor-pointer`}
          >
            <CardContent className="p-6">
              <Link to={item.path} className="block">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-background/80 group-hover:bg-background transition-colors">
                    {iconMap[item.icon] || <LayoutDashboard className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getMenuItemDescription(item.title)}
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permissions Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Permissions</CardTitle>
          <CardDescription>
            What you can do with your current role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(dashboardData.permissions).map(([permission, hasPermission]) => {
              if (!hasPermission) return null;
              
              return (
                <Badge 
                  key={permission} 
                  variant="secondary"
                  className="text-xs"
                >
                  {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const getMenuItemDescription = (title: string): string => {
  const descriptions: Record<string, string> = {
    'Overview': 'Dashboard overview and statistics',
    'Series Manager': 'Manage and organize series',
    'Chapter Manager': 'Upload and manage chapters',
    'User Management': 'Manage users and permissions',
    'Analytics': 'View detailed analytics',
    'Settings': 'Configure system settings',
    'My Uploads': 'View your uploaded content',
    'Chapter Upload': 'Upload new chapters',
    'Upload History': 'View upload history',
    'SEO Dashboard': 'SEO optimization tools',
    'Content Optimization': 'Optimize content for search',
    'Meta Management': 'Manage meta tags',
    'My Series': 'Manage your series',
    'Chapters': 'Your chapter management',
    'Profile': 'Manage your profile',
    'Reading List': 'Your reading list',
    'Preferences': 'Account preferences'
  };
  
  return descriptions[title] || 'Access this feature';
};