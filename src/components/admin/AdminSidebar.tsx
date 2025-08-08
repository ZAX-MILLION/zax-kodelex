import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  Settings,
  Palette,
  Upload,
  Gauge,
  MessageSquare,
  Download,
  CheckCircle,
  Code2,
  TrendingUp,
  UserCheck,
  FileSearch,
  Database,
  Cloud,
  Rocket,
  Gavel,
  Paintbrush,
  Zap,
  PieChart,
  FolderUp,
  Layers,
  Search,
  Trash2,
  Coins,
  DollarSign,
  CreditCard,
  ShoppingCart,
  Target,
  Lock,
  Shield,
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

// 1. Dashboard & Analytics
const dashboardMenuItems = [
  { title: "Dashboard Overview", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "User Analytics", url: "/admin/user-analytics", icon: Users },
  { title: "Revenue Analytics", url: "/admin/revenue-analytics", icon: TrendingUp },
  { title: "Series & Chapter Analytics", url: "/admin/series-analytics", icon: PieChart },
  { title: "Site Performance", url: "/admin/performance", icon: Gauge },
];

// 2. Content & Community
const contentMenuItems = [
  { title: "Series Manager", url: "/admin/series", icon: BookOpen },
  { title: "Chapter Manager", url: "/admin/chapters", icon: FileText },
  { title: "Content Upload", url: "/admin/upload", icon: Upload },
  { title: "Uploads Manager", url: "/admin/uploads", icon: FolderUp },
  { title: "Comments Manager", url: "/admin/comments", icon: MessageSquare },
  { title: "User Manager", url: "/admin/users", icon: Users },
  { title: "Role Manager", url: "/admin/roles", icon: UserCheck },
];

// 3. Monetization & Store
const monetizationMenuItems = [
  { title: "Monetization Dashboard", url: "/admin/monetization-control", icon: DollarSign },
  { title: "Coin Manager", url: "/admin/coins", icon: Coins },
  { title: "Coin Pricing", url: "/admin/coin-pricing", icon: Target },
  { title: "PayPal Settings", url: "/admin/paypal-secrets", icon: CreditCard },
  { title: "Purchases & Orders", url: "/admin/purchases", icon: ShoppingCart },
  { title: "Chapter Unlock Settings", url: "/admin/chapter-unlock", icon: Lock },
  { title: "Usage Limits", url: "/admin/usage-limits", icon: Shield },
];

// 4. System & Settings
const systemMenuItems = [
  { title: "Site Settings", url: "/admin/settings", icon: Settings },
  { title: "Theme Manager", url: "/admin/themes", icon: Palette },
  { title: "Theme Customizer", url: "/admin/theme-customizer", icon: Paintbrush },
  { title: "Footer Manager", url: "/admin/footer-manager", icon: Layers },
  { title: "Legal Pages", url: "/admin/legal-pages", icon: Gavel },
  { title: "Install Wizard", url: "/admin/install-wizard", icon: Zap },
  { title: "System Checklist", url: "/admin/system-checklist", icon: CheckCircle },
  { title: "Production Readiness", url: "/admin/production-readiness", icon: Rocket },
];

// 5. Dev Tools & Maintenance
const devToolsMenuItems = [
  { title: "Developer Tools", url: "/admin/developer-tools", icon: Code2 },
  { title: "MySQL Export", url: "/admin/export", icon: Download },
  { title: "System Changelog", url: "/admin/changelog", icon: FileSearch },
  { title: "Changelog Manager", url: "/admin/changelog-manager", icon: FileText },
  { title: "Placeholder Detector", url: "/admin/cleanup", icon: Search },
  { title: "Manga Seeder", url: "/admin/manga-data-seeder", icon: Database },
  { title: "Phase 6 Database Cleanup", url: "/admin/phase6-cleanup", icon: Trash2 },
  { title: "Cloudflare Panel", url: "/admin/cloudflare", icon: Cloud },
];

export const AdminSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string, exact?: boolean) => {
    const active = isActive(path, exact);
    return active 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";
  };

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-card border-r border-border">
        {/* Logo/Brand Section */}
        <div className="p-4 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">Manga Admin</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* 1. Dashboard & Analytics */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Dashboard & Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.exact}
                      className={getNavClasses(item.url, item.exact)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 2. Content & Community */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Content & Community
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 3. Monetization & Store */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Monetization & Store
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {monetizationMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 4. System & Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            System & Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 5. Dev Tools & Maintenance */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Dev Tools & Maintenance
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {devToolsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};