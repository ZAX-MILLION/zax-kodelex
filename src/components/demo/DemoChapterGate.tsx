import { Link } from 'react-router-dom';
import { Coins, Crown, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DemoAccessResult } from '@/contexts/DemoRoleContext';
import { useDemoRole } from '@/contexts/DemoRoleContext';

interface DemoChapterGateProps {
  chapterTitle: string;
  chapterId: string;
  seriesId: string;
  access: DemoAccessResult;
  previewImage?: string;
  onUnlocked?: () => void;
}

export function DemoChapterGate({
  chapterTitle,
  chapterId,
  seriesId,
  access,
  previewImage,
  onUnlocked,
}: DemoChapterGateProps) {
  const { coins, unlockChapterWithCoins, setActiveRole, activeRole } = useDemoRole();

  if (access.allowed) return null;

  const cost = 'cost' in access ? access.cost : 0;

  const handleUnlock = () => {
    const result = unlockChapterWithCoins(chapterId, cost);
    if (result.ok) {
      onUnlocked?.();
    } else {
      window.alert(result.message);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <Card className="max-w-lg w-full overflow-hidden border-border/50 bg-card/80">
        {previewImage ? (
          <div className="relative aspect-[16/9] overflow-hidden bg-muted">
            <img
              src={previewImage}
              alt=""
              width={800}
              height={450}
              className="h-full w-full object-cover blur-sm scale-105 opacity-60"
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          </div>
        ) : null}
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" aria-hidden />
              Demo locked chapter
            </Badge>
            {access.reason === 'premium' ? (
              <Badge variant="outline" className="gap-1">
                <Crown className="h-3 w-3" aria-hidden />
                Premium
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <Coins className="h-3 w-3" aria-hidden />
                {cost} coins
              </Badge>
            )}
          </div>
          <CardTitle className="text-2xl leading-tight">{chapterTitle}</CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This is a polished demo lock screen. No real payment runs here, and nothing is written
            to a database. Use Role Lab personas to preview access.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {access.reason === 'premium' ? (
            <>
              <p className="text-sm">
                Switch to <strong>Paid / Premium</strong> in Role Lab to open this sample chapter.
              </p>
              <Button
                className="w-full min-h-11"
                onClick={() => setActiveRole('paid')}
              >
                <Crown className="h-4 w-4 mr-2" />
                Use Premium demo role
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm">
                Current demo balance: <strong>{coins}</strong> coins
                {activeRole === 'guest' ? ' (Guest has 0 — switch to Member or Buyer).' : '.'}
              </p>
              {activeRole === 'guest' ? (
                <Button
                  className="w-full min-h-11"
                  onClick={() => setActiveRole('member')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Switch to Member (25 demo coins)
                </Button>
              ) : (
                <Button className="w-full min-h-11" onClick={handleUnlock}>
                  <Coins className="h-4 w-4 mr-2" />
                  Unlock with {cost} demo coins
                </Button>
              )}
              <Button variant="outline" asChild className="w-full min-h-11">
                <Link to="/demo/checkout">Simulate buyer checkout</Link>
              </Button>
            </>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="ghost" asChild className="min-h-11 flex-1">
              <Link to={`/series/${seriesId}`}>Back to series</Link>
            </Button>
            <Button variant="ghost" asChild className="min-h-11 flex-1">
              <Link to="/demo">Open Role Lab</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground" role="status">
            Session-only unlock. Reset Demo clears coins and unlocks. No real money was charged.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
