import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAbuseDetection } from '@/hooks/useAbuseDetection';
import { AdminOnly } from '@/components/auth/RoleGuard';
import { 
  AlertTriangle, Shield, Users, Ban, CheckCircle, XCircle, 
  Eye, Flag, Clock, Activity, RefreshCw 
} from 'lucide-react';

const AbuseDetectionPanel = () => {
  const { 
    abuseFlags, 
    userActivity, 
    activeFlags, 
    criticalFlags,
    resolveFlag, 
    dismissFlag, 
    suspendUser, 
    banUser, 
    activateUser,
    flagUser 
  } = useAbuseDetection();
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const handleResolveFlag = async (flagId: string, isResolved: boolean) => {
    setIsResolving(true);
    try {
      if (isResolved) {
        await resolveFlag(flagId, resolution);
      } else {
        await dismissFlag(flagId, resolution);
      }
      setSelectedFlag(null);
      setResolution('');
    } catch (error) {
      console.error('Failed to resolve flag:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500/20 text-red-600';
      case 'investigating': return 'bg-yellow-500/20 text-yellow-600';
      case 'resolved': return 'bg-green-500/20 text-green-600';
      case 'dismissed': return 'bg-gray-500/20 text-gray-600';
      default: return 'bg-gray-500/20 text-gray-600';
    }
  };

  const getAccountStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-600';
      case 'suspended': return 'bg-yellow-500/20 text-yellow-600';
      case 'banned': return 'bg-red-500/20 text-red-600';
      default: return 'bg-gray-500/20 text-gray-600';
    }
  };

  return (
    <AdminOnly>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-500" />
              Abuse Detection & Security
            </h1>
            <p className="text-muted-foreground">
              Monitor suspicious activity and manage security flags
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Flags</p>
                  <p className="text-2xl font-bold">{activeFlags.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{criticalFlags.length}</p>
                </div>
                <Flag className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suspended Users</p>
                  <p className="text-2xl font-bold">
                    {userActivity.filter(u => u.account_status === 'suspended').length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Banned Users</p>
                  <p className="text-2xl font-bold">
                    {userActivity.filter(u => u.account_status === 'banned').length}
                  </p>
                </div>
                <Ban className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="flags" className="space-y-6">
          <TabsList>
            <TabsTrigger value="flags">Security Flags</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="patterns">Suspicious Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="flags" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Security Flags</CardTitle>
                <CardDescription>
                  Review and manage security alerts that require attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {abuseFlags.map((flag) => (
                    <div key={flag.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getSeverityColor(flag.severity)}>
                              {flag.severity.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(flag.status)}>
                              {flag.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {flag.flag_type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <h3 className="font-semibold">{flag.description}</h3>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {flag.user_id && <p>User ID: {flag.user_id}</p>}
                            {flag.ip_address && <p>IP Address: {flag.ip_address}</p>}
                            <p>Created: {new Date(flag.created_at).toLocaleString()}</p>
                            {flag.metadata && (
                              <p>Details: {JSON.stringify(flag.metadata)}</p>
                            )}
                          </div>
                        </div>
                        
                        {flag.status === 'active' && (
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Review Security Flag</DialogTitle>
                                  <DialogDescription>
                                    Investigate and resolve this security alert
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="bg-muted/50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Flag Details</h4>
                                    <div className="text-sm space-y-1">
                                      <p><strong>Type:</strong> {flag.flag_type}</p>
                                      <p><strong>Severity:</strong> {flag.severity}</p>
                                      <p><strong>Description:</strong> {flag.description}</p>
                                      {flag.metadata && (
                                        <p><strong>Metadata:</strong> {JSON.stringify(flag.metadata, null, 2)}</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Resolution Notes</label>
                                    <Textarea
                                      placeholder="Add notes about your investigation and resolution..."
                                      value={resolution}
                                      onChange={(e) => setResolution(e.target.value)}
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <Button 
                                      className="flex-1"
                                      onClick={() => handleResolveFlag(flag.id, true)}
                                      disabled={isResolving}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Resolved
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      className="flex-1"
                                      onClick={() => handleResolveFlag(flag.id, false)}
                                      disabled={isResolving}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Dismiss
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Account Management</CardTitle>
                <CardDescription>
                  Monitor user activity and manage account statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivity.map((user) => (
                    <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.email}</h3>
                          <Badge className={getAccountStatusColor(user.account_status)}>
                            {user.account_status}
                          </Badge>
                          {user.suspicious_flags > 0 && (
                            <Badge variant="destructive">
                              {user.suspicious_flags} flags
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            {user.total_reads} reads • {user.total_downloads} downloads • 
                            {user.coins_spent} coins spent • {user.subscription_status}
                          </p>
                          <p>Last activity: {new Date(user.last_activity).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {user.account_status === 'active' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => suspendUser(user.user_id, 'Manual admin action')}
                            >
                              Suspend
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => banUser(user.user_id, 'Manual admin action')}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Ban
                            </Button>
                          </>
                        )}
                        {(user.account_status === 'suspended' || user.account_status === 'banned') && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => activateUser(user.user_id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Suspicious Activity Patterns</CardTitle>
                <CardDescription>
                  Automated detection of potentially harmful behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
                      <h4 className="font-semibold text-yellow-600 mb-2">High Download Activity</h4>
                      <p className="text-sm text-yellow-600">
                        3 users exceeded download limits in the last hour
                      </p>
                    </div>
                    <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30">
                      <h4 className="font-semibold text-red-600 mb-2">Suspicious Coin Activity</h4>
                      <p className="text-sm text-red-600">
                        1 user with unusual coin balance changes detected
                      </p>
                    </div>
                    <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                      <h4 className="font-semibold text-blue-600 mb-2">Multiple Account Detection</h4>
                      <p className="text-sm text-blue-600">
                        2 IP addresses created multiple accounts recently
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminOnly>
  );
};

export default AbuseDetectionPanel;