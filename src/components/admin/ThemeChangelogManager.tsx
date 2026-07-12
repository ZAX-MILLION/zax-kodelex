import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Save, X, FileText } from 'lucide-react';
import { ChildTheme } from '@/hooks/useChildTheme';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ChangelogEntry {
  id: string;
  version: string;
  changes: string;
  created_at: string;
  created_by?: string;
}

interface ThemeChangelogManagerProps {
  theme: ChildTheme;
}

// Enhancement 9: Per-theme changelog and notes
export const ThemeChangelogManager: React.FC<ThemeChangelogManagerProps> = ({ theme }) => {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChangelog();
  }, [theme.id]);

  const loadChangelog = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('theme_changelog')
        .select('*')
        .eq('theme_id', theme.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEntries(data || []);
    } catch (error) {
      console.error('Error loading changelog:', error);
      // Fallback to show initial entry if no changelog exists
      setEntries([
        {
          id: '1',
          version: theme.version,
          changes: 'Initial theme creation',
          created_at: theme.created_at,
          created_by: theme.author || 'admin'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addChangelogEntry = async () => {
    if (!newEntry.trim()) return;

    try {
      const { data, error } = await supabase
        .from('theme_changelog')
        .insert({
          theme_id: theme.id,
          version: theme.version,
          changes: newEntry
        })
        .select()
        .single();

      if (error) throw error;

      setEntries(prev => [data, ...prev]);
      setNewEntry('');
      setIsAdding(false);

      toast({
        title: "Changelog Updated",
        description: "New changelog entry has been added."
      });
    } catch (error) {
      console.error('Error adding changelog entry:', error);
      toast({
        title: "Error",
        description: "Failed to add changelog entry.",
        variant: "destructive"
      });
    }
  };

  const updateChangelogEntry = async (id: string, changes: string) => {
    try {
      const { error } = await supabase
        .from('theme_changelog')
        .update({ changes })
        .eq('id', id);

      if (error) throw error;

      setEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, changes } : entry
      ));
      setEditingId(null);

      toast({
        title: "Changelog Updated",
        description: "Changelog entry has been updated."
      });
    } catch (error) {
      console.error('Error updating changelog entry:', error);
      toast({
        title: "Error",
        description: "Failed to update changelog entry.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Theme Changelog
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isAdding && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Version {theme.version}</Badge>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={addChangelogEntry}
                  disabled={!newEntry.trim()}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNewEntry('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Describe the changes made in this version..."
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              rows={4}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading changelog...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No changelog entries yet</p>
            <p className="text-sm">Add the first entry to track theme changes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={entry.id}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">v{entry.version}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </span>
                    {entry.created_by && (
                      <span className="text-xs text-muted-foreground">
                        by {entry.created_by}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(entry.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>

                {editingId === entry.id ? (
                  <EditableEntry
                    initialValue={entry.changes}
                    onSave={(changes) => updateChangelogEntry(entry.id, changes)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {entry.changes}
                  </div>
                )}

                {index < entries.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface EditableEntryProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

const EditableEntry: React.FC<EditableEntryProps> = ({ 
  initialValue, 
  onSave, 
  onCancel 
}) => {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => onSave(value)}
          disabled={!value.trim()}
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
};