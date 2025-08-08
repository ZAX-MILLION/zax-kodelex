import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Flag, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  User,
  MessageSquare,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Report {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  description?: string | null;
  status: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  resolution_notes?: string | null;
  created_at: string;
  reporter_profile?: {
    username?: string | null;
    email: string;
  };
  target_content?: any;
}

export const ReportsManager = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed'>('pending');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related content for each report
      const reportsWithContent = await Promise.all((data || []).map(async (report) => {
        let targetContent = null;
        let reporterProfile = null;
        
        // Fetch reporter profile
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, email')
            .eq('user_id', report.reporter_id)
            .single();
          reporterProfile = profileData;
        } catch (error) {
          console.log('Could not fetch reporter profile:', error);
        }
        
        // Fetch target content
        try {
          if (report.target_type === 'comment') {
            const { data: commentData } = await supabase
              .from('comments')
              .select('content, user_id, created_at')
              .eq('id', report.target_id)
              .single();
            targetContent = commentData;
          } else if (report.target_type === 'chapter') {
            const { data: chapterData } = await supabase
              .from('chapters')
              .select('title, chapter_number')
              .eq('id', report.target_id)
              .single();
            targetContent = chapterData;
          }
        } catch (error) {
          console.log('Could not fetch target content:', error);
        }

        return {
          ...report,
          reporter_profile: reporterProfile,
          target_content: targetContent,
        } as Report;
      }));

      setReports(reportsWithContent);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'dismiss' | 'resolve', notes?: string) => {
    try {
      const newStatus = action === 'dismiss' ? 'dismissed' : 'resolved';
      
      const { error } = await supabase
        .from('reports')
        .update({
          status: newStatus,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          resolution_notes: notes || null,
        })
        .eq('id', reportId);

      if (error) throw error;

      // Log the moderation action
      await supabase
        .from('moderation_logs')
        .insert({
          moderator_id: user?.id,
          action_type: action === 'dismiss' ? 'dismiss_report' : 'remove_content',
          target_type: 'report',
          target_id: reportId,
          reason: notes || `Report ${action}ed`,
          details: { action, notes },
        });

      // If resolving, also notify the reporter
      const report = reports.find(r => r.id === reportId);
      if (report && action === 'resolve') {
        await supabase
          .from('user_notifications')
          .insert({
            user_id: report.reporter_id,
            type: 'content_moderated',
            title: 'Report Resolved',
            message: `Your report has been reviewed and resolved. Thank you for helping keep our community safe.`,
            related_type: 'report',
            related_id: reportId,
          });
      }

      toast({
        title: "Success",
        description: `Report ${action}ed successfully`,
      });

      fetchReports();
      setSelectedReport(null);
      setResolutionNotes('');
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} report`,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'reviewed': return 'default';
      case 'dismissed': return 'secondary';
      case 'resolved': return 'default';
      default: return 'secondary';
    }
  };

  const getReasonLabel = (reason: string) => {
    const reasonMap: { [key: string]: string } = {
      spam: 'Spam',
      harassment: 'Harassment',
      inappropriate_content: 'Inappropriate Content',
      copyright: 'Copyright Violation',
      misinformation: 'Misinformation',
      other: 'Other',
    };
    return reasonMap[reason] || reason;
  };

  const filteredReports = reports.filter(report => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return report.status === 'pending';
    if (filterStatus === 'reviewed') return ['dismissed', 'resolved'].includes(report.status);
    return true;
  });

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const reviewedCount = reports.filter(r => ['dismissed', 'resolved'].includes(r.status)).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports Management</h1>
          <p className="text-muted-foreground">Review and moderate reported content</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Flag className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{reviewedCount}</p>
                <p className="text-sm text-muted-foreground">Reviewed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed ({reviewedCount})</TabsTrigger>
          <TabsTrigger value="all">All Reports ({reports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={filterStatus} className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Flag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reports found</h3>
                <p className="text-muted-foreground">
                  {filterStatus === 'pending' 
                    ? "No pending reports to review" 
                    : "No reports match the current filter"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge variant="outline">
                            {getReasonLabel(report.reason)}
                          </Badge>
                          <Badge variant="secondary" className="capitalize">
                            {report.target_type}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            Reported by: {report.reporter_profile?.username || report.reporter_profile?.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(report.created_at).toLocaleString()}
                          </div>
                        </div>

                        {report.description && (
                          <div className="mb-4">
                            <p className="text-sm font-medium mb-1">Description:</p>
                            <p className="text-sm text-muted-foreground">{report.description}</p>
                          </div>
                        )}

                        {report.target_content && (
                          <div className="bg-muted/50 p-3 rounded-lg mb-4">
                            <p className="text-sm font-medium mb-2">Reported Content:</p>
                            {report.target_type === 'comment' ? (
                              <div>
                                <p className="text-sm">{report.target_content.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  By: {report.target_content.profiles?.username || 'Unknown'}
                                </p>
                              </div>
                            ) : report.target_type === 'chapter' ? (
                              <p className="text-sm">
                                Chapter {report.target_content.chapter_number}: {report.target_content.title}
                              </p>
                            ) : (
                              <p className="text-sm">Content ID: {report.target_id}</p>
                            )}
                          </div>
                        )}

                        {report.resolution_notes && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-1">Resolution Notes:</p>
                            <p className="text-sm text-muted-foreground">{report.resolution_notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Report Details</DialogTitle>
                              <DialogDescription>
                                Review and take action on this report
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              {/* Report details content */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Reporter</Label>
                                  <p className="text-sm">{report.reporter_profile?.username || report.reporter_profile?.email}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Report Date</Label>
                                  <p className="text-sm">{new Date(report.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Reason</Label>
                                  <p className="text-sm">{getReasonLabel(report.reason)}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <Badge variant={getStatusColor(report.status)}>{report.status}</Badge>
                                </div>
                              </div>

                              {report.description && (
                                <div>
                                  <Label className="text-sm font-medium">Description</Label>
                                  <p className="text-sm mt-1">{report.description}</p>
                                </div>
                              )}

                              {report.status === 'pending' && (
                                <div className="space-y-4 border-t pt-4">
                                  <div>
                                    <Label htmlFor="resolution-notes">Resolution Notes (Optional)</Label>
                                    <Textarea
                                      id="resolution-notes"
                                      value={resolutionNotes}
                                      onChange={(e) => setResolutionNotes(e.target.value)}
                                      placeholder="Add notes about your decision..."
                                      rows={3}
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => handleReportAction(report.id, 'dismiss', resolutionNotes)}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Dismiss Report
                                    </Button>
                                    <Button
                                      onClick={() => handleReportAction(report.id, 'resolve', resolutionNotes)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Resolve & Take Action
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};