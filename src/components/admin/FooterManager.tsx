import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2, ExternalLink, Github, Twitter, Mail, Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FooterLink {
  id: string;
  label: string;
  url: string;
  isExternal: boolean;
}

interface FooterSection {
  id: string;
  title: string;
  icon?: string;
  links: FooterLink[];
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

interface FooterSettings {
  brandName: string;
  brandDescription: string;
  sections: FooterSection[];
  socialLinks: SocialLink[];
  copyrightText: string;
  version: string;
  compactMode: boolean;
}

const defaultFooterSettings: FooterSettings = {
  brandName: 'Zax Million',
  brandDescription: 'Premium manga reading platform with high-quality translations and an amazing community.',
  sections: [
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'HelpCircle',
      links: [
        { id: '1', label: 'Documentation', url: '/help', isExternal: false },
        { id: '2', label: 'Reading Guide', url: '/help/reading-guide', isExternal: false },
        { id: '3', label: 'Troubleshooting', url: '/help/troubleshooting', isExternal: false },
        { id: '4', label: 'Contact Support', url: '/contact', isExternal: false },
      ]
    },
    {
      id: 'community',
      title: 'Community',
      icon: 'Users',
      links: [
        { id: '5', label: 'Discord Server', url: 'https://discord.gg/zaxmillion', isExternal: true },
        { id: '6', label: 'Forums', url: '/community', isExternal: false },
        { id: '7', label: 'Support Us', url: '/support', isExternal: false },
        { id: '8', label: 'Ko-fi', url: 'https://ko-fi.com/zaxmi', isExternal: true },
        { id: '9', label: 'Send Feedback', url: '/feedback', isExternal: false },
      ]
    },
    {
      id: 'legal',
      title: 'Legal',
      icon: 'Shield',
      links: [
        { id: '10', label: 'Privacy Policy', url: '/privacy', isExternal: false },
        { id: '11', label: 'Terms of Service', url: '/terms', isExternal: false },
        { id: '12', label: 'Cookie Policy', url: '/cookies', isExternal: false },
        { id: '13', label: 'DMCA Policy', url: '/dmca', isExternal: false },
        { id: '14', label: 'Disclaimer', url: '/disclaimer', isExternal: false },
        { id: '15', label: 'Acceptable Use', url: '/acceptable-use', isExternal: false },
      ]
    }
  ],
  socialLinks: [
    { id: '1', platform: 'GitHub', url: 'https://github.com/zaxmillion', icon: 'Github' },
    { id: '2', platform: 'Twitter', url: 'https://twitter.com/zaxmillion', icon: 'Twitter' },
    { id: '3', platform: 'Email', url: 'mailto:ZAXMIllion@proton.me', icon: 'Mail' },
  ],
  copyrightText: 'All rights reserved.',
  version: 'v1.0.0',
  compactMode: true
};

