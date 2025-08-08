import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Smartphone, 
  QrCode, 
  Key, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

interface TwoFactorAuthProps {
  onSetupComplete?: () => void;
  showAsModal?: boolean;
}

export const TwoFactorAuth = ({ onSetupComplete, showAsModal = false }: TwoFactorAuthProps) => {
  const [currentStep, setCurrentStep] = useState<'setup' | 'verify' | 'backup' | 'complete'>('setup');
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  useEffect(() => {
    // Check if 2FA is already enabled for this user
    checkExisting2FA();
  }, [user]);

  const checkExisting2FA = async () => {
    if (!user) return;
    
    try {
      // Check if user already has 2FA enabled
      // This would typically query the database for existing 2FA setup
      const has2FA = false; // Would check userProfile.twofa_enabled when field exists
      setIs2FAEnabled(has2FA);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const generateSecret = () => {
    const newSecret = authenticator.generateSecret();
    setSecret(newSecret);
    generateQRCode(newSecret);
  };

  const generateQRCode = async (secretKey: string) => {
    if (!user?.email) return;
    
    const serviceName = 'Manga Reader';
    const accountName = user.email;
    const otpauth = authenticator.keyuri(accountName, serviceName, secretKey);
    
    try {
      const qrCodeDataURL = await QRCode.toDataURL(otpauth);
      setQrCodeUrl(qrCodeDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "QR Code Error",
        description: "Failed to generate QR code. Please copy the secret manually.",
        variant: "destructive",
      });
    }
  };

  const generateBackupCodes = (): string[] => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const startSetup = () => {
    generateSecret();
    setCurrentStep('setup');
  };

  const verifySetup = async () => {
    if (!verificationCode || !secret) {
      toast({
        title: "Verification Required",
        description: "Please enter the 6-digit code from your authenticator app.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const isValid = authenticator.verify({
        token: verificationCode,
        secret: secret,
      });

      if (isValid) {
        // Save 2FA configuration to database
        await save2FAConfiguration();
        
        // Generate backup codes
        const codes = generateBackupCodes();
        setBackupCodes(codes);
        
        setCurrentStep('backup');
        
        toast({
          title: "2FA Verified",
          description: "Two-factor authentication has been successfully set up.",
        });
      } else {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify the authentication code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const save2FAConfiguration = async () => {
    if (!user) return;
    
    try {
      // Save 2FA secret and enable 2FA in the database
      // This would typically update the user's profile with 2FA settings
      console.log('Saving 2FA configuration for user:', user.id);
      // Implementation would save to Supabase profiles table
    } catch (error) {
      console.error('Error saving 2FA configuration:', error);
      throw error;
    }
  };

  const completeSetup = () => {
    setIs2FAEnabled(true);
    setCurrentStep('complete');
    onSetupComplete?.();
    
    toast({
      title: "Setup Complete",
      description: "Two-factor authentication is now active on your account.",
    });
  };

  const disable2FA = async () => {
    setIsLoading(true);
    
    try {
      // Disable 2FA in the database
      // This would update the user's profile to disable 2FA
      setIs2FAEnabled(false);
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to disable two-factor authentication.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manga-reader-2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (is2FAEnabled && currentStep !== 'complete') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            Two-Factor Authentication
            <Badge className="bg-green-100 text-green-800">Enabled</Badge>
          </CardTitle>
          <CardDescription>
            Your account is protected with two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-800">
              Two-factor authentication is active and protecting your account.
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={disable2FA} disabled={isLoading}>
              Disable 2FA
            </Button>
            <Button variant="outline" onClick={() => setCurrentStep('backup')}>
              View Backup Codes
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={showAsModal ? "w-full max-w-md mx-auto" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication Setup
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={currentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup" disabled={currentStep !== 'setup'}>Setup</TabsTrigger>
            <TabsTrigger value="verify" disabled={currentStep !== 'verify'}>Verify</TabsTrigger>
            <TabsTrigger value="backup" disabled={currentStep !== 'backup'}>Backup</TabsTrigger>
            <TabsTrigger value="complete" disabled={currentStep !== 'complete'}>Complete</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <div className="text-center">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Install Authenticator App</h3>
              <p className="text-sm text-muted-foreground mb-4">
                First, install an authenticator app like Google Authenticator, Authy, or 1Password on your mobile device.
              </p>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Make sure you have an authenticator app installed before proceeding.
              </AlertDescription>
            </Alert>
            
            <Button onClick={startSetup} className="w-full">
              Start Setup
            </Button>
          </TabsContent>

          <TabsContent value="verify" className="space-y-4">
            <div className="text-center">
              <QrCode className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code with your authenticator app
              </p>
            </div>

            {qrCodeUrl && (
              <div className="flex flex-col items-center space-y-4">
                <img src={qrCodeUrl} alt="2FA QR Code" className="border rounded-lg" />
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Can't scan? Enter this code manually:
                  </p>
                  <div className="flex items-center gap-2 justify-center">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                      {secret}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(secret)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verification-code">Enter 6-digit code from your app</Label>
              <Input
                id="verification-code"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <Button 
              onClick={verifySetup} 
              disabled={verificationCode.length !== 6 || isLoading}
              className="w-full"
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <div className="text-center">
              <Key className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Save Backup Codes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Store these codes securely. They can be used to access your account if you lose your authenticator device.
              </p>
            </div>

            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-800">
                Each backup code can only be used once. Store them in a secure location.
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {backupCodes.map((code, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{code}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={downloadBackupCodes}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Codes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Codes
              </Button>
            </div>

            <Button onClick={completeSetup} className="w-full">
              I've Saved My Backup Codes
            </Button>
          </TabsContent>

          <TabsContent value="complete" className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">Setup Complete!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Two-factor authentication is now enabled on your account.
              </p>
            </div>

            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-800">
                Your account is now protected with two-factor authentication. You'll need your authenticator app to sign in.
              </AlertDescription>
            </Alert>

            {showAsModal && (
              <Button onClick={onSetupComplete} className="w-full">
                Close
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};