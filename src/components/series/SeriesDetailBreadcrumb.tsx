import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface SeriesDetailBreadcrumbProps {
  title: string;
}

export function SeriesDetailBreadcrumb({ title }: SeriesDetailBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="container mx-auto px-4 pt-4">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm">
        <li>
          <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground">
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
        </li>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <li>
          <Link to="/series" className="hover:text-foreground">
            Series
          </Link>
        </li>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <li className="truncate font-medium text-foreground">{title}</li>
      </ol>
    </nav>
  );
}
