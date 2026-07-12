import { 
  Home, 
  BookOpen, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  Upload, 
  Bell,
  PenTool
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const authorNavItems = [
  { title: 'Dashboard', url: '/author/dashboard', icon: Home },
  { title: 'My Series', url: '/author/series', icon: BookOpen },
  { title: 'Chapters', url: '/author/chapters', icon: FileText },
  { title: 'Analytics', url: '/author/analytics', icon: BarChart3 },
  { title: 'Comments', url: '/author/comments', icon: MessageSquare },
  { title: 'Upload', url: '/author/upload', icon: Upload },
  { title: 'Notifications', url: '/author/notifications', icon: Bell },
];

export const AuthorSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50 text-sidebar-foreground';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            <span>Author Dashboard</span>
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {authorNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
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