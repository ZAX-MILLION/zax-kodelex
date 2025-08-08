import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, Settings, Shield, DollarSign, Upload, Users, MessageSquare, Download, Palette, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface HelpSection {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  description: string;
  content: React.ReactNode;
  tags: string[];
}

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const helpSections: HelpSection[] = [
    {
      id: 'reading-manga',
      title: 'How to Read Manga',
      category: 'Reader',
      icon: BookOpen,
      description: 'Learn how to navigate and read manga chapters',
      tags: ['reading', 'navigation', 'chapters', 'pages'],
      content: (
        <div className="space-y-4">
          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertDescription>
              Start reading by selecting any available chapter from the chapters page.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <h4 className="font-semibold">Reading Controls:</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Navigation:</strong> Click on the sides of pages or use arrow keys to move between pages</li>
              <li><strong>Chapter List:</strong> Access the chapter menu to jump to specific chapters</li>
              <li><strong>Zoom:</strong> Double-click on pages to zoom in/out for better reading</li>
              <li><strong>Full Screen:</strong> Press F11 or use the fullscreen button for immersive reading</li>
              <li><strong>Progress:</strong> Your reading progress is automatically saved</li>
            </ul>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h5 className="font-medium mb-2">Pro Tips:</h5>
            <ul className="text-sm space-y-1">
              <li>• Use keyboard shortcuts: Left/Right arrows, Space, or Enter</li>
              <li>• Swipe on mobile devices to turn pages</li>
              <li>• Bookmark important pages for quick access</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'premium-chapters',
      title: 'Unlocking Premium Chapters',
      category: 'Monetization',
      icon: DollarSign,
      description: 'Learn about coins, premium content, and subscriptions',
      tags: ['premium', 'coins', 'subscription', 'unlock', 'payment'],
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Using Coins</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Purchase coin packages from the store</li>
                  <li>• Spend coins to unlock individual chapters</li>
                  <li>• Coins never expire</li>
                  <li>• Get bonus coins with larger packages</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Premium Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Access all premium content</li>
                  <li>• No ads while reading</li>
                  <li>• Early access to new chapters</li>
                  <li>• Priority customer support</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertDescription>
              Premium subscribers get unlimited access to all locked content without spending coins.
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      id: 'theme-switching',
      title: 'Switching Themes',
      category: 'Customization',
      icon: Palette,
      description: 'Customize your reading experience with different themes',
      tags: ['themes', 'appearance', 'customization', 'dark mode'],
      content: (
        <div className="space-y-4">
          <p>Personalize your reading experience by choosing from our collection of themes:</p>
          
          <div className="space-y-3">
            <h4 className="font-semibold">Available Themes:</h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded"></div>
                <div>
                  <div className="font-medium">KODELEX Default</div>
                  <div className="text-sm text-muted-foreground">Warm amber accents on dark background</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded"></div>
                <div>
                  <div className="font-medium">Midnight Professional</div>
                  <div className="text-sm text-muted-foreground">Sophisticated blue accents for professional look</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 bg-gradient-to-r from-red-600 to-red-400 rounded"></div>
                <div>
                  <div className="font-medium">Shiranami Sakura</div>
                  <div className="text-sm text-muted-foreground">Cinematic samurai aesthetic with cherry blossom theme</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h5 className="font-medium mb-2">How to Change Themes:</h5>
            <ol className="list-decimal pl-6 space-y-1 text-sm">
              <li>Look for the theme selector in the navigation or settings</li>
              <li>Preview different themes before applying</li>
              <li>Your theme preference is saved automatically</li>
              <li>Some themes may require premium access</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'admin-dashboard',
      title: 'Admin Dashboard Overview',
      category: 'Admin',
      icon: Settings,
      description: 'Complete guide to managing your manga platform',
      tags: ['admin', 'dashboard', 'management', 'settings'],
      content: (
        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Admin access is required to view and use dashboard features.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-3">
              <h4 className="font-semibold">Dashboard Sections:</h4>
              <ul className="space-y-2">
                <li><strong>Content Management:</strong> Upload and organize manga chapters</li>
                <li><strong>User Management:</strong> Handle user accounts and permissions</li>
                <li><strong>Analytics:</strong> View traffic and engagement statistics</li>
                <li><strong>Monetization:</strong> Configure pricing and premium features</li>
                <li><strong>Site Settings:</strong> Customize appearance and functionality</li>
              </ul>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-3">
              <h4 className="font-semibold">Content Management:</h4>
              <ul className="space-y-2">
                <li>• Upload new manga series and chapters</li>
                <li>• Set chapter pricing and premium status</li>
                <li>• Manage metadata and SEO settings</li>
                <li>• Schedule release dates</li>
              </ul>
            </TabsContent>
            
            <TabsContent value="users" className="space-y-3">
              <h4 className="font-semibold">User Management:</h4>
              <ul className="space-y-2">
                <li>• View user activity and statistics</li>
                <li>• Manage user roles and permissions</li>
                <li>• Handle subscription and payment issues</li>
                <li>• Moderate comments and reports</li>
              </ul>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-3">
              <h4 className="font-semibold">Analytics Dashboard:</h4>
              <ul className="space-y-2">
                <li>• Track daily and monthly active users</li>
                <li>• Monitor chapter read counts</li>
                <li>• View revenue and subscription metrics</li>
                <li>• Analyze user engagement patterns</li>
              </ul>
            </TabsContent>
          </Tabs>
        </div>
      )
    },
    {
      id: 'upload-chapters',
      title: 'Uploading Chapters',
      category: 'Admin',
      icon: Upload,
      description: 'Step-by-step guide to adding new manga content',
      tags: ['upload', 'chapters', 'content', 'admin', 'manga'],
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold">Upload Process:</h4>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Prepare Images:</strong> Ensure images are high quality (at least 1200px width)</li>
              <li><strong>Access Admin Panel:</strong> Navigate to Admin → Content Management</li>
              <li><strong>Create Chapter:</strong> Click "Add New Chapter" or upload to existing series</li>
              <li><strong>Upload Images:</strong> Drag and drop or select image files in order</li>
              <li><strong>Set Metadata:</strong> Add title, description, and chapter number</li>
              <li><strong>Configure Pricing:</strong> Set coin cost or premium status if applicable</li>
              <li><strong>Preview & Publish:</strong> Review the chapter and publish when ready</li>
            </ol>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h5 className="font-medium mb-2">Image Requirements:</h5>
            <ul className="text-sm space-y-1">
              <li>• Supported formats: JPG, PNG, WebP</li>
              <li>• Recommended width: 1200-2000px</li>
              <li>• File size: Under 5MB per image</li>
              <li>• Sequential naming for proper ordering</li>
            </ul>
          </div>

          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              Large uploads may take time. Don't close the browser during upload process.
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      id: 'licensing-system',
      title: 'Licensing System',
      category: 'Licensing',
      icon: Shield,
      description: 'Understanding licenses and domain restrictions',
      tags: ['license', 'domain', 'activation', 'restrictions'],
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Single License</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  <li>• One domain only</li>
                  <li>• Personal/commercial use</li>
                  <li>• 6 months support</li>
                  <li>• Future updates included</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Extended License</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  <li>• Up to 10 domains</li>
                  <li>• Commercial use allowed</li>
                  <li>• 12 months support</li>
                  <li>• Priority updates</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Developer License</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  <li>• Unlimited domains</li>
                  <li>• Resell rights included</li>
                  <li>• Lifetime support</li>
                  <li>• Source code access</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">License Activation:</h4>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Purchase a license from our marketplace</li>
              <li>Receive your unique license key via email</li>
              <li>Enter the key during installation setup</li>
              <li>Domain is automatically registered to your license</li>
            </ol>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Each license key can only be used on the specified number of domains. Contact support for license transfers.
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      id: 'contact-support',
      title: 'Contact Support',
      category: 'Support',
      icon: HelpCircle,
      description: 'How to get help and report issues',
      tags: ['support', 'contact', 'help', 'issues', 'tickets'],
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Before Contacting Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="space-y-1 text-sm">
                  <li>• Check this help documentation first</li>
                  <li>• Search our FAQ section</li>
                  <li>• Try basic troubleshooting steps</li>
                  <li>• Check system requirements</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="space-y-1 text-sm">
                  <li>• Use the contact form on our website</li>
                  <li>• Email: support@kodeleximanga.com</li>
                  <li>• Include your license key in requests</li>
                  <li>• Describe the issue in detail</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h5 className="font-medium mb-2">Response Times:</h5>
            <ul className="text-sm space-y-1">
              <li>• Critical issues: Within 24 hours</li>
              <li>• General questions: 2-3 business days</li>
              <li>• Feature requests: 5-7 business days</li>
              <li>• Premium users get priority support</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Information to Include:</h4>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li>Your license key or purchase details</li>
              <li>Domain where the issue occurs</li>
              <li>Browser and device information</li>
              <li>Screenshots or error messages</li>
              <li>Steps to reproduce the problem</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'installation-setup',
      title: 'Installation & Setup',
      category: 'Setup',
      icon: Download,
      description: 'Complete guide to installing the manga reader platform',
      tags: ['installation', 'setup', 'configuration', 'deployment'],
      content: (
        <div className="space-y-4">
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription>
              This guide assumes basic knowledge of web hosting and domain management.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="requirements" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="installation">Installation</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="requirements" className="space-y-3">
              <h4 className="font-semibold">System Requirements:</h4>
              <ul className="space-y-2">
                <li><strong>Hosting:</strong> Modern web hosting with HTTPS support</li>
                <li><strong>Domain:</strong> Valid domain name (subdomains supported)</li>
                <li><strong>Database:</strong> Supabase account (free tier available)</li>
                <li><strong>License:</strong> Valid purchase license key</li>
              </ul>
            </TabsContent>
            
            <TabsContent value="installation" className="space-y-3">
              <h4 className="font-semibold">Installation Steps:</h4>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Download the platform files from your purchase</li>
                <li>Upload files to your web hosting</li>
                <li>Set up your Supabase database</li>
                <li>Configure environment variables</li>
                <li>Run the setup wizard</li>
                <li>Enter your license key</li>
                <li>Create admin account</li>
              </ol>
            </TabsContent>
            
            <TabsContent value="configuration" className="space-y-3">
              <h4 className="font-semibold">Basic Configuration:</h4>
              <ul className="space-y-2">
                <li>• Set site title and branding</li>
                <li>• Configure payment methods</li>
                <li>• Set up email notifications</li>
                <li>• Configure theme options</li>
                <li>• Test all functionality</li>
              </ul>
            </TabsContent>
          </Tabs>
        </div>
      )
    },
    {
      id: 'manage-categories',
      title: 'Managing Categories & Series',
      category: 'Admin',
      icon: Users,
      description: 'Organize your manga content effectively',
      tags: ['categories', 'series', 'organization', 'metadata'],
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold">Category Management:</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Create genre-based categories (Action, Romance, Fantasy, etc.)</li>
              <li>Set category descriptions and thumbnails</li>
              <li>Assign multiple categories to each series</li>
              <li>Use tags for detailed classification</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Series Organization:</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Create series with detailed metadata</li>
              <li>Set publication status (Ongoing, Completed, Hiatus)</li>
              <li>Add author, artist, and publisher information</li>
              <li>Configure age ratings and content warnings</li>
            </ul>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h5 className="font-medium mb-2">SEO Best Practices:</h5>
            <ul className="text-sm space-y-1">
              <li>• Use descriptive titles and descriptions</li>
              <li>• Add relevant keywords and tags</li>
              <li>• Optimize cover images with alt text</li>
              <li>• Set proper canonical URLs</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'moderate-comments',
      title: 'Comment Moderation',
      category: 'Admin',
      icon: MessageSquare,
      description: 'Manage user comments and community interactions',
      tags: ['comments', 'moderation', 'community', 'reports'],
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Moderation Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  <li>• Review reported comments</li>
                  <li>• Pin important announcements</li>
                  <li>• Delete inappropriate content</li>
                  <li>• Ban problematic users</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Auto-Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  <li>• Set profanity filters</li>
                  <li>• Configure spam detection</li>
                  <li>• Auto-flag suspicious content</li>
                  <li>• Rate limiting for comments</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Comment Guidelines:</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Encourage constructive discussions about manga</li>
              <li>Remove spoilers or mark them appropriately</li>
              <li>Prevent harassment and inappropriate behavior</li>
              <li>Maintain respectful community environment</li>
            </ul>
          </div>

          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              Set clear community guidelines and enforce them consistently to build a positive environment.
            </AlertDescription>
          </Alert>
        </div>
      )
    }
  ];

  const categories = [
    { id: 'all', label: 'All Topics', icon: HelpCircle },
    { id: 'Reader', label: 'Reader', icon: BookOpen },
    { id: 'Admin', label: 'Admin', icon: Settings },
    { id: 'Licensing', label: 'Licensing', icon: Shield },
    { id: 'Monetization', label: 'Monetization', icon: DollarSign },
    { id: 'Customization', label: 'Customization', icon: Palette },
    { id: 'Support', label: 'Support', icon: HelpCircle },
    { id: 'Setup', label: 'Setup', icon: Download }
  ];

  const filteredSections = useMemo(() => {
    let filtered = helpSections;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(section => section.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(section => 
        section.title.toLowerCase().includes(query) ||
        section.description.toLowerCase().includes(query) ||
        section.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Help & Documentation</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about using the manga reader platform
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Help
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search topics, features, guides..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {category.label}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/contact">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Contact Support
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/admin">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
          {/* Results Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {selectedCategory === 'all' ? 'All Topics' : categories.find(c => c.id === selectedCategory)?.label}
              </h2>
              <Badge variant="secondary" className="animate-fade-in">
                {filteredSections.length} {filteredSections.length === 1 ? 'topic' : 'topics'}
              </Badge>
            </div>
            {searchQuery && (
              <p className="text-muted-foreground mt-2 animate-fade-in">
                Showing results for "<span className="text-primary font-medium">{searchQuery}</span>"
              </p>
            )}
          </div>

            {/* Help Sections */}
            {filteredSections.length > 0 ? (
              <div className="space-y-4">
                {filteredSections.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <div 
                      key={section.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Accordion type="single" collapsible>
                        <AccordionItem 
                          value={section.id}
                          className="border rounded-lg transition-all duration-300 hover:shadow-md"
                        >
                          <AccordionTrigger className="px-6 py-4 hover:no-underline">
                            <div className="flex items-start gap-4 text-left">
                              <div className="p-2 bg-primary/10 rounded-lg transition-transform duration-200 group-hover:scale-105">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                  {section.title}
                                </h3>
                                <p className="text-muted-foreground mt-1">{section.description}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {section.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {section.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{section.tags.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-6">
                            <Separator className="mb-4" />
                            {section.content}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or browse different categories
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;