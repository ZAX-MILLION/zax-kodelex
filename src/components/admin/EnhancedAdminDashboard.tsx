import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useAdminDashboard } from '@/contexts/AdminDashboardContext';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { 
  Search, 
  Settings, 
  Users, 
  BookOpen, 
  Upload,
  BarChart3, 
  Shield, 
  Palette, 
  Crown,
  Coins,
  FileText,
  Database,
  CheckSquare,
  Zap,
  Globe,
  Flag,
  Code,
  Lock,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  HardDrive,
  Cloud,
  ChevronDown,
  ChevronRight,
  Layers,
  Monitor,
  Sun,
  Moon,
  Eye,
  Library,
  Wallet,
  ShoppingCart,
  DollarSign,
  Menu,
  X,
  Home
} from 'lucide-react';

interface AdminPanel {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  category: 'analytics' | 'content' | 'users' | 'monetization' | 'system' | 'development';
  premium?: boolean;
  searchKeywords: string[];
  singleModeHidden?: boolean;
  multiModeOnly?: boolean;
}

const adminPanels: AdminPanel[] = [
  // Analytics Hub
  { id: 'overview', name: 'Dashboard Overview', description: 'Main dashboard with stats and quick actions', path: '/admin', icon: <BarChart3 className="h-4 w-4" />, category: 'analytics', searchKeywords: ['dashboard', 'overview', 'stats', 'main'] },
  { id: 'analytics', name: 'Analytics Panel', description: 'View site analytics', path: '/admin/analytics', icon: <TrendingUp className="h-4 w-4" />, category: 'analytics', searchKeywords: ['analytics', 'statistics', 'performance'] },
  { id: 'revenue-analytics', name: 'Revenue Analytics', description: 'Track revenue and earnings', path: '/admin/revenue-analytics', icon: <DollarSign className="h-4 w-4" />, category: 'analytics', searchKeywords: ['revenue', 'earnings', 'money'] },
  { id: 'user-analytics', name: 'User Analytics', description: 'User behavior analytics', path: '/admin/user-analytics', icon: <Eye className="h-4 w-4" />, category: 'analytics', searchKeywords: ['users', 'behavior', 'tracking'] },

  // Content Management
  { id: 'series', name: 'Series Manager', description: 'Manage manga series', path: '/admin/series', icon: <Library className="h-4 w-4" />, category: 'content', searchKeywords: ['series', 'manga', 'content'] },
  { id: 'chapters', name: 'Chapter Manager', description: 'Upload and manage chapters', path: '/admin/chapters', icon: <FileText className="h-4 w-4" />, category: 'content', searchKeywords: ['chapters', 'upload', 'content'] },
  { id: 'upload', name: 'Content Upload', description: 'Upload new content', path: '/admin/upload', icon: <Upload className="h-4 w-4" />, category: 'content', searchKeywords: ['upload', 'content', 'new'] },
  { id: 'uploads', name: 'Uploads Manager', description: 'Manage uploaded files', path: '/admin/uploads', icon: <HardDrive className="h-4 w-4" />, category: 'content', searchKeywords: ['uploads', 'files', 'media'] },

  // User & Community Management
  { id: 'users', name: 'User Manager', description: 'Manage user accounts and roles', path: '/admin/users', icon: <Users className="h-4 w-4" />, category: 'users', searchKeywords: ['users', 'accounts', 'roles'] },
  { id: 'comments', name: 'Comments Manager', description: 'Moderate user comments', path: '/admin/comments', icon: <MessageSquare className="h-4 w-4" />, category: 'users', searchKeywords: ['comments', 'moderation', 'community'] },

  // Revenue & Monetization
  { id: 'subscriptions', name: 'Subscription Manager', description: 'Manage user subscriptions', path: '/admin/subscriptions', icon: <Crown className="h-4 w-4" />, category: 'monetization', searchKeywords: ['subscriptions', 'premium', 'payments'] },
  { id: 'purchases', name: 'Purchases Manager', description: 'View and manage purchases', path: '/admin/purchases', icon: <ShoppingCart className="h-4 w-4" />, category: 'monetization', searchKeywords: ['purchases', 'transactions', 'coins'] },
  { id: 'coin-store', name: 'Coin Store Manager', description: 'Manage coin store settings', path: '/admin/coin-store', icon: <Wallet className="h-4 w-4" />, category: 'monetization', searchKeywords: ['coins', 'store', 'currency'] },
  { id: 'monetization-control', name: 'Monetization Control', description: 'Control monetization features', path: '/admin/monetization-control', icon: <Coins className="h-4 w-4" />, category: 'monetization', searchKeywords: ['monetization', 'paypal', 'payments'] },

  // System & Security
  { id: 'settings', name: 'Site Settings', description: 'Configure site settings', path: '/admin/settings', icon: <Settings className="h-4 w-4" />, category: 'system', searchKeywords: ['settings', 'configuration', 'site'] },
  { id: 'security', name: 'Security Panel', description: 'Security settings and monitoring', path: '/admin/security', icon: <Shield className="h-4 w-4" />, category: 'system', searchKeywords: ['security', 'protection', 'monitoring'] },
  { id: 'security-checklist', name: 'Security Checklist', description: 'Security implementation checklist', path: '/admin/security-checklist', icon: <CheckSquare className="h-4 w-4" />, category: 'system', searchKeywords: ['security', 'checklist', 'compliance'] },
  { id: 'abuse-detection', name: 'Abuse Detection', description: 'Monitor and prevent abuse', path: '/admin/abuse-detection', icon: <AlertTriangle className="h-4 w-4" />, category: 'system', searchKeywords: ['abuse', 'detection', 'monitoring'] },
  { id: 'themes', name: 'Theme Manager', description: 'Manage site themes', path: '/admin/themes', icon: <Palette className="h-4 w-4" />, category: 'system', searchKeywords: ['themes', 'design', 'appearance'] },
  { id: 'seo', name: 'SEO Panel', description: 'Search engine optimization', path: '/admin/seo', icon: <Globe className="h-4 w-4" />, category: 'system', searchKeywords: ['seo', 'search', 'optimization'] },
  { id: 'cloudflare', name: 'Cloudflare Panel', description: 'Cloudflare integration settings', path: '/admin/cloudflare', icon: <Cloud className="h-4 w-4" />, category: 'system', searchKeywords: ['cloudflare', 'cdn', 'performance'] },

  // Development Tools
  { id: 'licenses', name: 'License Management', description: 'Unified license management hub', path: '/admin/licenses', icon: <Lock className="h-4 w-4" />, category: 'development', searchKeywords: ['license', 'activation', 'features', 'themes'] },
  { id: 'developer-tools', name: 'Developer Tools', description: 'Development utilities and settings', path: '/admin/developer-tools', icon: <Code className="h-4 w-4" />, category: 'development', searchKeywords: ['developer', 'tools', 'debug'] },
  { id: 'flags', name: 'Feature Flags', description: 'Toggle feature flags', path: '/admin/flags', icon: <Flag className="h-4 w-4" />, category: 'development', searchKeywords: ['flags', 'features', 'toggle'] },
  { id: 'database', name: 'Database Config', description: 'Database configuration', path: '/admin/database', icon: <Database className="h-4 w-4" />, category: 'development', searchKeywords: ['database', 'config', 'connection'] },
  { id: 'system-checklist', name: 'System Checklist', description: 'System implementation checklist', path: '/admin/system-checklist', icon: <CheckSquare className="h-4 w-4" />, category: 'development', searchKeywords: ['system', 'checklist', 'implementation'] },
  { id: 'production-readiness', name: 'Production Readiness', description: 'Production deployment checklist', path: '/admin/production-readiness', icon: <Zap className="h-4 w-4" />, category: 'development', searchKeywords: ['production', 'deployment', 'readiness'] },
];

