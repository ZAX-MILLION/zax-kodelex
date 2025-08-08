import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Edit, Trash2, Eye } from 'lucide-react';
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

interface Series {
  id: string;
  title: string;
  description: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  created_at: string;
  chapters_count: number;
}

export const AuthorSeriesManager = () => {
  const { user } = useAuth();
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSeries, setNewSeries] = useState({
    title: '',
    description: '',
    status: 'ongoing' as const,
  });

  useEffect(() => {
    if (user) {
      fetchSeries();
    }
  }, [user]);

  const fetchSeries = async () => {
    try {
      setIsLoading(true);
      // Mock data for now since manga_series table doesn't exist
      setSeries([]);
    } catch (error) {
      console.error('Error fetching series:', error);
      toast({
        title: "Error",
        description: "Failed to load series",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSeries = async () => {
    try {
      // Mock series creation
      toast({
        title: "Success",
        description: "Series created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewSeries({ title: '', description: '', status: 'ongoing' });
      fetchSeries();
    } catch (error) {
      console.error('Error creating series:', error);
      toast({
        title: "Error",
        description: "Failed to create series",
        variant: "destructive",
      });
    }
  };

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
          <h1 className="text-3xl font-bold">My Series</h1>
          <p className="text-muted-foreground">Manage your manga series and chapters</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Series
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Series</DialogTitle>
              <DialogDescription>
                Add a new manga series to your collection
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newSeries.title}
                  onChange={(e) => setNewSeries(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter series title..."
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSeries.description}
                  onChange={(e) => setNewSeries(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter series description..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createSeries} disabled={!newSeries.title.trim()}>
                  Create Series
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {series.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No series yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first manga series to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Series
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {series.map((s) => (
            <Card key={s.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{s.title}</CardTitle>
                    <Badge variant={s.status === 'ongoing' ? 'default' : 'secondary'}>
                      {s.status}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{s.description}</CardDescription>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{s.chapters_count} chapters</span>
                  <span>Created {new Date(s.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};