import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  Settings,
  Upload,
  Gauge,
  MessageSquare,
  TrendingUp,
  UserCheck,
  Database,
  Cloud,
  Coins,
  DollarSign,
  CreditCard,
  ShoppingCart,
  Target,
  Lock,
  Shield,
  Palette,
  Gavel,
  Layers,
  Zap,
  Rocket,
  CheckCircle,
  Code2,
  Download,
  FileSearch,
  Search,
  Trash2,
  FolderUp,
  ChevronDown,
  ChevronRight,
  Home,
  Menu,
  X
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Menu item interfaces
interface MenuItem {
  title: string;
  url: string;
  icon: any;
  exact?: boolean;
  badge?: string;
}

interface MenuSection {
  label: string;
  icon: any;
  items: MenuItem[];
  color: string;
}

type ExtendedMenuItem = MenuItem & { section: string };

// Modern organized menu structure
const menuSections: MenuSection[] = [
  {
    label: "Dashboard & Analytics",
    icon: LayoutDashboard,
    color: "text-blue-400",
    items: [
      { title: "Overview", url: "/admin", icon: LayoutDashboard, exact: true },
      { title: "User Analytics", url: "/admin/user-analytics", icon: Users },
      { title: "Revenue Analytics", url: "/admin/revenue-analytics", icon: TrendingUp },
      { title: "Series Analytics", url: "/admin/series-analytics", icon: BookOpen },
      { title: "Performance", url: "/admin/performance", icon: Gauge },
    ]
  },
  {
    label: "Content Management",
    icon: BookOpen,
    color: "text-green-400",
    items: [
      { title: "Series Manager", url: "/admin/series", icon: BookOpen },
      { title: "Chapter Manager", url: "/admin/chapters", icon: FileText },
      { title: "Content Upload", url: "/admin/upload", icon: Upload },
      { title: "Uploads Manager", url: "/admin/uploads", icon: FolderUp },
      { title: "Media Manager", url: "/admin/media", icon: Layers },
      { title: "Comments", url: "/admin/comments", icon: MessageSquare },
      { title: "Blog Manager", url: "/admin/blog", icon: FileText },
    ]
  },
  {
    label: "User & Community",
    icon: Users,
    color: "text-purple-400",
    items: [
      { title: "User Manager", url: "/admin/users", icon: Users },
      { title: "Role Manager", url: "/admin/roles", icon: UserCheck },
    ]
  },
  {
    label: "Monetization",
    icon: Coins,
    color: "text-yellow-400",
    items: [
      { title: "Monetization Control", url: "/admin/monetization-control", icon: DollarSign },
      { title: "Coin Manager", url: "/admin/coins", icon: Coins },
      { title: "Coin Pricing", url: "/admin/coin-pricing", icon: Target },
      { title: "PayPal Settings", url: "/admin/paypal-secrets", icon: CreditCard },
      { title: "Purchases", url: "/admin/purchases", icon: ShoppingCart },
      { title: "User Economy", url: "/admin/user-economy", icon: Users },
      { title: "Chapter Unlock", url: "/admin/chapter-unlock", icon: Lock },
      { title: "Usage Limits", url: "/admin/usage-limits", icon: Shield },
    ]
  },
  {
    label: "System & Settings",
    icon: Settings,
    color: "text-red-400",
    items: [
      { title: "Site Settings", url: "/admin/settings", icon: Settings },
      { title: "Theme Manager", url: "/admin/themes", icon: Palette },
      { title: "Theme Customizer", url: "/admin/theme-customizer", icon: Palette },
      { title: "Footer Manager", url: "/admin/footer-manager", icon: Layers },
      { title: "Legal Pages", url: "/admin/legal-pages", icon: Gavel },
      { title: "Install Wizard", url: "/admin/install-wizard", icon: Zap },
      { title: "System Checklist", url: "/admin/system-checklist", icon: CheckCircle },
      { title: "Production Readiness", url: "/admin/production-readiness", icon: Rocket },
    ]
  },
  {
    label: "Developer Tools",
    icon: Code2,
    color: "text-cyan-400",
    items: [
      { title: "Developer Tools", url: "/admin/developer-tools", icon: Code2 },
      { title: "Database Export", url: "/admin/export", icon: Download },
      { title: "System Changelog", url: "/admin/changelog", icon: FileSearch },
      { title: "Changelog Manager", url: "/admin/changelog-manager", icon: FileText },
      { title: "Cleanup Tools", url: "/admin/cleanup", icon: Search },
      { title: "Data Seeder", url: "/admin/manga-data-seeder", icon: Database },
      { title: "Phase 6 Cleanup", url: "/admin/phase6-cleanup", icon: Trash2 },
      { title: "Comprehensive Reset", url: "/admin/comprehensive-reset", icon: Trash2 },
      { title: "Curated Reset", url: "/admin/curated-reset", icon: Trash2 },
      { title: "Cloudflare Panel", url: "/admin/cloudflare", icon: Cloud },
    ]
  }
];

