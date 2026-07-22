/**
 * Sidebar structure for the demo admin simulation (`/demo/admin/*`).
 *
 * Mirrors the same groups/labels as the real admin sidebar (`adminNav.ts`) so
 * the shell feels identical, but only the screens actually built for the
 * lightweight simulation are `active` — everything else that would need real
 * data or the full Admin bundle is marked `coming-soon` instead of linking
 * nowhere or faking a working screen.
 */
import { ADMIN_NAV_GROUPS, type AdminNavGroup, type AdminNavItem } from './adminNav';

/** Item ids that have a real page under `/demo/admin/*`. */
const DEMO_ACTIVE_IDS = new Set(['dashboard-home', 'series-designs', 'appearance', 'backgrounds']);

function toDemoItem(item: AdminNavItem): AdminNavItem {
  if (item.action === 'logout') return item;
  if (!DEMO_ACTIVE_IDS.has(item.id) || item.status !== 'active' || !item.url) {
    return { ...item, status: 'coming-soon', url: undefined };
  }
  const demoUrl = item.url === '/admin' ? '/demo/admin' : item.url.replace('/admin/', '/demo/admin/');
  return { ...item, url: demoUrl };
}

export const DEMO_ADMIN_NAV_GROUPS: AdminNavGroup[] = ADMIN_NAV_GROUPS.map((group) => ({
  ...group,
  items: group.items.map(toDemoItem),
}));

export function isDemoNavItemActivePath(itemUrl: string, currentPath: string): boolean {
  if (itemUrl === '/demo/admin') return currentPath === '/demo/admin';
  return currentPath === itemUrl || currentPath.startsWith(`${itemUrl}/`);
}
