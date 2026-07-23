import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, LogOut, Mail, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { isRealAuthEnabled } from '@/features/demo/demoAuthPolicy';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';

interface LocationState {
  from?: string;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Real administrator login — separate from the public reader auth modal.
 * Uses the same Supabase-backed AuthContext; access to /admin is still
 * enforced by AdminRoute + AdminLayout (profile.role === 'admin') and by
 * database RLS via `is_admin()`. This page never grants access on its own.
 */
const AdminLogin = () => {
  const { user, isAdmin, isLoading, signIn, resetPassword, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const intendedDestination = (location.state as LocationState | null)?.from || '/admin';

  const authAvailable = useMemo(() => isRealAuthEnabled(), []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Already an authenticated admin — go straight to the intended destination.
  useEffect(() => {
    if (isLoading) return;
    if (user && isAdmin) {
      navigate(intendedDestination, { replace: true });
    }
  }, [isLoading, user, isAdmin, intendedDestination, navigate]);

  const handleSignOut = async () => {
    await signOut();
  };

  const validate = (): boolean => {
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) nextErrors.email = 'Email is required.';
    else if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Password is required.';
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);

    if (error) {
      setFormError(error.message || 'Sign-in failed. Check your email and password.');
    }
    // On success, the redirect effect above fires once the profile/role loads.
  };

  const handleForgotPassword = async (event: FormEvent) => {
    event.preventDefault();
    setResetError(null);
    if (!email.trim() || !isValidEmail(email)) {
      setResetError('Enter the email address for your admin account first.');
      return;
    }
    setResetSubmitting(true);
    const { error } = await resetPassword(email.trim());
    setResetSubmitting(false);
    if (error) {
      setResetError(error.message || 'Could not send the reset email.');
    } else {
      setResetSent(true);
    }
  };

  const pageShell = (children: React.ReactNode) => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <EnhancedSEOHelmet title="Admin sign in" noindex />
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Zax Million Admin</h1>
          <p className="text-sm text-muted-foreground">Restricted to authorized administrators only.</p>
        </div>
        {children}
        <p className="text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground hover:underline">
            ← Back to the public site
          </Link>
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return pageShell(
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            role="status"
            aria-label="Checking your session"
          />
        </CardContent>
      </Card>
    );
  }

  // Authenticated but explicitly not an admin — never render a login form for
  // this account and never imply retrying will unlock admin access.
  if (user && !isAdmin) {
    return pageShell(
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" aria-hidden />
            Not an administrator account
          </CardTitle>
          <CardDescription>
            You're signed in as <strong>{user.email}</strong>, but this account does not have
            administrator access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground" role="status">
            Ask an existing administrator to grant your account the admin role, then sign in again.
          </p>
          <Button className="w-full min-h-11 gap-2" variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
          <Button asChild className="w-full min-h-11">
            <Link to="/">Return to site</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!authAvailable) {
    return pageShell(
      <Card>
        <CardHeader>
          <CardTitle>Admin sign in unavailable</CardTitle>
          <CardDescription>
            This deployment does not have a live Supabase project configured, so no real
            administrator session can be created here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> for
            staging or production, then reload this page.
          </p>
          <p>There is no backdoor or bypass for this screen.</p>
        </CardContent>
      </Card>
    );
  }

  return pageShell(
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your administrator email and password.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {formError && (
          <Alert variant="destructive" role="alert">
            <AlertTitle>Sign-in failed</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="admin-reset-email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-11 pl-10"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            {resetError && (
              <p className="text-sm text-destructive" role="alert">
                {resetError}
              </p>
            )}
            {resetSent && (
              <p className="text-sm text-primary" role="status">
                If that email has an account, a reset link is on its way. Check your inbox.
              </p>
            )}

            <Button type="submit" className="w-full min-h-11" disabled={resetSubmitting}>
              {resetSubmitting ? 'Sending…' : 'Send reset link'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full min-h-11"
              onClick={() => {
                setShowForgotPassword(false);
                setResetError(null);
                setResetSent(false);
              }}
            >
              Back to sign in
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-11 pl-10"
                  placeholder="you@company.com"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'admin-email-error' : undefined}
                  required
                />
              </div>
              {fieldErrors.email && (
                <p id="admin-email-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-11 px-10"
                  placeholder="••••••••"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'admin-password-error' : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="admin-password-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full min-h-11" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm text-muted-foreground"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot your password?
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminLogin;
