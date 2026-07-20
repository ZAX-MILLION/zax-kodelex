import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';
import { useDemoRole } from '@/contexts/DemoRoleContext';

/**
 * Lightweight admin simulation — MUST NOT import the real Admin page (~920KB).
 */
const DemoAdminSim = () => {
  const { clearRole } = useDemoRole();

  const fakeActions = [
    'Change site theme',
    'Edit SEO settings',
    'Manage users',
    'Refund an order',
    'Deploy plugins',
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-3xl space-y-6">
      <EnhancedSEOHelmet title="Admin simulation" noindex />
      <Button variant="outline" asChild className="min-h-11">
        <Link to="/demo">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Role Lab
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin dashboard (simulation)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground" role="status">
            This is a static preview. The production Admin bundle is not loaded. Nothing here can
            change real settings, users, or payments.
          </p>
          <ul className="space-y-2">
            {fakeActions.map((label) => (
              <li key={label}>
                <Button
                  variant="outline"
                  className="w-full justify-between min-h-11"
                  onClick={() =>
                    window.alert(
                      'This action is simulated in the public demo. No production data was changed.'
                    )
                  }
                >
                  {label}
                  <Ban className="h-4 w-4 text-muted-foreground" />
                </Button>
              </li>
            ))}
          </ul>
          <Button variant="ghost" className="min-h-11 w-full" onClick={clearRole}>
            Reset demo role
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoAdminSim;
