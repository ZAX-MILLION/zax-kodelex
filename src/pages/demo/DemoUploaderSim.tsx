import { Link } from 'react-router-dom';
import { Upload, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';
import { useDemoRole } from '@/contexts/DemoRoleContext';

/**
 * Lightweight uploader simulation — never writes to storage or Supabase.
 */
const DemoUploaderSim = () => {
  const { profile, clearRole } = useDemoRole();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-2xl space-y-6">
      <EnhancedSEOHelmet title="Uploader simulation" noindex />
      <Button variant="outline" asChild className="min-h-11">
        <Link to="/demo">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Role Lab
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Uploader preview ({profile?.displayName || 'Uploader'})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground" role="status">
            This action is simulated in the public demo. No production data was changed. Files are
            not uploaded.
          </p>
          <label className="block text-sm font-medium" htmlFor="demo-upload-title">
            Series title
          </label>
          <input
            id="demo-upload-title"
            className="w-full min-h-11 rounded-md border border-border bg-background px-3"
            placeholder="Demo series name"
            aria-describedby="demo-upload-hint"
          />
          <p id="demo-upload-hint" className="text-xs text-muted-foreground">
            Submit is blocked — no network write occurs.
          </p>
          <Button
            className="min-h-11 w-full"
            onClick={() => {
              window.alert(
                'This action is simulated in the public demo. No production data was changed.'
              );
            }}
          >
            Simulate submit
          </Button>
          <Button variant="ghost" className="min-h-11 w-full" onClick={clearRole}>
            Reset demo role
          </Button>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" />
        Real Author/Uploader routes stay behind authentication on staging/production.
      </p>
    </div>
  );
};

export default DemoUploaderSim;
