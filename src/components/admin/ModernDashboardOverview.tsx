import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  FileText,
  LayoutGrid,
  MessageSquare,
  Moon,
  Palette,
  Plus,
  Settings,
  Sun,
  SwatchBook,
  Sparkles,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/config/env';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminDashboardStats } from '@/features/admin/useAdminDashboardStats';
import { readGlobalSeriesDesignDraft } from '@/features/series/seriesDesignAdmin';
import { SERIES_DETAILS_LAYOUT_META } from '@/features/series/seriesDetailsLayout';
import { getGlobalAppearanceMode } from '@/features/appearance/appearanceMode';

interface RecentAction {
  id: string;
  description: string;
  action_type: string;
  created_at: string | null;
}

const quickActions = [
  { title: 'Add series', path: '/admin/series', icon: BookOpen },
  { title: 'Manage series designs', path: '/admin/series-design', icon: LayoutGrid },
  { title: 'Preview site', path: '/', icon: Sparkles, external: true },
  { title: 'Open demo style comparison', path: '/demo/styles', icon: SwatchBook, external: true },
  { title: 'Manage comments', path: '/admin/comments', icon: MessageSquare },
  { title: 'Open settings', path: '/admin/settings', icon: Settings },
];

function StatCard({
  title,
  value,
  icon: Icon,
  isRealData,
}: {
  title: string;
  value: number | null;
  icon: typeof Users;
  isRealData: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" aria-hidden />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {value === null ? '—' : value.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground">
          {isRealData ? 'Live from the database' : 'Connect Supabase to see real totals'}
        </p>
      </CardContent>
    </Card>
  );
}

export const ModernDashboardOverview = () => {
  const { userProfile } = useAuth();
  const stats = useAdminDashboardStats();
  const [globalDesign] = useState(() => readGlobalSeriesDesignDraft());
  const [appearanceMode] = useState(() => getGlobalAppearanceMode());
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const [activityError, setActivityError] = useState<string | null>(null);

  useEffect(() => {
    if (!appConfig.hasSupabase) return;
    let cancelled = false;
    supabase
      .from('admin_actions')
      .select('id, description, action_type, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setActivityError(error.message);
          return;
        }
        setRecentActions(data || []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const envBadgeVariant = appConfig.isProduction ? 'default' : 'outline';
  const layoutMeta = SERIES_DETAILS_LAYOUT_META[globalDesign.layout];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Welcome back{userProfile?.username ? `, ${userProfile.username}` : ''}
          </h1>
          <p className="text-muted-foreground">Here's the current state of your manga platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={envBadgeVariant} className="capitalize">
            {appConfig.environment}
          </Badge>
          <Badge variant="outline" className={appConfig.hasSupabase ? 'border-emerald-500/40 text-emerald-500' : 'border-amber-500/40 text-amber-500'}>
            {appConfig.hasSupabase ? 'Database connected' : 'Database not connected'}
          </Badge>
        </div>
      </div>

      {!stats.isRealData && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-start gap-3 pt-4 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
            <p className="text-muted-foreground">
              {appConfig.isDemo
                ? 'This is the public demo. Totals below are simulated and no Supabase requests are made.'
                : 'No live Supabase project is connected, so totals can\'t be loaded. Configure VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY to see real numbers.'}
            </p>
          </CardContent>
        </Card>
      )}
      {stats.error && (
        <p className="text-sm text-destructive" role="alert">
          Failed to load totals: {stats.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Series" value={stats.seriesCount} icon={BookOpen} isRealData={stats.isRealData} />
        <StatCard title="Chapters" value={stats.chapterCount} icon={FileText} isRealData={stats.isRealData} />
        <StatCard title="Comments" value={stats.commentCount} icon={MessageSquare} isRealData={stats.isRealData} />
        <StatCard title="Members" value={stats.memberCount} icon={Users} isRealData={stats.isRealData} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4 text-primary" aria-hidden />
              Current series design
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-foreground">
              <strong>{layoutMeta.label}</strong>
            </p>
            <p className="text-muted-foreground">{layoutMeta.description}</p>
            <Button asChild variant="link" className="h-auto p-0 text-sm">
              <Link to="/admin/series-design">Manage series design →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {appearanceMode === 'light' ? (
                <Sun className="h-4 w-4 text-primary" aria-hidden />
              ) : (
                <Moon className="h-4 w-4 text-primary" aria-hidden />
              )}
              Appearance mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="capitalize text-foreground">
              <strong>{appearanceMode}</strong>
            </p>
            <p className="text-muted-foreground">Site-wide light / dark / system preference.</p>
            <Button asChild variant="link" className="h-auto p-0 text-sm">
              <Link to="/admin/series-design#appearance">Change appearance →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" aria-hidden />
              Site status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-foreground">
              Environment: <strong className="capitalize">{appConfig.environment}</strong>
            </p>
            <p className="text-foreground">
              Admin panel: <strong>{appConfig.features.adminPanel ? 'Enabled' : 'Disabled'}</strong>
            </p>
            <p className="text-foreground">
              Payments: <strong>{appConfig.disablePayments ? 'Disabled' : 'Enabled'}</strong>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick actions</CardTitle>
          <CardDescription>Common admin tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                asChild
                variant="ghost"
                className="h-auto flex-col gap-2 border border-border/60 p-4 hover:border-primary/40 hover:bg-primary/5"
              >
                <Link to={action.path} target={action.external ? '_blank' : undefined} rel={action.external ? 'noopener noreferrer' : undefined}>
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                  <span className="text-center text-xs font-medium leading-tight text-foreground">
                    {action.title}
                  </span>
                </Link>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4 text-primary" aria-hidden />
            Recent activity
          </CardTitle>
          <CardDescription>
            {appConfig.hasSupabase ? 'Latest logged administrator actions' : 'Requires a connected database'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!appConfig.hasSupabase ? (
            <p className="text-sm text-muted-foreground">
              Connect Supabase to see real administrator activity here.
            </p>
          ) : activityError ? (
            <p className="text-sm text-destructive" role="alert">
              Failed to load recent activity: {activityError}
            </p>
          ) : recentActions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity to show yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentActions.map((action) => (
                <li key={action.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{action.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.created_at ? new Date(action.created_at).toLocaleString() : 'Unknown time'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
