import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { TrendingUp, Clock, Shuffle, Star, Eye } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SeriesCard, useSeriesData } from '@/hooks/useHomepageData';
import LazyImage from '@/components/LazyImage';
import { Link } from 'react-router-dom';
import Autoplay from 'embla-carousel-autoplay';
import { getOptimizedImageUrl, getResponsiveSizes, getFallbackCoverImage } from '@/utils/imageOptimization';

interface HeroSliderProps {
  slidesCount?: number;
  autoSlideInterval?: number;
  showFilters?: boolean;
  sortBy?: 'trending' | 'new' | 'random';
}

export const HeroSlider = ({
  slidesCount = 10,
  autoSlideInterval = 3000,
  showFilters = true,
  sortBy = 'trending'
}: HeroSliderProps) => {
  const {
    series,
    loading,
    fetchSeries,
    recordSeriesView
  } = useSeriesData();

  const [currentFilter, setCurrentFilter] = useState<'trending' | 'new' | 'random'>(sortBy);

  useEffect(() => {
    fetchSeries(currentFilter, slidesCount * 2); // Fetch more for smooth infinite scroll
  }, [currentFilter, slidesCount]);

  const handleSeriesClick = (seriesId: string) => {
    recordSeriesView(seriesId);
  };

  if (loading) {
    return (
      <div className="w-full mb-8">
        <div className="relative h-[400px] bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-lg text-muted-foreground">Loading featured series...</div>
          </div>
        </div>
      </div>
    );
  }

  // Use original series without duplication to avoid repeated covers
  const displaySeries = series;

  return (
    <TooltipProvider>
      <div className="w-full mb-4 sm:mb-6">
        {/* Compact icon filters */}
        {showFilters && (
          <div className="mb-3 flex justify-center">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Show trending series"
                    onClick={() => setCurrentFilter('trending')}
                    className={`min-h-11 min-w-11 w-11 h-11 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      currentFilter === 'trending' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Trending</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Show latest series"
                    onClick={() => setCurrentFilter('new')}
                    className={`min-h-11 min-w-11 w-11 h-11 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      currentFilter === 'new' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Latest</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Show random series"
                    onClick={() => setCurrentFilter('random')}
                    className={`min-h-11 min-w-11 w-11 h-11 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      currentFilter === 'random' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Shuffle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Random</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}

        {/* Infinite Carousel */}
        <div className="relative container mx-auto px-3 sm:px-4 lg:px-8">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              skipSnaps: false,
            }}
            plugins={[
              Autoplay({
                delay: autoSlideInterval,
                stopOnInteraction: true,
                stopOnMouseEnter: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-4">
              {displaySeries.map((item: SeriesCard, index: number) => (
                <CarouselItem key={item.id} className="pl-3 sm:pl-4 basis-[82%] sm:basis-[70%] md:basis-1/3 lg:basis-1/5 xl:basis-1/6">
                  <Link 
                    to={`/series/${item.id}`} 
                    onClick={() => handleSeriesClick(item.id)} 
                    className="block group"
                  >
                    <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] bg-card">
                      {/* Fixed aspect ratio container - 2:3 ratio */}
                      <div className="relative w-full aspect-[2/3] overflow-hidden">
                        <LazyImage 
                          src={item.cover_image_url || getFallbackCoverImage(item.id)}
                          alt={item.title} 
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110" 
                          sizes={getResponsiveSizes('hero')}
                          loading={index < 4 ? 'eager' : 'lazy'}
                          width={400}
                          height={600}
                          fill={true}
                        />
                        
                        {/* Gradient overlay for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-300" />
                        
                        {/* Rating badge */}
                        <div className="absolute top-2 left-2 hidden md:flex bg-yellow-500/90 backdrop-blur-sm text-black px-2 py-1 rounded-full text-xs font-bold items-center gap-1 shadow-lg">
                          <Star className="h-3 w-3 fill-current" />
                          <span>4.{Math.floor(Math.random() * 9) + 1}</span>
                        </div>
                        
                        {/* Status indicator */}
                        {item.status && (
                          <div className="absolute top-2 right-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              item.status === 'ongoing' ? 'bg-green-500' : 
                              item.status === 'completed' ? 'bg-blue-500' : 
                              item.status === 'hiatus' ? 'bg-orange-500' : 'bg-red-500'
                            } shadow-lg`} />
                          </div>
                        )}
                        
                        {/* Title and view count */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-white font-bold text-xs sm:text-sm leading-tight line-clamp-2 drop-shadow-lg mb-1">
                            {item.title}
                          </h3>
                          <div className="hidden md:flex items-center gap-1 text-white/90 text-xs">
                            <Eye className="h-3 w-3" />
                            <span>{(item.view_count || Math.floor(Math.random() * 50000) + 1000).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 border-white/20 text-white backdrop-blur-sm min-h-11 min-w-11" />
            <CarouselNext className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 border-white/20 text-white backdrop-blur-sm min-h-11 min-w-11" />
          </Carousel>
        </div>
      </div>
    </TooltipProvider>
  );
};