import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ban,
  BookOpen,
  Check,
  CreditCard,
  Crown,
  LayoutGrid,
  MessageSquare,
  Moon,
  Palette,
  Settings,
  Sun,
  Upload,
  Users,
  Wallpaper,
} from 'lucide-react';
import { readGlobalSeriesDesignDraft } from '@/features/series/seriesDesignAdmin';
import { SERIES_DETAILS_LAYOUT_META } from '@/features/series/seriesDetailsLayout';
import { getGlobalAppearanceMode } from '@/features/appearance/appearanceMode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DEMO_SIMULATED_ACTION_MESSAGE } from '@/features/demo/demoAuthPolicy';

type DemoAdminState = {
  pendingUploads: Array<{ id: string; title: string; author: string; status: 'pending' | 'approved' | 'rejected' }>;
  users: Array<{ id: string; name: string; role: string; suspended: boolean }>;
  transactions: Array<{ id: string; label: string; amount: string; reviewed: boolean }>;
  comments: Array<{ id: string; author: string; text: string; hidden: boolean }>;
  maintenanceMode: boolean;
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
  notice: null,
};

const quickActions = [
  { title: 'Manage series designs', path: '/demo/admin/series-design', icon: LayoutGrid },
  { title: 'Change appearance', path: '/demo/admin/appearance', icon: Palette },
  { title: 'Edit backgrounds', path: '/demo/admin/backgrounds', icon: Wallpaper },
  { title: 'Open demo style comparison', path: '/demo/styles', icon: BookOpen, external: true },
];

/** Dashboard home for the demo admin simulation — session state only, no Supabase. */
export function DemoAdminOverview() {
  const [state, setState] = useState<DemoAdminState>(INITIAL_STATE);
  const [globalDesign] = useState(() => readGlobalSeriesDesignDraft());
  const [appearanceMode] = useState(() => getGlobalAppearanceMode());
  const layoutMeta = SERIES_DETAILS_LAYOUT_META[globalDesign.layout];

  const announce = (extra?: string) => {
    setState((prev) => ({
      ...prev,
      notice: extra ? `${DEMO_SIMULATED_ACTION_MESSAGE} ${extra}` : DEMO_SIMULATED_ACTION_MESSAGE,
    }));
  };

  const metrics = [
    { label: 'Readers (demo)', value: '12.4k', icon: Users },
    { label: 'Series (demo)', value: '48', icon: BookOpen },
    { label: 'Pending uploads', value: String(state.pendingUploads.filter((u) => u.status === 'pending').length), icon: Upload },
    { label: 'Open reports', value: String(state.comments.filter((c) => !c.hidden).length), icon: MessageSquare },
  ];

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Welcome to the demo console</h1>
        <p className="text-muted-foreground">
          A lightweight, fictional preview of the admin dashboard. All data below is simulated.
        </p>
      </div>

      {state.notice && (
        <p className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm" role="status">
          {state.notice}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                <Icon className="h-4 w-4 text-primary" aria-hidden />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                <p className="text-xs text-muted-foreground">Simulated demo data</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick actions</CardTitle>
          <CardDescription>Try the same settings screens the real admin uses</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.path}
                target={action.external ? '_blank' : undefined}
                rel={action.external ? 'noopener noreferrer' : undefined}
                className="flex min-h-[96px] flex-col items-start justify-between gap-2 rounded-xl bg-muted/40 p-4 transition-colors hover:bg-primary/10"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-sm font-medium leading-tight text-foreground">{action.title}</span>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                className="flex flex-col gap-2 rounded-lg bg-muted/30 p-3 sm:flex-row sm:items-center"
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
              <MessageSquare className="h-4 w-4" />
              Comments / moderation
            </CardTitle>
            <CardDescription>Hide or restore fictional comments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.comments.map((comment) => (
              <div key={comment.id} className="space-y-2 rounded-lg bg-muted/30 p-3">
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
              <Users className="h-4 w-4" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-2 rounded-lg bg-muted/30 p-3 sm:flex-row sm:items-center"
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
                className="flex flex-col gap-2 rounded-lg bg-muted/30 p-3 sm:flex-row sm:items-center"
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
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
      </div>
    </div>
  );
}