const categoryConfig = {
  analytics: { label: 'Analytics Hub', icon: <BarChart3 className="h-4 w-4" />, color: 'text-blue-600' },
  content: { label: 'Content Management', icon: <BookOpen className="h-4 w-4" />, color: 'text-green-600' },
  users: { label: 'User & Community', icon: <Users className="h-4 w-4" />, color: 'text-purple-600' },
  monetization: { label: 'Revenue & Monetization', icon: <Coins className="h-4 w-4" />, color: 'text-yellow-600' },
  system: { label: 'System & Security', icon: <Shield className="h-4 w-4" />, color: 'text-red-600' },
  development: { label: 'Development Tools', icon: <Code className="h-4 w-4" />, color: 'text-gray-600' }
};

export const EnhancedAdminDashboard = ({ children }: { children: React.ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['analytics', 'content']));
  const [licenseStatus, setLicenseStatus] = useState<string>('Checking...');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { theme, setTheme, mangaMode, setMangaMode, customThemeColor, setCustomThemeColor, isCompactMode, setIsCompactMode } = useAdminDashboard();
  const { isEnabled: devModeEnabled, settings: devSettings } = useDeveloperMode();

  useEffect(() => {
    checkLicenseStatus();
  }, [devModeEnabled, devSettings]);

  const checkLicenseStatus = async () => {
    try {
      if (devModeEnabled) {
        setLicenseStatus('Developer Mode - All Features Unlocked');
        return;
      }
      setLicenseStatus('Development Mode');
    } catch (error) {
      setLicenseStatus('Development Mode');
    }
  };

  // Listen for license changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'enhanced_licenses' || e.key === 'theme_licenses' || e.key === 'developer_mode_settings') {
        checkLicenseStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Re-check every 5 seconds to catch any changes
  useEffect(() => {
    const interval = setInterval(checkLicenseStatus, 5000);
    return () => clearInterval(interval);
  }, [devModeEnabled, devSettings]);

  const filteredPanels = useMemo(() => {
    let panels = adminPanels;
    
    // Filter by manga mode
    if (mangaMode === 'single') {
      panels = panels.filter(panel => !panel.singleModeHidden);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      panels = panels.filter(panel => 
        panel.name.toLowerCase().includes(query) ||
        panel.description.toLowerCase().includes(query) ||
        panel.searchKeywords.some(keyword => keyword.includes(query))
      );
    }
    
    return panels;
  }, [searchQuery, mangaMode]);

  const groupedPanels = useMemo(() => {
    return filteredPanels.reduce((acc, panel) => {
      if (!acc[panel.category]) acc[panel.category] = [];
      acc[panel.category].push(panel);
      return acc;
    }, {} as Record<string, AdminPanel[]>);
  }, [filteredPanels]);

  const categoryOrder = ['analytics', 'content', 'users', 'monetization', 'system', 'development'];

  const isCurrentPath = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'white': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      case 'custom': return <Palette className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="border-b bg-card/50 sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 md:h-16 items-center justify-between px-4">
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="p-2 hover:bg-accent/50 transition-all duration-300"
              >
                <Link to="/" className="flex items-center justify-center">
                  <Home className="h-8 w-8 text-primary hover:text-primary/80 drop-shadow-lg hover:drop-shadow-xl transition-all duration-300" />
                </Link>
              </Button>
              <h1 className="text-lg md:text-xl font-bold">Admin Dashboard</h1>
            </div>
          </div>
          
          {/* Mobile Controls */}
          <div className="flex items-center gap-2">
            {/* Search - Hidden on mobile, shown in sidebar */}
            <div className="relative w-48 lg:w-64 hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search panels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8"
              />
            </div>

            {/* Theme Toggle - Simple light/dark */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'white' : 'dark')}
            >
              {getThemeIcon()}
            </Button>
          </div>
        </div>

        {/* Mobile Mode Toggle */}
        <div className="flex items-center justify-center gap-2 p-2 border-t md:hidden">
          <Button
            variant={mangaMode === 'single' ? "default" : "ghost"}
            size="sm"
            onClick={() => setMangaMode('single')}
            className="h-8 px-4 text-xs flex-1"
          >
            Single Manga
          </Button>
          <Button
            variant={mangaMode === 'multi' ? "default" : "ghost"}
            size="sm"
            onClick={() => setMangaMode('multi')}
            className="h-8 px-4 text-xs flex-1"
          >
            Multi Manga
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Enhanced Sidebar */}
        <div className="w-72 border-r bg-card/30">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-4 space-y-3">
              {/* Search Results or Grouped Panels */}
              {searchQuery ? (
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground px-2 py-1">
                    Search Results ({filteredPanels.length})
                  </h3>
                  {filteredPanels.map((panel) => (
                    <Button
                      key={panel.id}
                      asChild
                      variant={isCurrentPath(panel.path) ? "default" : "ghost"}
                      className="w-full justify-start h-9 px-3 text-sm"
                    >
                      <Link to={panel.path}>
                        {panel.icon}
                        <span className="ml-2 truncate">{panel.name}</span>
                        {panel.premium && <Crown className="h-3 w-3 ml-auto text-yellow-500" />}
                      </Link>
                    </Button>
                  ))}
                </div>
              ) : (
                categoryOrder.map(category => {
                  const panels = groupedPanels[category];
                  if (!panels?.length) return null;
                  
                  const config = categoryConfig[category];
                  const isExpanded = expandedCategories.has(category);
                  
                  return (
                    <Collapsible key={category} open={isExpanded}>
                      <CollapsibleTrigger 
                        onClick={() => toggleCategory(category)}
                        className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className={config.color}>
                            {config.icon}
                          </div>
                          <span className="text-sm font-medium">{config.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {panels.length}
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="space-y-1 mt-1 ml-6">
                        {panels.map((panel) => (
                          <Button
                            key={panel.id}
                            asChild
                            variant={isCurrentPath(panel.path) ? "default" : "ghost"}
                            className="w-full justify-start h-8 px-3 text-xs"
                          >
                            <Link to={panel.path}>
                              {panel.icon}
                              <span className="ml-2 truncate">{panel.name}</span>
                              {panel.premium && <Crown className="h-3 w-3 ml-auto text-yellow-500" />}
                            </Link>
                          </Button>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-6">
              {children}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};