import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  BookOpen,
  Coins,
  ExternalLink,
  FileText,
  Gauge,
  Globe2,
  LayoutDashboard,
  LayoutGrid,
  Lock,
  LogOut,
  MessageSquare,
  Palette,
  Plug,
  ShieldCheck,
  Sliders,
  Star,
  UserCog,
  Users,
  UsersRound,
  Wallpaper,
  Wrench,
} from 'lucide-react';

export type AdminNavItemStatus = 'active' | 'coming-soon';

export interface AdminNavItem {
  id: string;
  title: string;
  /** Route path (may include a hash for an in-page section anchor). Omitted for action items. */
  url?: string;
  icon: LucideIcon;
  status: AdminNavItemStatus;
  /** Marks this item as a same-page anchor rather than a distinct screen. */
  isAnchor?: boolean;
  /** Marks this item as triggering an action (e.g. Logout) instead of navigating. */
  action?: 'logout';
  description?: string;
}

export interface AdminNavGroup {
  id: string;
  label: string;
  items: AdminNavItem[];
}

/**
 * Single source of truth for the admin sidebar. Every `active` item must map
 * to a route that is actually registered in `src/pages/Admin.tsx` (or, for
 * anchors, a section that exists on that route's page). Items without a
 * matching route are kept visible with `status: 'coming-soon'` so the
 * information architecture from the product spec stays intact without
 * linking anywhere unsupported.
 */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'dashboard-home', title: 'Dashboard Home', url: '/admin', icon: LayoutDashboard, status: 'active' },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    items: [
      { id: 'series', title: 'Series', url: '/admin/series', icon: BookOpen, status: 'active' },
      { id: 'chapters', title: 'Chapters', url: '/admin/chapters', icon: FileText, status: 'active' },
      { id: 'comments', title: 'Comments', url: '/admin/comments', icon: MessageSquare, status: 'active' },
      { id: 'reviews', title: 'Reviews', icon: Star, status: 'coming-soon' },
    ],
  },
  {
    id: 'design',
    label: 'Design',
    items: [
      { id: 'series-designs', title: 'Series Designs', url: '/admin/series-design', icon: LayoutGrid, status: 'active' },
      {
        id: 'appearance',
        title: 'Appearance',
        url: '/admin/series-design#appearance',
        icon: Palette,
        status: 'active',
        isAnchor: true,
      },
      {
        id: 'backgrounds',
        title: 'Backgrounds',
        url: '/admin/series-design#backgrounds',
        icon: Wallpaper,
        status: 'active',
        isAnchor: true,
      },
      { id: 'reader-settings', title: 'Reader Settings', icon: Sliders, status: 'coming-soon' },
    ],
  },
  {
    id: 'monetization',
    label: 'Monetization',
    items: [
      { id: 'memberships', title: 'Memberships', icon: BadgeCheck, status: 'coming-soon' },
      { id: 'chapter-access', title: 'Chapter Access', url: '/admin/chapter-unlock', icon: Lock, status: 'active' },
      { id: 'payments', title: 'Payments', url: '/admin/purchases', icon: Coins, status: 'active' },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    items: [
      { id: 'members', title: 'Members', url: '/admin/users', icon: Users, status: 'active' },
      { id: 'uploaders', title: 'Uploaders', url: '/admin/uploads', icon: UsersRound, status: 'active' },
      { id: 'roles-permissions', title: 'Roles and Permissions', url: '/admin/roles', icon: UserCog, status: 'active' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'general-settings', title: 'General Settings', url: '/admin/settings', icon: Wrench, status: 'active' },
      { id: 'seo', title: 'SEO', icon: Globe2, status: 'coming-soon' },
      {
        id: 'security',
        title: 'Security',
        url: '/admin/settings?tab=security',
        icon: ShieldCheck,
        status: 'active',
      },
      { id: 'integrations', title: 'Integrations', icon: Plug, status: 'coming-soon' },
      { id: 'diagnostics', title: 'Diagnostics', url: '/admin/system-checklist', icon: Gauge, status: 'active' },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      { id: 'view-site', title: 'View Site', url: '/', icon: ExternalLink, status: 'active' },
      { id: 'admin-profile', title: 'Admin Profile', url: '/profile', icon: UserCog, status: 'active' },
      { id: 'logout', title: 'Log out', icon: LogOut, status: 'active', action: 'logout' },
    ],
  },
];

export function isNavItemActivePath(itemUrl: string, currentPath: string, currentHash: string): boolean {
  const [path, hash] = itemUrl.split('#');
  if (hash) {
    return currentPath === path && currentHash === `#${hash}`;
  }
  if (path === '/admin') {
    return currentPath === '/admin';
  }
  if (path === '/') {
    return false;
  }
  const basePath = path.split('?')[0];
  return currentPath === basePath || currentPath.startsWith(`${basePath}/`);
}