export const ModernAdminSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const [searchQuery, setSearchQuery] = useState("");
  const getBestSectionForPath = (path: string) => {
    // Choose the most specific matching item across all sections
    let best: { section: string; url: string } | null = null;
    menuSections.forEach(sec => {
      sec.items.forEach(it => {
        const match = it.exact ? path === it.url : path.startsWith(it.url);
        if (match) {
          if (!best || it.url.length > best.url.length) {
            best = { section: sec.label, url: it.url };
          }
        }
      });
    });
    return best?.section ?? "Dashboard & Analytics";
  };
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([getBestSectionForPath(currentPath)]));
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const navigate = useNavigate();
  const allMenuItems: ExtendedMenuItem[] = menuSections.flatMap(section =>
    section.items.map(item => ({ ...item, section: section.label }))
  );
  const suggestions = searchQuery
    ? allMenuItems.filter(i =>
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.section.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  // Sync expanded section with current route and keep only one open
  useEffect(() => {
    setExpandedSections(new Set([getBestSectionForPath(currentPath)]));
  }, [currentPath]);

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string, exact?: boolean) => {
    const active = isActive(path, exact);
    return active 
      ? "bg-gradient-to-r from-primary/20 to-transparent border-r-2 border-primary text-primary font-medium" 
      : "text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200";
  };

  const toggleSection = (sectionLabel: string) => {
    // Accordion behavior: keep only one section open
    if (expandedSections.has(sectionLabel)) {
      setExpandedSections(new Set());
    } else {
      setExpandedSections(new Set([sectionLabel]));
    }
  };

  const filteredSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <Sidebar
      className="transition-all duration-300 border-r-0"
      collapsible="icon"
    >
      <SidebarContent className="bg-slate-950/90 backdrop-blur-xl border-r border-slate-800/50">

        {/* Logo/Brand Section */}
        <div className="p-4 border-b border-slate-800/50">
          {!collapsed ? (
            <Link to="/" className="flex items-center gap-3 group" aria-label="Go to homepage">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-orange-500 rounded-xl flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-white group-hover:text-primary transition-colors">Zax Million</span>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </Link>
          ) : (
            <Link to="/" aria-label="Go to homepage" className="w-10 h-10 bg-gradient-to-r from-primary to-orange-500 rounded-xl flex items-center justify-center mx-auto">
              <Home className="h-6 w-6 text-white" />
            </Link>
          )}
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="p-4 border-b border-slate-800/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search admin features..."
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={(e) => {
                  if (!suggestions.length) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightedIndex((i) => (i + 1) % suggestions.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const s = suggestions[highlightedIndex];
                    if (s) {
                      navigate(s.url);
                      setShowSuggestions(false);
                    }
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                className="pl-9 h-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-primary"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-md border border-slate-700 bg-slate-900 shadow-xl">
                  <ul className="max-h-64 overflow-auto py-1">
                    {suggestions.map((s, idx) => {
                      const ItemIcon = s.icon;
                      const active = idx === highlightedIndex;
                      return (
                        <li key={`${s.section}-${s.title}`}>
                          <NavLink
                            to={s.url}
                            className={`flex items-center gap-2 px-3 py-2 text-sm ${active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'}`}
                            onClick={() => setShowSuggestions(false)}
                          >
                            <ItemIcon className="h-4 w-4" />
                            <span className="truncate">{s.title}</span>
                            <span className="ml-auto text-xs text-slate-400">{s.section}</span>
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 px-2">
          <div className="py-4 space-y-2">
            {filteredSections.map((section) => {
              const isExpanded = expandedSections.has(section.label);
              const IconComponent = section.icon;
              
              return (
                <div key={section.label}>
                  {!collapsed ? (
                    <Collapsible open={isExpanded}>
                      <CollapsibleTrigger
                        onClick={() => toggleSection(section.label)}
                        className="flex items-center justify-between w-full p-3 rounded-lg text-left hover:bg-slate-800/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className={`h-5 w-5 ${section.color}`} />
                          <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                            {section.label}
                          </span>
                          <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                            {section.items.length}
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="ml-8 mt-1 space-y-1">
                        {section.items.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <SidebarMenuButton key={item.title} asChild>
                              <NavLink 
                                to={item.url} 
                                end={item.exact}
                                className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-all duration-200 ${getNavClasses(item.url, item.exact)}`}
                              >
                                <ItemIcon className="h-4 w-4" />
                                <span>{item.title}</span>
                                {item.badge && (
                                  <Badge variant="outline" className="text-xs ml-auto">
                                    {item.badge}
                                  </Badge>
                                )}
                              </NavLink>
                            </SidebarMenuButton>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    // Collapsed view - show icons only with tooltips
                    <div className="space-y-2">
                      {section.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <SidebarMenuButton key={item.title} asChild>
                            <NavLink 
                              to={item.url} 
                              end={item.exact}
                              className={`flex items-center justify-center w-12 h-12 mx-auto rounded-lg transition-all duration-200 ${getNavClasses(item.url, item.exact)}`}
                              title={item.title}
                            >
                              <ItemIcon className="h-5 w-5" />
                            </NavLink>
                          </SidebarMenuButton>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
};