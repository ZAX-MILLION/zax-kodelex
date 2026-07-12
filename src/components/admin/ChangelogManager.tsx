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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Plus, 
  Calendar, 
  Tag, 
  Edit, 
  Trash2,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  Activity,
  Archive,
  Search,
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
  tags?: string[];
  affected_components?: string[];
}

export const ChangelogManager = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ChangelogEntry | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [typeFilter, setTypeFilter] = useState("");
  const [componentFilter, setComponentFilter] = useState("");

  const [formData, setFormData] = useState({
    version: "",
    title: "",
    description: "",
    change_type: "feature",
    developer_notes: "",
    is_published: true,
    tags: [] as string[],
    affected_components: [] as string[]
  });

  const [tagInput, setTagInput] = useState("");
  const [componentInput, setComponentInput] = useState("");

  // Common components/routes for suggestions
  const commonComponents = [
    "Homepage", "Reader", "Series", "Chapters", "Profile", "Admin Dashboard",
    "Browse", "Search", "Comments", "Authentication", "Payment", "Settings"
  ];

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
      
      // Add mock tags and components for demo purposes
      const entriesWithExtras = (data || []).map(entry => ({
        ...entry,
        tags: entry.developer_notes ? [entry.change_type, 'system'] : [entry.change_type],
        affected_components: [entry.change_type === 'feature' ? 'Homepage' : 'System']
      }));
      
      setEntries(entriesWithExtras);
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

  const resetForm = () => {
    setFormData({
      version: "",
      title: "",
      description: "",
      change_type: "feature",
      developer_notes: "",
      is_published: true,
      tags: [],
      affected_components: []
    });
    setTagInput("");
    setComponentInput("");
    setEditingEntry(null);
  };

  const saveEntry = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const entryData = {
        version: formData.version,
        title: formData.title,
        description: formData.description,
        change_type: formData.change_type,
        developer_notes: formData.developer_notes,
        is_published: formData.is_published,
        release_date: new Date().toISOString(),
        created_by: user.data.user.id
      };

      if (editingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('system_changelog')
          .update(entryData)
          .eq('id', editingEntry.id);

        if (error) throw error;
        
        toast({
          title: "Entry updated",
          description: "Changelog entry has been updated successfully.",
        });
      } else {
        // Create new entry
        const { error } = await supabase
          .from('system_changelog')
          .insert(entryData);

        if (error) throw error;
        
        toast({
          title: "Entry added",
          description: "New changelog entry has been added successfully.",
        });
      }

      resetForm();
      setShowAddDialog(false);
      loadEntries();
    } catch (error) {
      console.error('Error saving changelog entry:', error);
      toast({
        title: "Error saving entry",
        description: "Failed to save changelog entry. Please try again.",
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

  const editEntry = (entry: ChangelogEntry) => {
    setEditingEntry(entry);
    setFormData({
      version: entry.version,
      title: entry.title,
      description: entry.description,
      change_type: entry.change_type,
      developer_notes: entry.developer_notes,
      is_published: entry.is_published,
      tags: entry.tags || [],
      affected_components: entry.affected_components || []
    });
    setShowAddDialog(true);
  };

  const toggleExpanded = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addComponent = () => {
    if (componentInput.trim() && !formData.affected_components.includes(componentInput.trim())) {
      setFormData(prev => ({
        ...prev,
        affected_components: [...prev.affected_components, componentInput.trim()]
      }));
      setComponentInput("");
    }
  };

  const removeComponent = (component: string) => {
    setFormData(prev => ({
      ...prev,
      affected_components: prev.affected_components.filter(c => c !== component)
    }));
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchQuery === "" || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && entry.is_published) ||
      (statusFilter === 'draft' && !entry.is_published);
    
    const matchesType = typeFilter === "" || entry.change_type === typeFilter;
    
    const matchesComponent = componentFilter === "" || 
      (entry.affected_components && entry.affected_components.some(comp => 
        comp.toLowerCase().includes(componentFilter.toLowerCase())));

    return matchesSearch && matchesStatus && matchesType && matchesComponent;
  });

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

  // Get unique types and components for filter dropdowns
  const allTypes = Array.from(new Set(entries.map(entry => entry.change_type)));
  const allComponents = Array.from(new Set(entries.flatMap(entry => entry.affected_components || [])));

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
          <h2 className="text-2xl font-bold">Advanced Changelog Manager</h2>
          <p className="text-muted-foreground">
            Manage system changes and user-facing updates with advanced filtering
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? 'Edit Changelog Entry' : 'Add Changelog Entry'}
              </DialogTitle>
              <DialogDescription>
                {editingEntry ? 'Update the changelog entry details' : 'Create a new changelog entry to track system changes'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
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
                <Label>Affected Components</Label>
                <div className="flex gap-2">
                  <Select onValueChange={(value) => {
                    if (!formData.affected_components.includes(value)) {
                      setFormData(prev => ({
                        ...prev,
                        affected_components: [...prev.affected_components, value]
                      }));
                    }
                  }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a component..." />
                    </SelectTrigger>
                    <SelectContent>
                      {commonComponents.map((comp) => (
                        <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or type custom..."
                    value={componentInput}
                    onChange={(e) => setComponentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addComponent()}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addComponent} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.affected_components.map((component) => (
                    <Badge key={component} variant="outline" className="gap-1">
                      {component}
                      <button
                        type="button"
                        onClick={() => removeComponent(component)}
                        className="ml-1 text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
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
                <Button onClick={saveEntry}>
                  {editingEntry ? 'Update Entry' : 'Add Entry'}
                </Button>
              </div>
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
              <FileText className="h-8 w-8 text-muted-foreground" />
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
              <Activity className="h-8 w-8 text-muted-foreground" />
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
                <p className="text-sm font-medium text-muted-foreground">Components</p>
                <p className="text-2xl font-bold">{allComponents.length}</p>
              </div>
              <Tag className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type-filter">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {allTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="component-filter">Component</Label>
              <Select value={componentFilter} onValueChange={setComponentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by component..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Components</SelectItem>
                  {allComponents.map((component) => (
                    <SelectItem key={component} value={component}>{component}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Changelog Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Changelog Entries ({filteredEntries.length})</CardTitle>
          <CardDescription>System changes and updates with collapsible details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <Collapsible key={entry.id} open={expandedEntries.has(entry.id)}>
                <div className={`border rounded-lg ${!entry.is_published ? 'opacity-60' : ''}`}>
                  <CollapsibleTrigger
                    onClick={() => toggleExpanded(entry.id)}
                    className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
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
                          {entry.version && (
                            <Badge variant="outline">{entry.version}</Badge>
                          )}
                          {!entry.is_published && (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                          <span className="text-sm text-muted-foreground ml-auto">
                            {format(new Date(entry.release_date), 'PPP')}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-medium">{entry.title}</h3>
                        
                        {entry.affected_components && entry.affected_components.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {entry.affected_components.map((component) => (
                              <Badge key={component} variant="secondary" className="text-xs">
                                {component}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {expandedEntries.has(entry.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-4 pb-4 border-t bg-muted/20">
                      <div className="pt-4 space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Description</p>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {entry.description}
                          </p>
                        </div>
                        
                        {entry.developer_notes && (
                          <div className="bg-muted/50 p-3 rounded text-sm">
                            <p className="font-medium mb-1">Developer Notes:</p>
                            <p className="text-muted-foreground">{entry.developer_notes}</p>
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              editEntry(entry);
                            }}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEntry(entry.id);
                            }}
                            className="text-destructive hover:text-destructive gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>

          {filteredEntries.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {entries.length === 0 ? 'No changelog entries found' : 'No entries match your filters'}
              </p>
              <p className="text-sm text-muted-foreground">
                {entries.length === 0 
                  ? 'Add your first changelog entry to start tracking changes'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};