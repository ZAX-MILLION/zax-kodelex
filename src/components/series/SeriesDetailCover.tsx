import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import LazyImage from '@/components/LazyImage';
import { getOptimizedImageUrl, getFallbackCoverImage } from '@/utils/imageOptimization';
import { cn } from '@/lib/utils';

interface SeriesDetailCoverProps {
  seriesId: string;
  title: string;
  coverUrl?: string | null;
  status?: string | null;
  ageRating?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: { w: 120, h: 180, className: 'max-w-[120px]' },
  md: { w: 200, h: 300, className: 'max-w-[168px] xs:max-w-[200px] sm:max-w-[220px]' },
  lg: { w: 280, h: 420, className: 'max-w-[200px] sm:max-w-[260px] lg:max-w-[280px]' },
};

export function SeriesDetailCover({
  seriesId,
  title,
  coverUrl,
  status,
  ageRating,
  size = 'md',
  className,
}: SeriesDetailCoverProps) {
  const dims = SIZE_MAP[size];
  const coverSrc = getOptimizedImageUrl(
    coverUrl || getFallbackCoverImage(seriesId),
    dims.w,
    dims.h
  );

  return (
    <div className={cn('mx-auto w-full shrink-0 lg:mx-0', dims.className, className)}>
      <div className="group relative">
        <div className="pointer-events-none absolute -inset-2 rounded-2xl bg-gradient-to-r from-primary/15 to-secondary/15 opacity-50 blur-lg sm:-inset-3 sm:rounded-3xl sm:opacity-60" />
        <div className="relative overflow-hidden rounded-xl border border-border/30 shadow-xl sm:rounded-2xl">
          <LazyImage
            src={coverSrc}
            alt={title}
            width={dims.w}
            height={dims.h}
            className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {status && (
            <div className="absolute right-2 top-2">
              <Badge
                className={cn(
                  'border border-white/20 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg sm:text-xs',
                  status === 'ongoing' && 'bg-gradient-to-r from-emerald-500 to-green-600',
                  status === 'completed' && 'bg-gradient-to-r from-blue-500 to-cyan-600',
                  status !== 'ongoing' &&
                    status !== 'completed' &&
                    'bg-gradient-to-r from-orange-500 to-amber-600'
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          )}
          {ageRating && (
            <div className="absolute bottom-2 left-2">
              <Badge className="border-0 bg-black/75 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                {ageRating}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
