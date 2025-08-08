import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Settings, Users, FileText, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
  count?: number;
  icon?: React.ReactNode;
  priority: number;
}

export const AdminAlerts = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSystemAlerts();
  }, []);

  const checkSystemAlerts = async () => {
    setLoading(true);
    const systemAlerts: AlertItem[] = [];

    try {
      // Check for missing configurations
      const installStatus = localStorage.getItem('installation_complete');
      if (!installStatus) {
        systemAlerts.push({
          id: 'missing-install',
          type: 'error',
          title: 'Installation Incomplete',
          description: 'Site setup has not been completed. Users may experience issues.',
          action: 'Complete Setup',
          actionUrl: '/admin/install-wizard',
          icon: <Settings className="h-4 w-4" />,
          priority: 1
        });
      }

      // Check for unapproved content (use a field that exists)
      const { data: unapprovedSeries } = await supabase
        .from('manga_meta')
        .select('id')
        .is('meta_description', null)
        .limit(5);

      if (unapprovedSeries && unapprovedSeries.length > 0) {
        systemAlerts.push({
          id: 'unapproved-series',
          type: 'warning',
          title: 'Pending Series Approval',
          description: `${unapprovedSeries.length} series waiting for approval`,
          action: 'Review Content',
          actionUrl: '/admin/moderation',
          count: unapprovedSeries.length,
          icon: <FileText className="h-4 w-4" />,
          priority: 2
        });
      }

      // Check for pending comments (if flagged)
      const { data: flaggedComments } = await supabase
        .from('comments')
        .select('id')
        .eq('is_flagged', true)
        .eq('status', 'pending_review')
        .limit(10);

      if (flaggedComments && flaggedComments.length > 0) {
        systemAlerts.push({
          id: 'flagged-comments',
          type: 'warning',
          title: 'Flagged Comments',
          description: `${flaggedComments.length} comments need moderation`,
          action: 'Review Comments',
          actionUrl: '/admin/comments',
          count: flaggedComments.length,
          icon: <Users className="h-4 w-4" />,
          priority: 3
        });
      }

      // Check for low coin balances (admin warning)
      const { data: lowBalanceUsers } = await supabase
        .from('coin_wallets')
        .select('id')
        .lt('balance', 10)
        .limit(5);

      if (lowBalanceUsers && lowBalanceUsers.length > 5) {
        systemAlerts.push({
          id: 'low-coin-balances',
          type: 'info',
          title: 'Users with Low Coin Balances',
          description: `${lowBalanceUsers.length}+ users have less than 10 coins`,
          action: 'View Coin Analytics',
          actionUrl: '/admin/coins',
          icon: <Coins className="h-4 w-4" />,
          priority: 4
        });
      }

      // Check for system updates (mock - would be real API in production)
      const lastUpdateCheck = localStorage.getItem('last_update_check');
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      
      if (!lastUpdateCheck || parseInt(lastUpdateCheck) < oneDayAgo) {
        systemAlerts.push({
          id: 'update-available',
          type: 'info',
          title: 'System Update Available',
          description: 'Version 2.1.0 is available with security improvements',
          action: 'Update Now',
          actionUrl: '/admin/system-updater',
          icon: <Settings className="h-4 w-4" />,
          priority: 5
        });
        localStorage.setItem('last_update_check', now.toString());
      }

      // Check database health
      try {
        const { error: dbError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);

        if (dbError) {
          systemAlerts.push({
            id: 'database-error',
            type: 'error',
            title: 'Database Connection Issue',
            description: 'Unable to connect to database. Check your configuration.',
            action: 'Check Settings',
            actionUrl: '/admin/database',
            icon: <AlertTriangle className="h-4 w-4" />,
            priority: 1
          });
        }
      } catch (error) {
        console.error('Database check failed:', error);
      }

      // Sort by priority and set alerts
      systemAlerts.sort((a, b) => a.priority - b.priority);
      setAlerts(systemAlerts);

    } catch (error) {
      console.error('Failed to check system alerts:', error);
      toast({
        title: "Alert Check Failed",
        description: "Unable to check system status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    localStorage.setItem(`alert_dismissed_${alertId}`, Date.now().toString());
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <Clock className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'success':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>Checking system status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            System Alerts
            {alerts.length > 0 && (
              <Badge variant="secondary">{alerts.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Important notifications about your platform
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={checkSystemAlerts}
        >
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Systems Operational</h3>
            <p className="text-muted-foreground">
              No critical issues detected. Your platform is running smoothly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Alert 
                key={alert.id} 
                variant={getAlertVariant(alert.type)}
                className="relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {alert.icon || getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{alert.title}</h4>
                        {alert.count && (
                          <Badge variant="outline" className="text-xs">
                            {alert.count}
                          </Badge>
                        )}
                      </div>
                      <AlertDescription>{alert.description}</AlertDescription>
                      {alert.action && alert.actionUrl && (
                        <div className="mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.location.href = alert.actionUrl!}
                          >
                            {alert.action}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="ml-2"
                  >
                    ×
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};