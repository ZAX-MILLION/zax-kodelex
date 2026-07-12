import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Shield, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';
import type { InstallationData } from '@/types/installation';

interface AdminAccountStepProps {
  data: InstallationData;
  onUpdate: (updates: Partial<InstallationData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const AdminAccountStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrev 
}: AdminAccountStepProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const updateAdminAccount = (field: string, value: string) => {
    const updatedAccount = {
      ...data.adminAccount,
      [field]: value
    };
    onUpdate({ adminAccount: updatedAccount });

    if (field === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(Math.min(strength, 100));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Very Weak';
    if (passwordStrength < 50) return 'Weak';
    if (passwordStrength < 75) return 'Good';
    if (passwordStrength < 100) return 'Strong';
    return 'Very Strong';
  };

  const isValid = data.adminAccount.email && 
                 data.adminAccount.password &&
                 data.adminAccount.password.length >= 8 &&
                 passwordStrength >= 50;

  const handleNext = () => {
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Create Admin Account</h3>
        <p className="text-muted-foreground">
          Set up your administrator account to manage your manga reader
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This account will have full administrative access to your manga reader. 
          Choose a strong password and keep these credentials secure.
        </AlertDescription>
      </Alert>

      {/* Admin Account Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Administrator Details
          </CardTitle>
          <CardDescription>
            Create your main administrative account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="admin-email-account">Email Address *</Label>
            <Input
              id="admin-email-account"
              type="email"
              placeholder="admin@yoursite.com"
              value={data.adminAccount.email}
              onChange={(e) => updateAdminAccount('email', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Used for password recovery and notifications
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">Password *</Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Choose a strong password"
                value={data.adminAccount.password}
                onChange={(e) => updateAdminAccount('password', e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {data.adminAccount.password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className={`h-full rounded-full transition-all ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {getPasswordStrengthText()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1 ${
                    data.adminAccount.password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    <CheckCircle className="h-3 w-3" />
                    8+ characters
                  </div>
                  <div className={`flex items-center gap-1 ${
                    /[A-Z]/.test(data.adminAccount.password) ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    <CheckCircle className="h-3 w-3" />
                    Uppercase letter
                  </div>
                  <div className={`flex items-center gap-1 ${
                    /[a-z]/.test(data.adminAccount.password) ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    <CheckCircle className="h-3 w-3" />
                    Lowercase letter
                  </div>
                  <div className={`flex items-center gap-1 ${
                    /[0-9]/.test(data.adminAccount.password) ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    <CheckCircle className="h-3 w-3" />
                    Number
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-700 dark:text-amber-300">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Use a unique password not used elsewhere</li>
            <li>Enable two-factor authentication after installation</li>
            <li>Regularly update your password</li>
            <li>Never share your admin credentials</li>
            <li>Use a password manager for secure storage</li>
          </ul>
        </CardContent>
      </Card>

      {/* Account Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
          <CardDescription>
            Review your admin account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{data.adminAccount.email || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Password:</span>
              <span className="text-sm">
                {data.adminAccount.password ? '••••••••' : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Role:</span>
              <span className="text-sm font-semibold text-primary">Administrator</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please fill in all required fields and ensure your password is strong enough to continue.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!isValid}
          className="flex items-center gap-2"
        >
          Complete Setup
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};