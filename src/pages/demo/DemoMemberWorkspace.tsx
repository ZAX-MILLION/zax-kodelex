import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Crown, History, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';
import { DemoSimChrome } from '@/components/demo/DemoSimChrome';
import { useDemoRole } from '@/contexts/DemoRoleContext';
import type { DemoRoleId } from '@/config/env';
import { DEMO_SIMULATED_ACTION_MESSAGE } from '@/features/demo/demoAuthPolicy';
import { getDemoSeriesList } from '@/utils/demoLibraryData';

interface DemoMemberWorkspaceProps {
  role: Extract<DemoRoleId, 'member' | 'paid' | 'buyer'>;
  title: string;
  seoTitle: string;
}

const DemoMemberWorkspace = ({ role, title, seoTitle }: DemoMemberWorkspaceProps) => {
  const { setActiveRole, profile, coins, activeRole, unlockedChapterIds } = useDemoRole();
  const catalogue = getDemoSeriesList().slice(0, 3);

  useEffect(() => {
    if (activeRole !== role) {
      setActiveRole(role);
    }
  }, [activeRole, role, setActiveRole]);

  const isPremium = role === 'paid' || profile?.isPremium;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl space-y-6">
      <EnhancedSEOHelmet title={seoTitle} noindex />
      <DemoSimChrome title={title} />

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            {profile?.displayName ?? title}
            {isPremium && (
              <Badge variant="secondary" className="gap-1">
                <Crown className="h-3 w-3" />
                Premium
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Session-only demo persona. No account was created and Supabase Auth was not contacted.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="outline">{coins} demo coins</Badge>
          <Badge variant="outline">{unlockedChapterIds.length} temporary unlocks</Badge>
          <Badge variant="outline">{profile?.email ?? `${role}@demo.local`}</Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Continue reading
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {catalogue.map((series) => (
              <Button key={series.id} variant="outline" asChild className="w-full min-h-11 justify-start">
                <Link to={`/series/${series.id}`}>{series.title}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4" />
              Temporary favorites
            </CardTitle>
            <CardDescription>Stored in this browser tab only</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {isPremium
                ? 'Premium demo chapters are unlocked. Ads stay off in this preview, and premium theme accents appear on this badge.'
                : 'Spend demo coins on a coin-locked sample chapter from any featured series.'}
            </p>
            {isPremium && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
                Ad-free reading preview · Premium theme accent active for this session
              </div>
            )}
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Reading history (temporary): last opened featured series</li>
              <li>Favorites (temporary): pin series from Continue reading</li>
            </ul>
            <Button
              variant="secondary"
              className="w-full min-h-11"
              onClick={() => window.alert(DEMO_SIMULATED_ACTION_MESSAGE)}
            >
              <History className="h-4 w-4 mr-2" />
              Simulate add to history
            </Button>
            {role === 'buyer' && (
              <Button asChild className="w-full min-h-11">
                <Link to="/demo/checkout">Open demo checkout</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DemoMemberWorkspace;