export const FooterManager = () => {
  const [settings, setSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [editingSection, setEditingSection] = useState<FooterSection | null>(null);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const { toast } = useToast();

  const handleSaveSettings = () => {
    // In a real app, this would save to database
    localStorage.setItem('footerSettings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Footer settings have been updated successfully.",
    });
  };

  const handleLoadSettings = () => {
    const saved = localStorage.getItem('footerSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  useEffect(() => {
    handleLoadSettings();
  }, []);

  const addSection = () => {
    const newSection: FooterSection = {
      id: Date.now().toString(),
      title: 'New Section',
      links: []
    };
    setSettings(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const updateSection = (sectionId: string, updates: Partial<FooterSection>) => {
    setSettings(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const deleteSection = (sectionId: string) => {
    setSettings(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  const addLink = (sectionId: string) => {
    const newLink: FooterLink = {
      id: Date.now().toString(),
      label: 'New Link',
      url: '#',
      isExternal: false
    };
    
    setSettings(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, links: [...section.links, newLink] }
          : section
      )
    }));
  };

  const updateLink = (sectionId: string, linkId: string, updates: Partial<FooterLink>) => {
    setSettings(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              links: section.links.map(link =>
                link.id === linkId ? { ...link, ...updates } : link
              )
            }
          : section
      )
    }));
  };

  const deleteLink = (sectionId: string, linkId: string) => {
    setSettings(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, links: section.links.filter(link => link.id !== linkId) }
          : section
      )
    }));
  };

  const addSocialLink = () => {
    const newSocial: SocialLink = {
      id: Date.now().toString(),
      platform: 'Website',
      url: 'https://',
      icon: 'Globe'
    };
    setSettings(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, newSocial]
    }));
  };

  const updateSocialLink = (socialId: string, updates: Partial<SocialLink>) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(social =>
        social.id === socialId ? { ...social, ...updates } : social
      )
    }));
  };

  const deleteSocialLink = (socialId: string) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter(social => social.id !== socialId)
    }));
  };

  const socialIcons = {
    Github: <Github className="h-4 w-4" />,
    Twitter: <Twitter className="h-4 w-4" />,
    Mail: <Mail className="h-4 w-4" />,
    Globe: <Globe className="h-4 w-4" />
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Footer Manager</h1>
          <p className="text-muted-foreground">
            Customize your website footer content and appearance
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleLoadSettings} variant="outline">
            Reset to Saved
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Information</CardTitle>
              <CardDescription>
                Configure your brand name and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    value={settings.brandName}
                    onChange={(e) => setSettings(prev => ({ ...prev, brandName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={settings.version}
                    onChange={(e) => setSettings(prev => ({ ...prev, version: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="brandDescription">Brand Description</Label>
                <Textarea
                  id="brandDescription"
                  value={settings.brandDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, brandDescription: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="copyright">Copyright Text</Label>
                <Input
                  id="copyright"
                  value={settings.copyrightText}
                  onChange={(e) => setSettings(prev => ({ ...prev, copyrightText: e.target.value }))}
                  placeholder="All rights reserved."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="compactMode"
                  checked={settings.compactMode}
                  onChange={(e) => setSettings(prev => ({ ...prev, compactMode: e.target.checked }))}
                />
                <Label htmlFor="compactMode">Compact Mode (smaller padding and text)</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Footer Sections</h3>
            <Button onClick={addSection}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>

          <div className="grid gap-4">
            {settings.sections.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Input
                        value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        className="font-semibold"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addLink(section.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSection(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.links.map((link) => (
                      <div key={link.id} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                          <Input
                            placeholder="Link Label"
                            value={link.label}
                            onChange={(e) => updateLink(section.id, link.id, { label: e.target.value })}
                          />
                          <Input
                            placeholder="URL"
                            value={link.url}
                            onChange={(e) => updateLink(section.id, link.id, { url: e.target.value })}
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={link.isExternal}
                              onChange={(e) => updateLink(section.id, link.id, { isExternal: e.target.checked })}
                            />
                            <Label className="text-xs">External</Label>
                            {link.isExternal && <ExternalLink className="h-3 w-3" />}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteLink(section.id, link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Social Media Links</h3>
            <Button onClick={addSocialLink}>
              <Plus className="h-4 w-4 mr-2" />
              Add Social Link
            </Button>
          </div>

          <div className="grid gap-4">
            {settings.socialLinks.map((social) => (
              <Card key={social.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {socialIcons[social.icon as keyof typeof socialIcons]}
                      <Select
                        value={social.icon}
                        onValueChange={(value) => updateSocialLink(social.id, { icon: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Github">GitHub</SelectItem>
                          <SelectItem value="Twitter">Twitter</SelectItem>
                          <SelectItem value="Mail">Email</SelectItem>
                          <SelectItem value="Globe">Website</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        placeholder="Platform Name"
                        value={social.platform}
                        onChange={(e) => updateSocialLink(social.id, { platform: e.target.value })}
                      />
                      <Input
                        placeholder="URL"
                        value={social.url}
                        onChange={(e) => updateSocialLink(social.id, { url: e.target.value })}
                      />
                    </div>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteSocialLink(social.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Footer Preview</CardTitle>
              <CardDescription>
                Preview how your footer will look on the website
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Footer Preview */}
              <div className={`bg-card border rounded-lg ${settings.compactMode ? 'p-6' : 'p-8'}`}>
                <div className={`grid grid-cols-1 md:grid-cols-${Math.min(settings.sections.length + 1, 4)} gap-6 mb-6`}>
                  {/* Brand Section */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded bg-primary" />
                      <span className="font-bold text-lg">{settings.brandName}</span>
                    </div>
                    <p className={`text-muted-foreground leading-relaxed ${settings.compactMode ? 'text-sm' : ''}`}>
                      {settings.brandDescription}
                    </p>
                  </div>

                  {/* Dynamic Sections */}
                  {settings.sections.map((section) => (
                    <div key={section.id}>
                      <h3 className={`font-semibold mb-3 ${settings.compactMode ? 'text-sm' : ''}`}>
                        {section.title}
                      </h3>
                      <div className="space-y-2">
                        {section.links.map((link) => (
                          <div key={link.id} className={`text-muted-foreground hover:text-primary transition-colors ${settings.compactMode ? 'text-sm' : ''}`}>
                            {link.label} {link.isExternal && <ExternalLink className="h-3 w-3 inline ml-1" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                {/* Bottom Section */}
                <div className={`flex flex-col md:flex-row items-center justify-between gap-4 ${settings.compactMode ? 'text-sm' : ''}`}>
                  <div className="text-muted-foreground">
                    © {new Date().getFullYear()} {settings.brandName}. {settings.copyrightText}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {settings.socialLinks.map((social) => (
                      <div key={social.id} className="text-muted-foreground hover:text-primary transition-colors">
                        {socialIcons[social.icon as keyof typeof socialIcons]}
                      </div>
                    ))}
                  </div>

                  <div className="text-muted-foreground">
                    {settings.version}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};