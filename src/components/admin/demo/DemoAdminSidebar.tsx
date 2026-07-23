import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Clock3, FlaskConical, LogOut } from 'lucide-react';
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
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { DEMO_ADMIN_NAV_GROUPS, isDemoNavItemActivePath } from '@/features/admin/demoAdminNav';
import { useDemoRole } from '@/contexts/DemoRoleContext';
import type { AdminNavItem } from '@/features/admin/adminNav';

export function DemoAdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { resetDemo } = useDemoRole();
  const collapsed = state === 'collapsed';
  const currentPath = location.pathname;

  const handleItemClick = (item: AdminNavItem) => {
    if (item.action === 'logout') {
      resetDemo();
      navigate('/demo', { replace: true });
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        <div className="border-b border-sidebar-border p-4">
          {!collapsed ? (
            <Link to="/demo/admin" className="flex items-center gap-3" aria-label="Demo admin dashboard home">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500">
                <FlaskConical className="h-5 w-5 text-white" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight text-sidebar-foreground">Zax Million</p>
                <p className="text-xs text-sidebar-foreground/60">Admin (demo)</p>
              </div>
            </Link>
          ) : (
            <Link
              to="/demo/admin"
              aria-label="Demo admin dashboard home"
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500"
            >
              <FlaskConical className="h-5 w-5 text-white" aria-hidden />
            </Link>
          )}
        </div>

        <nav aria-label="Demo admin sections" className="flex-1 overflow-y-auto py-2">
          {DEMO_ADMIN_NAV_GROUPS.map((group) => (
            <SidebarGroup key={group.id}>
              {!collapsed && (
                <SidebarGroupLabel className="px-4 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    if (item.status === 'coming-soon') {
                      return (
                        <SidebarMenuItem key={item.id}>
                          <div
                            className="mx-2 flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-sidebar-foreground/40"
                            aria-disabled="true"
                            title={`${item.title} — not part of the lightweight demo`}
                          >
                            <Icon className="h-4 w-4 shrink-0" aria-hidden />
                            {!collapsed && (
                              <>
                                <span className="flex-1 truncate">{item.title}</span>
                                <Badge
                                  variant="outline"
                                  className="gap-1 border-sidebar-border text-[10px] text-sidebar-foreground/50"
                                >
                                  <Clock3 className="h-3 w-3" aria-hidden />
                                  Soon
                                </Badge>
                              </>
                            )}
                          </div>
                        </SidebarMenuItem>
                      );
                    }

                    if (item.action === 'logout') {
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton asChild>
                            <button
                              type="button"
                              onClick={() => handleItemClick(item)}
                              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                              {!collapsed && <span>Exit demo</span>}
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }

                    const active = item.url ? isDemoNavItemActivePath(item.url, currentPath) : false;

                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild isActive={active}>
                          <Link
                            to={item.url!}
                            className={
                              active
                                ? 'flex items-center gap-3 rounded-lg bg-sidebar-accent px-2 py-2 text-sm font-medium text-sidebar-accent-foreground'
                                : 'flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            }
                          >
                            <Icon className="h-4 w-4 shrink-0" aria-hidden />
                            {!collapsed && <span className="truncate">{item.title}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
