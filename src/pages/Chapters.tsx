import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Search, Clock, Star, Lock, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHelmet from '@/components/SEOHelmet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Chapter {
  id: string;
  title: string;
  chapter_number: number;
  pages: any;
  page_count: number;
  release_date: string;
  is_locked: boolean;
  coin_cost?: number | null;
  series_id?: string | null;
  sort_order: number;
  created_at?: string;
  download_count?: number;
  seo_description?: string;
  seo_title?: string;
  view_count?: number;
}

const Chapters = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const { toast } = useToast();

  useEffect(() => {
    loadChapters();
  }, []);

  const loadChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('chapter_number', { ascending: false });

      if (error) {
        console.error('Error loading chapters:', error);
        toast({
          title: "Error",
          description: "Failed to load chapters",
          variant: "destructive",
        });
        return;
      }

      setChapters(data || []);
    } catch (error) {
      console.error('Error loading chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.chapter_number.toString().includes(searchTerm)
  );

  const sortedChapters = [...filteredChapters].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      case 'oldest':
        return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
      case 'chapter':
        return a.chapter_number - b.chapter_number;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <SEOHelmet 
        title="All Chapters - Manga Reader"
        description="Browse and read all available manga chapters. Find your next favorite chapter with our comprehensive chapter library."
        keywords="manga chapters, read manga, manga library, chapter list"
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">All Chapters</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Discover and read from our complete chapter collection
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="chapter">Chapter Number</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{chapters.length}</div>
              <div className="text-sm text-muted-foreground">Total Chapters</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">
                {chapters.filter(c => !c.is_locked).length}
              </div>
              <div className="text-sm text-muted-foreground">Free Chapters</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {chapters.filter(c => c.is_locked).length}
              </div>
              <div className="text-sm text-muted-foreground">Premium Chapters</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">
                {chapters.reduce((sum, c) => sum + (c.page_count || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Pages</div>
            </CardContent>
          </Card>
        </div>

        {/* Chapter Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-32 bg-muted rounded mb-4" />
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedChapters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedChapters.map((chapter) => (
              <Card key={chapter.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant={chapter.is_locked ? "destructive" : "default"} className="text-xs">
                      {chapter.is_locked ? (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Premium
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Free
                        </>
                      )}
                    </Badge>
                    {chapter.is_locked && chapter.coin_cost && (
                      <Badge variant="outline" className="text-xs">
                        {chapter.coin_cost} coins
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    Chapter {chapter.chapter_number}: {chapter.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(chapter.release_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <BookOpen className="h-3 w-3" />
                      {chapter.page_count || 0} pages
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button asChild className="w-full" variant={chapter.is_locked ? "outline" : "default"}>
                    <Link to={`/reader/${chapter.id}`}>
                      {chapter.is_locked ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Unlock & Read
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Read Now
                        </>
                      )}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No chapters found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'No chapters are available at the moment'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Chapters;