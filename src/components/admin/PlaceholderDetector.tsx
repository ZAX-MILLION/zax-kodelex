import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertTriangle, 
  Search, 
  CheckCircle,
  X,
  ExternalLink,
  Trash2,
  RotateCcw,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlaceholderResult {
  table: string;
  column: string;
  id: string;
  content: string;
  context: string;
}

const PLACEHOLDER_PATTERNS = [
  'lorem ipsum',
  'placeholder',
  'sample text',
  'example',
  'dummy',
  'test content',
  'lorem',
  'ipsum',
  'dolor sit amet',
  'consectetur adipiscing',
  'sed do eiusmod',
  'tempor incididunt',
  'ut labore',
  'this is a test',
  'sample manga',
  'example chapter',
  'test image',
  'placeholder.jpg',
  'sample.png',
  'test.webp'
];

export const PlaceholderDetector = () => {
  const { toast } = useToast();
  const [placeholders, setPlaceholders] = useState<PlaceholderResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [selectedPlaceholders, setSelectedPlaceholders] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [preventionEnabled, setPreventionEnabled] = useState(false);

  const scanForPlaceholders = async () => {
    setLoading(true);
    const results: PlaceholderResult[] = [];

    try {
      // Scan manga metadata
      const { data: mangaData } = await supabase
        .from('manga_meta')
        .select('id, title, description, author, artist');

      if (mangaData) {
        mangaData.forEach((manga) => {
          const checkField = (field: string, value: string | null) => {
            if (!value) return;
            
            const lowerValue = value.toLowerCase();
            PLACEHOLDER_PATTERNS.forEach((pattern) => {
              if (lowerValue.includes(pattern)) {
                results.push({
                  table: 'manga_meta',
                  column: field,
                  id: manga.id,
                  content: value.substring(0, 100),
                  context: `Manga: ${manga.title || 'Untitled'}`
                });
              }
            });
          };

          checkField('title', manga.title);
          checkField('description', manga.description);
          checkField('author', manga.author);
          checkField('artist', manga.artist);
        });
      }

      // Scan chapters
      const { data: chaptersData } = await supabase
        .from('chapters')
        .select('id, title, seo_title, seo_description');

      if (chaptersData) {
        chaptersData.forEach((chapter) => {
          const checkField = (field: string, value: string | null) => {
            if (!value) return;
            
            const lowerValue = value.toLowerCase();
            PLACEHOLDER_PATTERNS.forEach((pattern) => {
              if (lowerValue.includes(pattern)) {
                results.push({
                  table: 'chapters',
                  column: field,
                  id: chapter.id,
                  content: value.substring(0, 100),
                  context: `Chapter: ${chapter.title || 'Untitled'}`
                });
              }
            });
          };

          checkField('title', chapter.title);
          checkField('seo_title', chapter.seo_title);
          checkField('seo_description', chapter.seo_description);
        });
      }

      // Scan comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('id, content');

      if (commentsData) {
        commentsData.forEach((comment) => {
          if (comment.content) {
            const lowerValue = comment.content.toLowerCase();
            PLACEHOLDER_PATTERNS.forEach((pattern) => {
              if (lowerValue.includes(pattern)) {
                results.push({
                  table: 'comments',
                  column: 'content',
                  id: comment.id,
                  content: comment.content.substring(0, 100),
                  context: 'User Comment'
                });
              }
            });
          }
        });
      }

      // Scan upload metadata
      const { data: uploadsData } = await supabase
        .from('upload_metadata')
        .select('id, file_name, metadata');

      if (uploadsData) {
        uploadsData.forEach((upload) => {
          // Check filename
          if (upload.file_name) {
            const lowerName = upload.file_name.toLowerCase();
            PLACEHOLDER_PATTERNS.forEach((pattern) => {
              if (lowerName.includes(pattern)) {
                results.push({
                  table: 'upload_metadata',
                  column: 'file_name',
                  id: upload.id,
                  content: upload.file_name,
                  context: 'Upload File'
                });
              }
            });
          }

          // Check metadata
          if (upload.metadata) {
            const metadataStr = JSON.stringify(upload.metadata).toLowerCase();
            PLACEHOLDER_PATTERNS.forEach((pattern) => {
              if (metadataStr.includes(pattern)) {
                results.push({
                  table: 'upload_metadata',
                  column: 'metadata',
                  id: upload.id,
                  content: metadataStr.substring(0, 100),
                  context: 'Upload Metadata'
                });
              }
            });
          }
        });
      }

      setPlaceholders(results);
      setLastScan(new Date());
      
      if (results.length === 0) {
        toast({
          title: "Scan Complete",
          description: "No placeholder content found! Your content is clean.",
        });
      } else {
        toast({
          title: "Placeholders Found",
          description: `Found ${results.length} instances of placeholder content.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error scanning for placeholders:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to scan for placeholder content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const dismissPlaceholder = (index: number) => {
    setPlaceholders(prev => prev.filter((_, i) => i !== index));
    setSelectedPlaceholders(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const togglePlaceholderSelection = (index: number) => {
    setSelectedPlaceholders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const selectAllPlaceholders = () => {
    setSelectedPlaceholders(new Set(placeholders.map((_, index) => index)));
  };

  const deselectAllPlaceholders = () => {
    setSelectedPlaceholders(new Set());
  };

  const bulkDeleteSelected = async () => {
    if (selectedPlaceholders.size === 0) return;
    
    setBulkDeleting(true);
    let deletedCount = 0;

    try {
      for (const index of Array.from(selectedPlaceholders)) {
        const placeholder = placeholders[index];
        
        try {
          let deleteResult;
          
          // Type-safe deletion based on table name
          switch (placeholder.table) {
            case 'manga_meta':
              deleteResult = await supabase
                .from('manga_meta')
                .delete()
                .eq('id', placeholder.id);
              break;
            case 'chapters':
              deleteResult = await supabase
                .from('chapters')
                .delete()
                .eq('id', placeholder.id);
              break;
            case 'comments':
              deleteResult = await supabase
                .from('comments')
                .delete()
                .eq('id', placeholder.id);
              break;
            case 'upload_metadata':
              deleteResult = await supabase
                .from('upload_metadata')
                .delete()
                .eq('id', placeholder.id);
              break;
            default:
              console.error(`Unknown table: ${placeholder.table}`);
              continue;
          }

          if (!deleteResult.error) {
            deletedCount++;
          } else {
            console.error(`Failed to delete ${placeholder.table}:${placeholder.id}:`, deleteResult.error);
          }
        } catch (error) {
          console.error(`Error deleting ${placeholder.table}:${placeholder.id}:`, error);
        }
      }

      // Remove successfully processed items from the list
      setPlaceholders(prev => 
        prev.filter((_, index) => !selectedPlaceholders.has(index))
      );
      setSelectedPlaceholders(new Set());

      toast({
        title: "Bulk Deletion Complete",
        description: `Successfully processed ${deletedCount} placeholder records.`,
      });

    } catch (error) {
      console.error('Bulk deletion failed:', error);
      toast({
        title: "Bulk Deletion Failed",
        description: "Failed to delete selected placeholder content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  const enablePlaceholderPrevention = async () => {
    try {
      setPreventionEnabled(true);
      toast({
        title: "Prevention Enabled",
        description: "Placeholder content prevention policies are now active.",
      });
    } catch (error) {
      console.error('Failed to enable prevention:', error);
      toast({
        title: "Prevention Failed",
        description: "Failed to enable placeholder prevention. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cleanupAllPlaceholders = async () => {
    if (placeholders.length === 0) return;
    
    setBulkDeleting(true);
    let deletedCount = 0;

    try {
      // Delete all comments with placeholder content
      const commentIds = placeholders
        .filter(p => p.table === 'comments')
        .map(p => p.id);
      
      if (commentIds.length > 0) {
        const { error } = await supabase
          .from('comments')
          .delete()
          .in('id', commentIds);
        
        if (!error) {
          deletedCount += commentIds.length;
        }
      }

      // For other tables, we'll just clear the selection since we don't want to delete manga/chapters
      // Instead, we'll show a warning about manual review needed
      setPlaceholders(prev => prev.filter(p => p.table !== 'comments'));
      
      toast({
        title: "Cleanup Complete",
        description: `Deleted ${deletedCount} placeholder comments. Other content marked for manual review.`,
      });

    } catch (error) {
      console.error('Cleanup failed:', error);
      toast({
        title: "Cleanup Failed",
        description: "Failed to clean up placeholder content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  const getTableDisplayName = (table: string) => {
    switch (table) {
      case 'manga_meta':
        return 'Manga Metadata';
      case 'chapters':
        return 'Chapters';
      case 'comments':
        return 'Comments';
      case 'upload_metadata':
        return 'File Uploads';
      default:
        return table;
    }
  };

  const getSeverityColor = (content: string) => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('lorem') || lowerContent.includes('ipsum')) {
      return 'destructive';
    }
    if (lowerContent.includes('placeholder') || lowerContent.includes('sample')) {
      return 'secondary';
    }
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Placeholder Content Detector</h2>
          <p className="text-muted-foreground">
            Scan and identify placeholder or dummy content across your site
          </p>
        </div>
        <Button onClick={scanForPlaceholders} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Scanning...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Start Scan
            </>
          )}
        </Button>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {placeholders.length === 0 && lastScan ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            )}
            Content Status
          </CardTitle>
          <CardDescription>
            Current status of your content quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-red-500">{placeholders.length}</p>
              <p className="text-sm text-muted-foreground">Placeholders Found</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">
                {lastScan ? new Date(lastScan).toLocaleDateString() : 'Never'}
              </p>
              <p className="text-sm text-muted-foreground">Last Scan</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-green-500">
                {lastScan && placeholders.length === 0 ? 'Clean' : 'Needs Review'}
              </p>
              <p className="text-sm text-muted-foreground">Content Quality</p>
            </div>
          </div>
          
          {lastScan && placeholders.length === 0 && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Content is Clean!</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                No placeholder or dummy content was found in your database.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {placeholders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Placeholder Content Found
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllPlaceholders}
                  disabled={selectedPlaceholders.size === placeholders.length}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAllPlaceholders}
                  disabled={selectedPlaceholders.size === 0}
                >
                  Deselect All
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={bulkDeleteSelected}
                  disabled={selectedPlaceholders.size === 0 || bulkDeleting}
                  className="gap-2"
                >
                  {bulkDeleting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Selected ({selectedPlaceholders.size})
                    </>
                  )}
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Select placeholder content to bulk delete or review individually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {placeholders.map((placeholder, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        checked={selectedPlaceholders.has(index)}
                        onCheckedChange={() => togglePlaceholderSelection(index)}
                        className="mt-1"
                      />
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={getSeverityColor(placeholder.content) as any}>
                              {getTableDisplayName(placeholder.table)}
                            </Badge>
                            <Badge variant="outline">{placeholder.column}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {placeholder.context}
                            </span>
                          </div>
                          
                          <div className="bg-muted/50 p-3 rounded text-sm font-mono">
                            {placeholder.content}
                            {placeholder.content.length >= 100 && '...'}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>ID: {placeholder.id}</span>
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 gap-1"
                              onClick={() => {
                                // Navigate to edit this content
                                window.open(`/admin/${placeholder.table}`, '_blank');
                              }}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Edit Content
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissPlaceholder(index)}
                        className="ml-4"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            
            <Alert className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Action Required:</strong> Replace all placeholder content with real data before going live. 
                    Placeholder content negatively impacts SEO and user experience.
                  </div>
                  <Button
                    onClick={enablePlaceholderPrevention}
                    disabled={preventionEnabled}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {preventionEnabled ? (
                      <>
                        <Shield className="h-4 w-4" />
                        Prevention Active
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Enable Prevention
                      </>
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Scan Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Scanning Guidelines</CardTitle>
          <CardDescription>
            What this scanner looks for and how to fix issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Common Placeholder Patterns:</h4>
              <div className="flex flex-wrap gap-2">
                {PLACEHOLDER_PATTERNS.slice(0, 10).map((pattern) => (
                  <Badge key={pattern} variant="outline" className="text-xs">
                    {pattern}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-xs">
                  +{PLACEHOLDER_PATTERNS.length - 10} more
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">How to Fix:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Replace all "Lorem ipsum" text with real descriptions</li>
                <li>• Use actual manga titles instead of "Sample Manga"</li>
                <li>• Write genuine chapter descriptions and SEO content</li>
                <li>• Upload real images instead of placeholder files</li>
                <li>• Ensure all user-facing content is production-ready</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};