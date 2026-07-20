import { useEffect, useState } from 'react';
import {
  Shield,
  Users,
  BookOpen,
  Upload,
  MessageSquare,
  CreditCard,
  Crown,
  Palette,
  Settings,
  Ban,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';
import { DemoSimChrome } from '@/components/demo/DemoSimChrome';
import { SeriesDetailsBackgroundControls } from '@/components/series/SeriesDetailsBackgroundControls';
import { useDemoRole } from '@/contexts/DemoRoleContext';
import { DEMO_SIMULATED_ACTION_MESSAGE } from '@/features/demo/demoAuthPolicy';
import { getFeaturedDemoSeries } from '@/utils/demoLibraryData';

type DemoAdminState = {
  pendingUploads: Array<{ id: string; title: string; author: string; status: 'pending' | 'approved' | 'rejected' }>;
  users: Array<{ id: string; name: string; role: string; suspended: boolean }>;
  transactions: Array<{ id: string; label: string; amount: string; reviewed: boolean }>;
  comments: Array<{ id: string; author: string; text: string; hidden: boolean }>;
  maintenanceMode: boolean;
  themePreview: 'neon' | 'zen' | 'sakura';
  notice: string | null;
};

const INITIAL_STATE: DemoAdminState = {
  pendingUploads: [
    { id: 'u1', title: 'Neon Drift Ch. 4', author: 'demo-uploader', status: 'pending' },
    { id: 'u2', title: 'Sakura Line Ch. 12', author: 'ink-fox', status: 'pending' },
  ],
  users: [
    { id: 'm1', name: 'Demo Member', role: 'member', suspended: false },
    { id: 'b1', name: 'Coin Buyer', role: 'buyer', suspended: false },
    { id: 'a1', name: 'Series Uploader', role: 'uploader', suspended: false },
  ],
  transactions: [
    { id: 't1', label: 'Coin pack (simulated)', amount: '4.99 USD', reviewed: false },
    { id: 't2', label: 'Premium month (simulated)', amount: '9.99 USD', reviewed: false },
  ],
  comments: [
    { id: 'c1', author: 'reader42', text: 'Love this chapter!', hidden: false },
    { id: 'c2', author: 'spam-bot', text: 'Buy coins cheap…', hidden: false },
  ],
  maintenanceMode: false,
  themePreview: 'neon',
  notice: null,
};

/**
 * Lightweight admin simulation — MUST NOT import the real Admin page (~920KB).
 * All mutations stay in React state for this session only.
 */
const DemoAdminSim = () => {
  const { setActiveRole, activeRole } = useDemoRole();
  const [state, setState] = useState<DemoAdminState>(INITIAL_STATE);

  useEffect(() => {
    if (activeRole !== 'admin') {
      setActiveRole('admin');
    }
  }, [activeRole, setActiveRole]);

  const announce = (extra?: string) => {
    setState((prev) => ({
      ...prev,
      notice: extra ? `${DEMO_SIMULATED_ACTION_MESSAGE} ${extra}` : DEMO_SIMULATED_ACTION_MESSAGE,
    }));
  };

  const metrics = [
    { label: 'Readers (demo)', value: '12.4k', icon: Users },
    { label: 'Series', value: '48', icon: BookOpen },
    { label: 'Pending uploads', value: String(state.pendingUploads.filter((u) => u.status === 'pending').length), icon: Upload },
    { label: 'Open reports', value: String(state.comments.filter((c) => !c.hidden).length), icon: MessageSquare },
  ];
  const featuredSeries = getFeaturedDemoSeries().slice(0, 3);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl space-y-6">
      <EnhancedSEOHelmet title="Admin simulation" noindex />
      <DemoSimChrome title="Admin dashboard (simulation)" />

      {state.notice && (
        <p className="text-sm rounded-lg border border-primary/30 bg-primary/10 px-4 py-3" role="status">
          {state.notice}
        </p>
      )}

      <p className="text-sm text-muted-foreground flex items-start gap-2">
        <Shield className="h-4 w-4 mt-0.5 shrink-0" />
        Lightweight simulated dashboard. The production Admin bundle is not loaded. Nothing here can
        change real settings, users, or payments.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <Icon className="h-5 w-5 text-primary shrink-0" aria-hidden />
                <div>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className="text-lg font-semibold">{metric.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload review
            </CardTitle>
            <CardDescription>Approve fictional drafts in this session only</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.pendingUploads.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-border/60 p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.author} · {item.status}
                  </p>
                </div>
                {item.status === 'pending' ? (
                  <Button
                    size="sm"
                    className="min-h-11"
                    onClick={() => {
                      setState((prev) => ({
                        ...prev,
                        pendingUploads: prev.pendingUploads.map((u) =>
                          u.id === item.id ? { ...u, status: 'approved' } : u
                        ),
                      }));
                      announce('Upload marked approved in demo state.');
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                ) : (
                  <Badge variant="secondary">{item.status}</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-border/60 p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.role}
                    {user.suspended ? ' · suspended' : ''}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => {
                    setState((prev) => ({
                      ...prev,
                      users: prev.users.map((u) =>
                        u.id === user.id ? { ...u, suspended: !u.suspended } : u
                      ),
                    }));
                    announce('Account status toggled in demo state.');
                  }}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  {user.suspended ? 'Reinstate' : 'Suspend'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-border/60 p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{tx.label}</p>
                  <p className="text-xs text-muted-foreground">{tx.amount}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-11"
                  disabled={tx.reviewed}
                  onClick={() => {
                    setState((prev) => ({
                      ...prev,
                      transactions: prev.transactions.map((t) =>
                        t.id === tx.id ? { ...t, reviewed: true } : t
                      ),
                    }));
                    announce('Transaction marked reviewed in demo state.');
                  }}
                >
                  {tx.reviewed ? 'Reviewed' : 'Review'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments / moderation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-border/60 p-3 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">{comment.author}: </span>
                  <span className={comment.hidden ? 'line-through text-muted-foreground' : ''}>
                    {comment.text}
                  </span>
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => {
                    setState((prev) => ({
                      ...prev,
                      comments: prev.comments.map((c) =>
                        c.id === comment.id ? { ...c, hidden: !c.hidden } : c
                      ),
                    }));
                    announce('Moderation flag updated in demo state.');
                  }}
                >
                  {comment.hidden ? 'Restore' : 'Hide'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Memberships
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Active premium (demo): 318</p>
            <p>Trialing (demo): 42</p>
            <p>Churn risk (demo): 11</p>
            <Button
              variant="outline"
              className="w-full min-h-11 mt-2"
              onClick={() => announce('Membership report is fictional demo data.')}
            >
              Preview membership report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Themes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(['neon', 'zen', 'sakura'] as const).map((theme) => (
              <Button
                key={theme}
                variant={state.themePreview === theme ? 'default' : 'outline'}
                className="min-h-11 capitalize"
                onClick={() => {
                  setState((prev) => ({ ...prev, themePreview: theme }));
                  announce(`Theme preview set to ${theme} (session only).`);
                }}
              >
                {theme}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings preview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="demo-maintenance">Maintenance mode (simulated)</Label>
              <p className="text-xs text-muted-foreground">Toggle stays in this browser session only.</p>
            </div>
            <Switch
              id="demo-maintenance"
              checked={state.maintenanceMode}
              onCheckedChange={(checked) => {
                setState((prev) => ({ ...prev, maintenanceMode: checked }));
                announce('Setting toggled in demo state.');
              }}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Manga details backgrounds
            </CardTitle>
            <CardDescription>
              Session-only preview controls. Global default applies to all series unless a series override
              or catalogue URL is set.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SeriesDetailsBackgroundControls
              compact
              onChanged={() => announce('Background settings updated in demo state.')}
            />
            <div className="space-y-4 border-t border-border/40 pt-4">
              <p className="text-sm font-medium">Per-series overrides (featured demo catalogue)</p>
              {featuredSeries.map((series) => (
                <div
                  key={series.id}
                  className="rounded-xl border border-border/50 bg-muted/10 p-3 sm:p-4"
                >
                  <SeriesDetailsBackgroundControls
                    compact
                    seriesId={series.id}
                    seriesTitle={series.title}
                    coverImageUrl={series.cover_image_url}
                    onChanged={() =>
                      announce(`Background updated for ${series.title} in demo state.`)
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DemoAdminSim;
