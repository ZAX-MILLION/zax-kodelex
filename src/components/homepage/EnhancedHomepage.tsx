import { useHomepageSettings, useSeriesData, useTrendingSeries } from '@/hooks/useHomepageData';
import { HeroSlider } from './HeroSlider';
import { SeriesGrid } from './SeriesGrid';
import { SidebarWidgets } from './SidebarWidgets';
import { WhatsHotSection } from './WhatsHotSection';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useEffect } from 'react';

export const EnhancedHomepage = () => {
  const { settings, loading: settingsLoading } = useHomepageSettings();
  const { series: latestSeries, loading: latestLoading, fetchSeries } = useSeriesData();
  const { trendingSeries, loading: trendingLoading } = useTrendingSeries();

  useEffect(() => {
    if (settings) {
      fetchSeries('latest', settings.latest_comics_count);
    }
  }, [settings]);

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse space-y-8 p-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <div className="space-y-8">
        {/* Hero Slider - Full Width */}
        {/* Hero Slider */}
        <HeroSlider 
          slidesCount={settings?.hero_slides_count}
          autoSlideInterval={settings?.auto_slide_interval}
          showFilters={settings?.show_content_type_filter}
        />

        {/* Boxed Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8 lg:space-y-12">
            {/* Latest Comics Section */}
            <SeriesGrid
              series={latestSeries}
              title="Latest Comics"
              description="Recently updated series and new releases"
              columns={4}
            />

            {/* Trending Section */}
            <SeriesGrid
              series={trendingSeries}
              title="Trending Now"
              description="Most popular series this week"
              columns={4}
              showViewMore={true}
            />
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            <SidebarWidgets trendingSeries={trendingSeries} />
          </div>
        </div>

        {/* What's Hot Section - Full Width */}
        <div className="mt-12">
          <WhatsHotSection />
          </div>
        </div>
      </div>
    </div>
  );
};