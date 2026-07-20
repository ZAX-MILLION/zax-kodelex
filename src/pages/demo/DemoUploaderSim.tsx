import { useEffect, useState } from 'react';
import { Upload, ShieldAlert, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';
import { DemoSimChrome } from '@/components/demo/DemoSimChrome';
import { useDemoRole } from '@/contexts/DemoRoleContext';
import { DEMO_SIMULATED_ACTION_MESSAGE } from '@/features/demo/demoAuthPolicy';

type Draft = { title: string; synopsis: string; status: 'draft' | 'preview' | 'published' };

/**
 * Lightweight uploader simulation — never writes to storage or Supabase.
 */
const DemoUploaderSim = () => {
  const { profile, setActiveRole, activeRole } = useDemoRole();
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (activeRole !== 'uploader') {
      setActiveRole('uploader');
    }
  }, [activeRole, setActiveRole]);

  const saveDraft = () => {
    if (!title.trim()) {
      setNotice('Add a series title first.');
      return;
    }
    setDrafts((prev) => [
      ...prev,
      { title: title.trim(), synopsis: synopsis.trim(), status: 'draft' },
    ]);
    setNotice(DEMO_SIMULATED_ACTION_MESSAGE + ' Draft kept in this session only.');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-2xl space-y-6">
      <EnhancedSEOHelmet title="Uploader simulation" noindex />
      <DemoSimChrome title="Uploader simulation" />
      {notice && (
        <p className="text-sm rounded-lg border border-primary/30 bg-primary/10 px-4 py-3" role="status">
          {notice}
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Uploader preview ({profile?.displayName || 'Uploader'})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block text-sm font-medium" htmlFor="demo-upload-title">
            Series title
          </label>
          <input
            id="demo-upload-title"
            className="w-full min-h-11 rounded-md border border-border bg-background px-3"
            placeholder="Demo series name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label className="block text-sm font-medium" htmlFor="demo-upload-synopsis">
            Synopsis
          </label>
          <textarea
            id="demo-upload-synopsis"
            className="w-full min-h-[96px] rounded-md border border-border bg-background px-3 py-2"
            placeholder="Short description"
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button className="min-h-11 flex-1" onClick={saveDraft}>
              Save temporary draft
            </Button>
            <Button
              variant="secondary"
              className="min-h-11 flex-1"
              onClick={() => {
                if (!title.trim()) {
                  setNotice('Add a series title first.');
                  return;
                }
                setDrafts((prev) => [
                  ...prev,
                  { title: title.trim(), synopsis: synopsis.trim(), status: 'preview' },
                ]);
                setNotice(DEMO_SIMULATED_ACTION_MESSAGE + ' Preview is local only.');
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview draft
            </Button>
            <Button
              variant="outline"
              className="min-h-11 flex-1"
              onClick={() => {
                window.alert(DEMO_SIMULATED_ACTION_MESSAGE);
                setDrafts((prev) =>
                  prev.map((d) => ({ ...d, status: 'published' as const }))
                );
                setNotice(DEMO_SIMULATED_ACTION_MESSAGE + ' Publish simulated.');
              }}
            >
              Simulate publish
            </Button>
          </div>
        </CardContent>
      </Card>

      {drafts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Session drafts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {drafts.map((d, i) => (
              <div key={`${d.title}-${i}`} className="rounded-lg border border-border/60 p-3 text-sm">
                <p className="font-medium">{d.title}</p>
                <p className="text-muted-foreground">{d.synopsis || 'No synopsis'}</p>
                <p className="text-xs mt-1 uppercase tracking-wide">{d.status}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" />
        Real Author/Uploader routes stay behind authentication on staging/production. No files upload here.
      </p>
    </div>
  );
};

export default DemoUploaderSim;
