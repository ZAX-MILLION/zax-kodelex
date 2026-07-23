import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, User, Crown, UserCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTestAccounts } from '@/hooks/useTestAccounts';
import { isRealAuthEnabled, shouldUseDemoRolePreview } from '@/features/demo/demoAuthPolicy';
import DemoRolePreviewModal from '@/components/DemoRolePreviewModal';
import { Link } from 'react-router-dom';
import { appConfig } from '@/config/env';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [signupPending, setSignupPending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const { loginAsAdmin, loginAsMember } = useTestAccounts();
  const showQuickTest = import.meta.env.DEV && isRealAuthEnabled();

  if (shouldUseDemoRolePreview()) {
    return <DemoRolePreviewModal isOpen={isOpen} onClose={onClose} />;
  }

  if (!isRealAuthEnabled()) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in unavailable</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Authentication needs a configured Supabase project in your environment file. This host
            is not connected to live auth, so login requests are not sent.
          </p>
          {appConfig.features.roleLab && (
            <Button asChild className="min-h-11 w-full" onClick={onClose}>
              <Link to="/demo">Open Role Lab (no password)</Link>
            </Button>
          )}
          <Button variant="outline" className="min-h-11" onClick={onClose}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setIsLoading(false);
    setSignupPending(false);
    setResetSent(false);
    setShowForgotPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error, session } = await signIn(email, password);

    if (!error && session) {
      handleClose();
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setIsLoading(true);

    const { error, session } = await signUp(email, password, name);

    if (!error) {
      if (session) {
        handleClose();
      } else {
        setSignupPending(true);
      }
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    const { error } = await resetPassword(email);
    if (!error) {
      setResetSent(true);
    }
    setIsLoading(false);
  };

  const handleQuickLogin = async (type: 'admin' | 'member') => {
    setIsLoading(true);
    const result = type === 'admin' ? await loginAsAdmin() : await loginAsMember();
    if (!result.error) {
      handleClose();
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-border/50 max-h-[90vh] overflow-y-auto shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-manga-red">
            Welcome to Zax Million
          </DialogTitle>
          <p className="text-center text-muted-foreground text-sm">
            Sign in to access your reading progress and bookmarks
          </p>
        </DialogHeader>

        {signupPending && (
          <Alert className="border-green-500/30 bg-green-500/10">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Account created! Check your email to confirm your address, then sign in.
            </AlertDescription>
          </Alert>
        )}

        {resetSent && (
          <Alert className="border-blue-500/30 bg-blue-500/10">
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Password reset email sent. Check your inbox for the link.
            </AlertDescription>
          </Alert>
        )}

        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send reset link'}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
              Back to sign in
            </Button>
          </form>
        ) : (
          <>
            {showQuickTest && (
              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-center text-muted-foreground">Quick Test Login (dev only)</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleQuickLogin('admin')}
                    disabled={isLoading}
                    className="w-full border-manga-red/30 hover:bg-manga-red/10"
                  >
                    <Crown className="h-4 w-4 mr-2 text-manga-red" />
                    Login as Admin
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleQuickLogin('member')}
                    disabled={isLoading}
                    className="w-full border-primary/30 hover:bg-primary/10"
                  >
                    <UserCheck className="h-4 w-4 mr-2 text-primary" />
                    Login as Member
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Or continue with</span>
                  <Separator className="flex-1" />
                </div>
              </div>
            )}

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-sm">Login</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-accent hover:opacity-90 h-11" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-muted-foreground"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot your password?
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Choose a username"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a secure password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-accent hover:opacity-90 h-11" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
