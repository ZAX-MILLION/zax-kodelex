import { Link } from 'react-router-dom';
import { Coins, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';
import { COIN_PACKAGES } from '@/payments/catalog';
import { useDemoRole } from '@/contexts/DemoRoleContext';

/** Simulated checkout — never calls PayPal or Edge Functions. */
const DemoCheckoutSim = () => {
  const { clearRole, grantDemoCoins, setActiveRole, coins } = useDemoRole();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-lg space-y-6">
      <EnhancedSEOHelmet title="Demo checkout" noindex />
      <Button variant="outline" asChild className="min-h-11">
        <Link to="/demo">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Role Lab
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Test buyer checkout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-amber-500/90" role="status">
            Demo only — no real charges. PayPal SDK is not loaded on this page.
          </p>
          <p className="text-sm text-muted-foreground">
            Current demo balance: <strong>{coins}</strong> coins
          </p>
          <ul className="space-y-2 text-sm">
            {COIN_PACKAGES.map((pack) => (
              <li key={pack.id} className="flex justify-between border-b border-border/40 py-2">
                <span>{pack.label}</span>
                <span>${pack.amountUsd.toFixed(2)} USD</span>
              </li>
            ))}
          </ul>
          <Button
            className="w-full min-h-11"
            onClick={() => {
              setActiveRole('buyer');
              grantDemoCoins(100);
              window.alert(
                'Simulated success. +100 temporary demo coins added for this browser session. No payment gateway was contacted.'
              );
            }}
          >
            Simulate successful payment (+100 coins)
          </Button>
          <Button
            variant="outline"
            className="w-full min-h-11"
            onClick={() => window.alert('Simulated decline. No gateway call occurred.')}
          >
            Simulate declined payment
          </Button>
          <Button variant="ghost" className="w-full min-h-11" onClick={clearRole}>
            Reset Demo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoCheckoutSim;
