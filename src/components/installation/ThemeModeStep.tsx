import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Book, BookOpen, CheckCircle, Lock } from 'lucide-react';
import type { SetupData } from '@/pages/Setup';

interface ThemeModeStepProps {
  data: SetupData;
  onUpdate: (updates: Partial<SetupData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ThemeModeStep = ({ data, onUpdate, onNext, onPrev }: ThemeModeStepProps) => {
  const hasValidLicense = true;
  const licenseType = 'development';

  const selectThemeMode = (mode: 'single-series' | 'multi-series') => {
    onUpdate({ themeMode: mode });
  };

  const canSelectMultiSeries = true; // Always allow in development mode

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto mb-4 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full w-fit">
          <BookOpen className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Choose Theme Mode</h3>
        <p className="text-muted-foreground">
          Select the mode that best fits your manga platform needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Single Series Mode */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
            data.themeMode === 'single-series' 
              ? 'ring-2 ring-primary border-primary' 
              : 'hover:border-primary/50'
          }`}
          onClick={() => selectThemeMode('single-series')}
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit">
              <Book className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              Single-Series Mode
              <Badge variant="secondary">Free</Badge>
            </CardTitle>
            <CardDescription>
              Perfect for hosting one manga series
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Host one manga series</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Chapter management</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Reader functionality</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">User accounts & comments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Basic analytics</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Best for:</strong> Personal projects, single manga hosting, getting started
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Series Mode */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
            data.themeMode === 'multi-series' 
              ? 'ring-2 ring-primary border-primary' 
              : canSelectMultiSeries 
              ? 'hover:border-primary/50'
              : 'opacity-60 cursor-not-allowed'
          }`}
          onClick={() => canSelectMultiSeries && selectThemeMode('multi-series')}
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full w-fit">
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              Multi-Series Mode
              {canSelectMultiSeries ? (
                <Badge variant="default">Licensed</Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Requires License
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Professional platform for multiple manga series
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${canSelectMultiSeries ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className={`text-sm ${canSelectMultiSeries ? '' : 'text-muted-foreground'}`}>
                  Unlimited manga series
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${canSelectMultiSeries ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className={`text-sm ${canSelectMultiSeries ? '' : 'text-muted-foreground'}`}>
                  Series categorization
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${canSelectMultiSeries ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className={`text-sm ${canSelectMultiSeries ? '' : 'text-muted-foreground'}`}>
                  Advanced browse features
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${canSelectMultiSeries ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className={`text-sm ${canSelectMultiSeries ? '' : 'text-muted-foreground'}`}>
                  Series management tools
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${canSelectMultiSeries ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className={`text-sm ${canSelectMultiSeries ? '' : 'text-muted-foreground'}`}>
                  Professional features
                </span>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-lg ${
              canSelectMultiSeries 
                ? 'bg-purple-50 dark:bg-purple-950/20' 
                : 'bg-gray-50 dark:bg-gray-950/20'
            }`}>
              <p className={`text-xs ${
                canSelectMultiSeries
                  ? 'text-purple-700 dark:text-purple-300'
                  : 'text-muted-foreground'
              }`}>
                <strong>Best for:</strong> Commercial platforms, multiple series hosting, professional use
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* License Status */}
      {!canSelectMultiSeries && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              License Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Multi-series mode is available in development mode.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onPrev}>
                Go Back to Upload License
              </Button>
              <Button variant="outline" asChild>
                <a href="/contact" target="_blank">
                  Contact for License
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button 
          onClick={onNext}
          className="flex items-center gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};