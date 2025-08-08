import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Ban, 
  Edit3, 
  Flag, 
  Eye, 
  Lock,
  Users,
  Activity,
  FileText,
  AlertTriangle,
  History,
  Star
} from 'lucide-react';

interface UserModerationPanelProps {
  userId: string;
  onClose?: () => void;
}

interface ModerationData {
  profile: any;
  activity_logs: any[];
  reports: any[];
  user_notes: any[];
}

export const UserModerationPanel: React.FC<UserModerationPanelProps> = ({
  userId,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [moderationData, setModerationData] = useState<ModerationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [fieldLocks, setFieldLocks] = useState({
    bio: false,
    profile_picture: false,
    username: false,
    display_name: false
  });

  useEffect(() => {
    if (userId) {
      loadModerationData();
    }
  }, [userId]);

  const loadModerationData = async () => {
    try {
      setLoading(true);
      
      // Load profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      // Load activity logs
      const { data: activityLogs, error: logsError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Load user notes
      const { data: notes, error: notesError } = await supabase
        .from('user_notes')
        .select(`
          *,
          author_profile:profiles!user_notes_note_author_id_fkey(username, display_name)
        `)
        .eq('target_user_id', userId)
        .order('created_at', { ascending: false });

      setModerationData({
        profile,
        activity_logs: activityLogs || [],
        reports: [], // We'll implement this later
        user_notes: notes || []
      });

      // Load field locks from profile metadata (if exists)
      const locks = (profile as any).moderation_locks || {};
      setFieldLocks({
        bio: locks.bio || false,
        profile_picture: locks.profile_picture || false,
        username: locks.username || false,
        display_name: locks.display_name || false
      });

    } catch (error) {
      console.error('Error loading moderation data:', error);
      toast({
        title: "Error",
        description: "Failed to load moderation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (newRole: 'user' | 'author' | 'admin' | 'editor' | 'member' | 'uploader' | 'seo_manager') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });

      await loadModerationData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const toggleUserBan = async () => {
    try {
      const newBanStatus = !moderationData?.profile.is_banned;
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: newBanStatus })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${newBanStatus ? 'banned' : 'unbanned'} successfully`,
      });

      await loadModerationData();
    } catch (error) {
      console.error('Error updating ban status:', error);
      toast({
        title: "Error",
        description: "Failed to update ban status",
        variant: "destructive",
      });
    }
  };

  const updateFieldLocks = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ moderation_locks: fieldLocks } as any)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Field locks updated successfully",
      });
    } catch (error) {
      console.error('Error updating field locks:', error);
      toast({
        title: "Error",
        description: "Failed to update field locks",
        variant: "destructive",
      });
    }
  };

  const addModerationNote = async () => {
    if (!newNote.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('user_notes')
        .insert({
          target_user_id: userId,
          note_author_id: user.id,
          note_content: newNote.trim(),
          note_type: 'moderation'
        });

      if (error) throw error;

      setNewNote('');
      await loadModerationData();
      
      toast({
        title: "Note added",
        description: "Moderation note has been saved",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add moderation note",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!moderationData) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Unable to load moderation data</p>
      </div>
    );
  }

  const { profile, activity_logs, user_notes } = moderationData;

  return (
    <div className="space-y-6">
      {/* User Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Moderation Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="font-mono text-sm">{profile.email}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Join Date</Label>
              <p className="text-sm">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Current Role</Label>
              <Badge variant="outline" className="mt-1">
                {profile.role}
              </Badge>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Badge variant={profile.is_banned ? "destructive" : "outline"} className="mt-1">
                {profile.is_banned ? "Banned" : "Active"}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <Select value={profile.role} onValueChange={updateUserRole}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant={profile.is_banned ? "outline" : "destructive"}
              onClick={toggleUserBan}
            >
              <Ban className="h-4 w-4 mr-2" />
              {profile.is_banned ? 'Unban User' : 'Ban User'}
            </Button>

            <Button variant="outline">
              <Flag className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Field Locks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Field Restrictions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(fieldLocks).map(([field, locked]) => (
              <div key={field} className="flex items-center justify-between">
                <Label htmlFor={`lock-${field}`} className="capitalize">
                  {field.replace('_', ' ')}
                </Label>
                <Switch
                  id={`lock-${field}`}
                  checked={locked}
                  onCheckedChange={(checked) => 
                    setFieldLocks(prev => ({ ...prev, [field]: checked }))
                  }
                />
              </div>
            ))}
          </div>
          <Button onClick={updateFieldLocks} size="sm">
            <Lock className="h-4 w-4 mr-2" />
            Update Restrictions
          </Button>
        </CardContent>
      </Card>

      {/* Bio Content Moderation */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Bio Content Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button size="sm" variant="destructive">
                <Ban className="h-4 w-4 mr-2" />
                Flag Content
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Moderation Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Moderation Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Add a private moderation note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px]"
            />
            <Button onClick={addModerationNote} disabled={!newNote.trim()}>
              Add Note
            </Button>
          </div>

          <Separator />

          {user_notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No moderation notes yet
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {user_notes.map((note) => (
                <div key={note.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">
                      {note.author_profile?.display_name || note.author_profile?.username || 'Unknown'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{note.note_content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activity_logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity
            </p>
          ) : (
            <div className="space-y-2">
              {activity_logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{log.activity_type}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};