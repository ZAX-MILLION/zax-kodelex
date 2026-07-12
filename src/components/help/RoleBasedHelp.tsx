import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, 
  BookOpen, 
  Video, 
  FileText, 
  ExternalLink,
  Search,
  User,
  Upload,
  BarChart,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HelpContent {
  id: string;
  title: string;
  content: string;
  category: string;
  role_target: string;
  order_index: number;
  content_type: string;
}

const roleIcons: Record<string, React.ReactNode> = {
  member: <User className="h-4 w-4" />,
  uploader: <Upload className="h-4 w-4" />,
  seo_manager: <BarChart className="h-4 w-4" />,
  admin: <Settings className="h-4 w-4" />,
  author: <BookOpen className="h-4 w-4" />
};

const categoryIcons: Record<string, React.ReactNode> = {
  getting_started: <BookOpen className="h-4 w-4" />,
  features: <FileText className="h-4 w-4" />,
  tutorials: <Video className="h-4 w-4" />,
  troubleshooting: <HelpCircle className="h-4 w-4" />
};

export const RoleBasedHelp: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [helpContent, setHelpContent] = useState<HelpContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('getting_started');

  useEffect(() => {
    const loadHelpContent = async () => {
      if (!userProfile?.role) return;

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('help_content')
          .select('*')
          .or(`role_target.eq.${userProfile.role},role_target.eq.member`)
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (error) throw error;

        setHelpContent(data || []);
      } catch (error) {
        console.error('Error loading help content:', error);
        toast({
          title: "Error loading help",
          description: "Failed to load help content",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadHelpContent();
  }, [userProfile?.role, toast]);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'uploader': return 'Content Uploader';
      case 'seo_manager': return 'SEO Manager';
      case 'author': return 'Author';
      default: return 'User';
    }
  };

  const categories = [...new Set(helpContent.map(item => item.category))];
  const filteredContent = helpContent.filter(item => item.category === activeCategory);

  const renderContent = (content: string, contentType: string) => {
    if (contentType === 'markdown') {
      // Simple markdown-like rendering
      return content
        .split('\n')
        .map((line, index) => {
          if (line.startsWith('# ')) {
            return <h1 key={index} className="text-2xl font-bold mb-4">{line.substring(2)}</h1>;
          }
          if (line.startsWith('## ')) {
            return <h2 key={index} className="text-xl font-semibold mb-3">{line.substring(3)}</h2>;
          }
          if (line.startsWith('### ')) {
            return <h3 key={index} className="text-lg font-medium mb-2">{line.substring(4)}</h3>;
          }
          if (line.startsWith('- ')) {
            return <li key={index} className="ml-4 mb-1">{line.substring(2)}</li>;
          }
          if (line.includes('[') && line.includes('](')) {
            // Simple link rendering
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            const parts = line.split(linkRegex);
            return (
              <p key={index} className="mb-2">
                {parts.map((part, i) => {
                  if (i % 3 === 1) {
                    const url = parts[i + 1];
                    return (
                      <Button 
                        key={i} 
                        variant="link" 
                        className="p-0 h-auto text-primary underline"
                        onClick={() => window.open(url, '_blank')}
                      >
                        {part}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    );
                  }
                  if (i % 3 === 0) {
                    return part;
                  }
                  return null;
                })}
              </p>
            );
          }
          if (line.trim() === '') {
            return <br key={index} />;
          }
          return <p key={index} className="mb-2">{line}</p>;
        });
    }
    
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="h-8 w-8" />
            Help Center
          </h1>
          <p className="text-muted-foreground">
            Get help and learn how to use the platform effectively
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          {roleIcons[userProfile?.role || 'member']}
          {getRoleDisplayName(userProfile?.role || 'member')}
        </Badge>
      </div>

      {/* Help Content */}
      {categories.length > 0 ? (
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-4">
            {categories.map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="flex items-center gap-2"
              >
                {categoryIcons[category] || <FileText className="h-4 w-4" />}
                {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category} className="space-y-4">
              {helpContent
                .filter(item => item.category === category)
                .map(item => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{item.title}</span>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {roleIcons[item.role_target]}
                          {getRoleDisplayName(item.role_target)}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        {renderContent(item.content, item.content_type)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Help Content Available</h3>
            <p className="text-muted-foreground">
              Help content for your role is not yet available. Contact support for assistance.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Common help resources and documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start gap-2">
              <Video className="h-4 w-4" />
              Video Tutorials
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <FileText className="h-4 w-4" />
              Documentation
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <ExternalLink className="h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};