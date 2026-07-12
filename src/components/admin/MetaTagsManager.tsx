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
import { Save, Plus, Trash2, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MetaTag {
  id: string;
  name: string;
  content: string;
  property?: string;
  httpEquiv?: string;
}

interface MetaTagsManagerProps {
  pageType: string;
  onSave: (metaTags: MetaTag[]) => void;
  initialTags?: MetaTag[];
}

const COMMON_META_TAGS = [
  { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
  { name: 'charset', content: 'UTF-8' },
  { name: 'author', content: '' },
  { name: 'generator', content: 'Manga Reader' },
  { name: 'robots', content: 'index, follow' },
  { name: 'googlebot', content: 'index, follow' },
  { name: 'theme-color', content: '#dc2626' },
];

const SOCIAL_META_TAGS = [
  { property: 'og:type', content: 'website' },
  { property: 'og:site_name', content: '' },
  { property: 'og:locale', content: 'en_US' },
  { property: 'twitter:card', content: 'summary_large_image' },
  { property: 'twitter:creator', content: '' },
  { property: 'twitter:site', content: '' },
];

export const MetaTagsManager = ({ pageType, onSave, initialTags = [] }: MetaTagsManagerProps) => {
  const { toast } = useToast();
  const [metaTags, setMetaTags] = useState<MetaTag[]>(initialTags);
  const [newTag, setNewTag] = useState<MetaTag>({
    id: '',
    name: '',
    content: '',
  });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    setMetaTags(initialTags);
  }, [initialTags]);

  const addMetaTag = () => {
    if (!newTag.name || !newTag.content) {
      toast({
        title: "Incomplete meta tag",
        description: "Please fill in both name and content fields.",
        variant: "destructive",
      });
      return;
    }

    const tag: MetaTag = {
      id: Date.now().toString(),
      ...newTag,
    };

    setMetaTags(prev => [...prev, tag]);
    setNewTag({ id: '', name: '', content: '' });
  };

  const removeMetaTag = (id: string) => {
    setMetaTags(prev => prev.filter(tag => tag.id !== id));
  };

  const updateMetaTag = (id: string, field: keyof MetaTag, value: string) => {
    setMetaTags(prev => prev.map(tag =>
      tag.id === id ? { ...tag, [field]: value } : tag
    ));
  };

  const addCommonTag = (tagTemplate: any) => {
    const tag: MetaTag = {
      id: Date.now().toString(),
      name: tagTemplate.name || '',
      content: tagTemplate.content,
      property: tagTemplate.property,
      httpEquiv: tagTemplate.httpEquiv,
    };

    setMetaTags(prev => [...prev, tag]);
  };

  const generateMetaHTML = () => {
    return metaTags.map(tag => {
      if (tag.property) {
        return `<meta property="${tag.property}" content="${tag.content}" />`;
      } else if (tag.httpEquiv) {
        return `<meta http-equiv="${tag.httpEquiv}" content="${tag.content}" />`;
      } else {
        return `<meta name="${tag.name}" content="${tag.content}" />`;
      }
    }).join('\n');
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Meta tag HTML has been copied.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    onSave(metaTags);
    toast({
      title: "Meta tags saved",
      description: `Meta tags for ${pageType} page have been saved.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Meta Tags Manager</h3>
          <p className="text-sm text-muted-foreground">
            Configure meta tags for {pageType} pages
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Meta Tags
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Meta Tag</CardTitle>
            <CardDescription>Create custom meta tags for SEO and social media</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name/Property</Label>
                <Input
                  value={newTag.name || newTag.property || ''}
                  onChange={(e) => setNewTag(prev => ({ 
                    ...prev, 
                    name: e.target.value.startsWith('og:') || e.target.value.startsWith('twitter:') ? '' : e.target.value,
                    property: e.target.value.startsWith('og:') || e.target.value.startsWith('twitter:') ? e.target.value : ''
                  }))}
                  placeholder="description, og:title, etc."
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Input
                  value={newTag.content}
                  onChange={(e) => setNewTag(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Meta tag content"
                />
              </div>
            </div>
            
            <Button onClick={addMetaTag} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Meta Tag
            </Button>

            <div className="space-y-2">
              <Label>Quick Add - Common Tags</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_META_TAGS.map((tag, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => addCommonTag(tag)}
                  >
                    {tag.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quick Add - Social Media</Label>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_META_TAGS.map((tag, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => addCommonTag(tag)}
                  >
                    {tag.property}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Meta Tags</CardTitle>
            <CardDescription>
              {metaTags.length} meta tags configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {metaTags.map((tag, index) => (
                <div key={tag.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {tag.property || tag.name || tag.httpEquiv}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const html = tag.property 
                            ? `<meta property="${tag.property}" content="${tag.content}" />`
                            : `<meta name="${tag.name}" content="${tag.content}" />`;
                          copyToClipboard(html, index);
                        }}
                      >
                        {copiedIndex === index ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMetaTag(tag.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Input
                    value={tag.content}
                    onChange={(e) => updateMetaTag(tag.id, 'content', e.target.value)}
                    placeholder="Meta tag content"
                    className="text-sm"
                  />
                </div>
              ))}
              
              {metaTags.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No meta tags configured yet. Add some using the form on the left.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {metaTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated HTML</CardTitle>
            <CardDescription>
              Copy this HTML to your page head section
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generateMetaHTML()}
              readOnly
              rows={8}
              className="font-mono text-sm"
            />
            <Button 
              className="mt-2 gap-2" 
              variant="outline"
              onClick={() => copyToClipboard(generateMetaHTML(), -1)}
            >
              <Copy className="h-4 w-4" />
              Copy All HTML
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};