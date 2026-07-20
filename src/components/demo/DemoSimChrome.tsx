import { Link } from 'react-router-dom';
import { ArrowLeft, FlaskConical, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoRole } from '@/contexts/DemoRoleContext';

interface DemoSimChromeProps {
  title: string;
}

/** Shared nav for all demo role simulation pages. */
export function DemoSimChrome({ title }: DemoSimChromeProps) {
  const { resetDemo } = useDemoRole();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild className="min-h-11">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to website
          </Link>
        </Button>
        <Button variant="outline" asChild className="min-h-11">
          <Link to="/demo">
            <FlaskConical className="h-4 w-4 mr-2" />
            Switch role
          </Link>
        </Button>
        <Button
          variant="secondary"
          className="min-h-11"
          onClick={() => {
            resetDemo();
          }}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Demo
        </Button>
      </div>
    </div>
  );
}
