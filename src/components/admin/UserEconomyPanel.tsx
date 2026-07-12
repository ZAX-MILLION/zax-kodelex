import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Coins, ShoppingCart, LogIn, Crown, Download, Calendar } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Mocked types and data for scaffolding until purchases/coin_logs tables are ready
interface PurchaseItem {
  id: string;
  date: string; // ISO
  amount: number; // coins
  method: 'paypal' | 'reward' | 'admin';
  description: string;
}

interface LoginLog {
  id: string;
  date: string; // ISO
  ip: string;
  userAgent: string;
  status: 'success' | 'failed';
}

interface SubscriptionLog {
  id: string;
  date: string; // ISO
  event: 'created' | 'renewed' | 'cancelled' | 'expired';
  plan: 'free' | 'premium';
  details?: string;
}

const genDates = (days: number) => {
  const out: { date: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ date: d.toISOString().slice(0, 10), value: Math.floor(Math.random() * 200) + 20 });
  }
  return out;
};

const mockPurchases: PurchaseItem[] = Array.from({ length: 18 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i * 2);
  return {
    id: `p-${i}`,
    date: d.toISOString(),
    amount: [120, 240, 480, 960][i % 4],
    method: (['paypal', 'reward', 'admin'] as const)[i % 3],
    description: ['Coin pack', 'Event reward', 'Admin credit'][i % 3]
  };
});

const mockLoginLogs: LoginLog[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `l-${i}`,
  date: new Date(Date.now() - i * 36e5).toISOString(),
  ip: `192.168.0.${(i % 50) + 1}`,
  userAgent: 'Chrome on Windows',
  status: i % 7 === 0 ? 'failed' : 'success'
}));

const mockSubLogs: SubscriptionLog[] = [
  { id: 's-1', date: new Date().toISOString(), event: 'renewed', plan: 'premium', details: 'Monthly renewal successful' },
  { id: 's-2', date: new Date(Date.now() - 3 * 24 * 36e5).toISOString(), event: 'created', plan: 'premium', details: 'Trial converted to paid' },
  { id: 's-3', date: new Date(Date.now() - 40 * 24 * 36e5).toISOString(), event: 'cancelled', plan: 'premium', details: 'User cancelled auto-renew' },
];

const ranges = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_3_months', label: 'Last 3 Months' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom' },
] as const;

type RangeValue = typeof ranges[number]['value'];

export const UserEconomyPanel = () => {
  const [range, setRange] = useState<RangeValue>('this_week');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');

  const summary = useMemo(() => {
    const balance = 1200;
    const lifetimeEarned = 5400;
    const lifetimeSpent = 4200;
    return { balance, lifetimeEarned, lifetimeSpent, net: lifetimeEarned - lifetimeSpent };
  }, []);

  const chartData = useMemo(() => {
    switch (range) {
      case 'today': return genDates(1);
      case 'yesterday': return genDates(1);
      case 'this_week': return genDates(7);
      case 'last_month': return genDates(30);
      case 'last_3_months': return genDates(90);
      case 'custom': {
        if (!customFrom || !customTo) return [];
        const start = new Date(customFrom);
        const end = new Date(customTo);
        const days = Math.max(1, Math.ceil((+end - +start) / 86400000) + 1);
        return genDates(days);
      }
      default: return genDates(30);
    }
  }, [range, customFrom, customTo]);

  const filteredPurchases = useMemo(() => mockPurchases, []);
  const exportCSV = (rows: any[], name: string) => {
    const csv = [Object.keys(rows[0] || {}).join(','), ...rows.map(r => Object.values(r).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${name}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">User Economy</h2>
          <p className="text-muted-foreground">Balance, purchases, and activity logs</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={(v: RangeValue) => setRange(v)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ranges.map(r => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {range === 'custom' && (
            <div className="flex items-center gap-2">
              <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-36" />
              <span className="text-muted-foreground">to</span>
              <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="w-36" />
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">{summary.balance.toLocaleString()} coins</p>
              </div>
              <Coins className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lifetime Earned</p>
                <p className="text-2xl font-bold">{summary.lifetimeEarned.toLocaleString()}</p>
              </div>
              <Crown className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lifetime Spent</p>
                <p className="text-2xl font-bold">{summary.lifetimeSpent.toLocaleString()}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net</p>
                <p className="text-2xl font-bold">{summary.net.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Balance & Purchases</CardTitle>
          <CardDescription>Trend over selected range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="purchases" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="purchases">Purchase History</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="balance">Balance Details</TabsTrigger>
        </TabsList>

        {/* Purchases */}
        <TabsContent value="purchases">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>Mock data until purchases table exists</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportCSV(filteredPurchases, 'purchases')}>
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredPurchases.map((p) => (
                <div key={p.id} className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10"><ShoppingCart className="h-4 w-4 text-primary" /></div>
                    <div>
                      <div className="font-medium">{p.description}</div>
                      <div className="text-sm text-muted-foreground">{new Date(p.date).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">+{p.amount}</div>
                    <Badge variant="secondary" className="capitalize">{p.method}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs */}
        <TabsContent value="logs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Login Activity</CardTitle>
                <CardDescription>Recent sign-in attempts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockLoginLogs.map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{l.ip}</div>
                      <div className="text-sm text-muted-foreground">{l.userAgent}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">{new Date(l.date).toLocaleString()}</div>
                      <Badge variant={l.status === 'success' ? 'default' : 'destructive'} className="capitalize">{l.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Logs</CardTitle>
                <CardDescription>Mocked events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockSubLogs.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{s.event}</div>
                      <div className="text-sm text-muted-foreground">Plan: {s.plan}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">{new Date(s.date).toLocaleString()}</div>
                      <Badge variant="outline">{s.details || '—'}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Balance */}
        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle>Balance Details</CardTitle>
              <CardDescription>Summary breakdown</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Current</p>
                <p className="text-2xl font-bold">{summary.balance}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Lifetime Earned</p>
                <p className="text-2xl font-bold">{summary.lifetimeEarned}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Lifetime Spent</p>
                <p className="text-2xl font-bold">{summary.lifetimeSpent}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserEconomyPanel;
