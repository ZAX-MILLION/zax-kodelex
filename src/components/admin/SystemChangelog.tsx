import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Calendar, 
  Tag, 
  Edit, 
  Trash2,
  GitCommit,
  Bug,
  Shield,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  description: string;
  change_type: string;
  developer_notes: string;
  release_date: string;
  is_published: boolean;
  created_at: string;
  created_by: string;
}

export const SystemChangelog = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    version: "",
    title: "",
    description: "",
    change_type: "feature",
    developer_notes: "",
    is_published: true
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_changelog')
        .select('*')
        .order('release_date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading changelog:', error);
      toast({
        title: "Error loading changelog",
        description: "Failed to load changelog entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('system_changelog')
        .insert({
          ...formData,
          created_by: user.data.user.id,
          release_date: new Date().toISOString()
        });

      if (error) throw error;

      setFormData({
        version: "",
        title: "",
        description: "",
        change_type: "feature",
        developer_notes: "",
        is_published: true
      });
      setShowAddDialog(false);
      loadEntries();

      toast({
        title: "Changelog entry added",
        description: "New changelog entry has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding changelog entry:', error);
      toast({
        title: "Error adding entry",
        description: "Failed to add changelog entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this changelog entry?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('system_changelog')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setEntries(prev => prev.filter(e => e.id !== entryId));
      
      toast({
        title: "Entry deleted",
        description: "Changelog entry has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error deleting entry",
        description: "Failed to delete changelog entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const togglePublished = async (entryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('system_changelog')
        .update({ is_published: !currentStatus })
        .eq('id', entryId);

      if (error) throw error;

      setEntries(prev => prev.map(e => 
        e.id === entryId ? { ...e, is_published: !currentStatus } : e
      ));

      toast({
        title: "Status updated",
        description: `Entry ${!currentStatus ? 'published' : 'unpublished'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error updating status",
        description: "Failed to update entry status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <GitCommit className="h-4 w-4" />;
      case 'bugfix':
        return <Bug className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'default';
      case 'bugfix':
        return 'destructive';
      case 'security':
        return 'secondary';
      case 'performance':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Changelog</h2>
          <p className="text-muted-foreground">
            Track system changes, updates, and releases
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Changelog Entry</DialogTitle>
              <DialogDescription>
                Record a new system change or update
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  placeholder="v1.0.0"
                  value={formData.version}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, version: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="change_type">Change Type</Label>
                <Select
                  value={formData.change_type}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, change_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="bugfix">Bug Fix</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief description of the change"
                value={formData.title}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of what changed"
                value={formData.description}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="developer_notes">Developer Notes (Optional)</Label>
              <Textarea
                id="developer_notes"
                placeholder="Technical notes for developers"
                value={formData.developer_notes}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, developer_notes: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, is_published: e.target.checked }))
                }
                className="rounded"
              />
              <Label htmlFor="is_published">Publish immediately</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={addEntry}>
                Add Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{entries.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Features</p>
                <p className="text-2xl font-bold">
                  {entries.filter(e => e.change_type === 'feature').length}
                </p>
              </div>
              <GitCommit className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bug Fixes</p>
                <p className="text-2xl font-bold">
                  {entries.filter(e => e.change_type === 'bugfix').length}
                </p>
              </div>
              <Bug className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">
                  {entries.filter(e => e.is_published).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Changelog Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Changelog Entries</CardTitle>
          <CardDescription>System changes and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entries.map((entry) => (
              <div 
                key={entry.id} 
                className={`border rounded-lg p-4 ${!entry.is_published ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={getTypeColor(entry.change_type) as any}
                        className="gap-1"
                      >
                        {getTypeIcon(entry.change_type)}
                        {entry.change_type}
                      </Badge>
                      <Badge variant="outline">{entry.version}</Badge>
                      {!entry.is_published && (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-medium">{entry.title}</h3>
                    <p className="text-muted-foreground">{entry.description}</p>
                    
                    {entry.developer_notes && (
                      <div className="bg-muted/50 p-3 rounded text-sm">
                        <p className="font-medium mb-1">Developer Notes:</p>
                        <p className="text-muted-foreground">{entry.developer_notes}</p>
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      Released: {format(new Date(entry.release_date), 'PPP')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublished(entry.id, entry.is_published)}
                    >
                      {entry.is_published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEntry(entry.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {entries.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No changelog entries found</p>
              <p className="text-sm text-muted-foreground">
                Add your first changelog entry to start tracking changes
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};