import { BookOpen, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/config/env';
import { DEMO_BANNER_COPY } from '@/features/demo/demoAuthPolicy';

interface DemoModeBannerProps {
  visible?: boolean;
}

export const DemoModeBanner = ({ visible = false }: DemoModeBannerProps) => {
  if (!visible) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
        <div className="flex items-start gap-3">
          <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-muted-foreground">{DEMO_BANNER_COPY}</p>
        </div>
        {appConfig.features.roleLab && !appConfig.isDemo && (
          <Button variant="outline" size="sm" asChild className="shrink-0 w-full sm:w-auto min-h-11">
            <Link to="/demo">
              <FlaskConical className="h-4 w-4 mr-2" />
              Role Lab
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default DemoModeBanner;
