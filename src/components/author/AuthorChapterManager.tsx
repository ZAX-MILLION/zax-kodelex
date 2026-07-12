import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Chapter {
  id: string;
  title: string;
  chapter_number: number;
  created_at: string;
  series_title: string;
}

export const AuthorChapterManager = () => {
  const { user } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchChapters();
    }
  }, [user]);

  const fetchChapters = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chapters')
        .select('id, title, chapter_number, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const chaptersWithSeries = data?.map(chapter => ({
        ...chapter,
        series_title: 'Your Manga Series',
      })) || [];

      setChapters(chaptersWithSeries);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast({
        title: "Error",
        description: "Failed to load chapters",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.series_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">Chapter Management</h1>
          <p className="text-muted-foreground">Manage your manga chapters</p>
        </div>
        <Button asChild>
          <Link to="/author/upload">
            <Plus className="mr-2 h-4 w-4" />
            Upload Chapter
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Chapters</CardTitle>
          <CardDescription>Find specific chapters by title or series</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredChapters.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No matching chapters' : 'No chapters yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Upload your first chapter to get started'}
            </p>
            <Button asChild>
              <Link to="/author/upload">
                <Plus className="mr-2 h-4 w-4" />
                Upload Chapter
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredChapters.map((chapter) => (
            <Card key={chapter.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{chapter.title}</h3>
                      <Badge variant="outline">Ch. {chapter.chapter_number}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Series: {chapter.series_title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(chapter.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};