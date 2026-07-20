import type { ElementType } from 'react';
import { Link } from 'react-router-dom';
import { Shield, User, Crown, Coins, Upload, Eye, ArrowLeft, FlaskConical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';
import {
  DEMO_ROLE_OPTIONS,
  useDemoRole,
  type DemoRoleProfile,
} from '@/contexts/DemoRoleContext';
import type { DemoRoleId } from '@/config/env';
import { appConfig } from '@/config/env';

const ROLE_ICONS: Record<DemoRoleId, ElementType> = {
  guest: Eye,
  member: User,
  paid: Crown,
  buyer: Coins,
  uploader: Upload,
  admin: Shield,
};

function RoleCapabilityList({ profile }: { profile: DemoRoleProfile }) {
  const caps = [
    { label: 'Browse demo library', ok: true },
    { label: 'Profile & bookmarks UI', ok: profile.role !== 'guest' },
    { label: 'Premium badge', ok: profile.isPremium },
    { label: 'Coin wallet display', ok: profile.coins > 0 },
    { label: 'Purchase UI (blocked)', ok: profile.canPurchase },
    { label: 'Upload panel preview', ok: profile.canUpload },
    { label: 'Admin dashboard', ok: false },
  ];

  return (
    <ul className="space-y-2 text-sm">
      {caps.map((cap) => (
        <li key={cap.label} className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${cap.ok ? 'bg-green-500' : 'bg-muted-foreground/40'}`}
          />
          <span className={cap.ok ? 'text-foreground' : 'text-muted-foreground'}>
            {cap.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

const DemoRoleLab = () => {
  const { activeRole, profile, setActiveRole, clearRole, enabled } = useDemoRole();

  if (!enabled) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <EnhancedSEOHelmet title="Role Lab" noindex />
        <p className="text-muted-foreground">Role Lab is only available in demo or staging builds.</p>
        <Button asChild className="mt-4">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <EnhancedSEOHelmet
        title="Role Lab — Zax Million Demo"
        description="Simulate guest, member, premium, buyer, uploader, and admin UI states without passwords or live data."
        noindex
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FlaskConical className="h-6 w-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold">Role Lab</h1>
              <Badge variant="secondary">Demo only</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Switch personas to preview how the UI adapts. No passwords, no Supabase, no PayPal, and
              no admin bundle on this demo host.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEMO_ROLE_OPTIONS.map((option) => {
            const Icon = ROLE_ICONS[option.id];
            const selected = activeRole === option.id;
            return (
              <Card
                key={option.id}
                className={`transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-ring ${
                  selected ? 'ring-2 ring-primary border-primary' : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                    <CardTitle className="text-lg">{option.label}</CardTitle>
                  </div>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    size="sm"
                    variant={selected ? 'default' : 'outline'}
                    className="w-full min-h-11"
                    aria-pressed={selected}
                    onClick={() => setActiveRole(option.id)}
                  >
                    {selected ? 'Active' : 'Simulate'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {profile && (
          <Card>
            <CardHeader>
              <CardTitle>Active simulation: {profile.displayName}</CardTitle>
              <CardDescription>{profile.email} — client-side UI only</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>{profile.role}</Badge>
                {profile.isPremium && <Badge variant="secondary">Premium</Badge>}
                {profile.coins > 0 && <Badge variant="outline">{profile.coins} coins</Badge>}
              </div>
              <RoleCapabilityList profile={profile} />
              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild>
                  <Link to="/">View homepage as this role</Link>
                </Button>
                {profile.role === 'uploader' && (
                  <Button asChild variant="secondary">
                    <Link to="/demo/uploader">Open uploader simulation</Link>
                  </Button>
                )}
                {profile.role === 'admin' && (
                  <Button asChild variant="secondary">
                    <Link to="/demo/admin">Open admin simulation</Link>
                  </Button>
                )}
                {profile.role === 'buyer' && (
                  <Button asChild variant="secondary">
                    <Link to="/demo/checkout">Open demo checkout</Link>
                  </Button>
                )}
                <Button variant="outline" onClick={clearRole} className="min-h-11">
                  Reset Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Environment</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>Build: {appConfig.environment}</p>
            <p>Payments: {appConfig.disablePayments ? 'disabled' : 'enabled'}</p>
            <p>Admin panel: {appConfig.disableAdmin ? 'blocked on this host' : 'available'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DemoRoleLab;
