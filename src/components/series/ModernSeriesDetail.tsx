import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { Link, useParams } from 'react-router-dom';

import { SeriesDetailsBackground } from './SeriesDetailsBackground';

import { SeriesDetailHero } from './SeriesDetailHero';

import { SeriesDetailMetadata } from './SeriesDetailMetadata';

import { SeriesDetailReadingActions } from './SeriesDetailReadingActions';

import {

  SeriesDetailTabs,

  SeriesDetailTabPanel,

  type SeriesDetailTabId,

} from './SeriesDetailTabs';

import { DemoSeriesCommentsPanel } from './DemoSeriesCommentsPanel';

import { SeriesComments } from './SeriesComments';

import { SeriesReviews } from './SeriesReviews';

import { SeriesRelatedTitles } from './SeriesRelatedTitles';

import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';

import { supabase } from '@/integrations/supabase/client';

import { useToast } from '@/hooks/use-toast';

import { appConfig } from '@/config/env';

import ModernChapterGrid, { type SeriesChapterItem } from './ModernChapterGrid';

import { getOptimizedImageUrl, getFallbackCoverImage } from '@/utils/imageOptimization';

import {

  activateDemoMode,

  getDemoChaptersForSeries,

  getDemoSeriesById,

  getRelatedDemoSeries,

  isDemoSeriesId,

  shouldUseOfflineDemo,

  type DemoSeries,

} from '@/utils/demoLibraryData';

import {

  getContinueChapterNumber,

  getSeriesReadingState,

  setContinueChapterNumber,

  shareSeries,

  toggleSeriesLibrary,

} from '@/features/series/seriesReadingProgress';

import type { SeriesDetailViewModel } from './SeriesDetailHero';

import { ChevronRight, Home } from 'lucide-react';



interface MangaSeries extends SeriesDetailViewModel {

  details_background_url?: string | null;

  tags: string[];

}



function mapDemoSeriesToDetail(demoSeries: DemoSeries): MangaSeries {

  return {

    id: demoSeries.id,

    title: demoSeries.title,

    alt_title: demoSeries.alt_title,

    description: demoSeries.description,

    author: demoSeries.author,

    artist: demoSeries.artist || demoSeries.author,

    cover_image_url: demoSeries.cover_image_url,

    status: demoSeries.status,

    genres: demoSeries.genres,

    tags: demoSeries.tags,

    content_type: demoSeries.content_type,

    format: demoSeries.format,

    rating_average: demoSeries.rating_average,

    rating_count: demoSeries.rating_count,

    view_count: demoSeries.view_count,

    followers_count: demoSeries.followers_count,

    language: demoSeries.language,

    publication_date: demoSeries.publication_date,

    updated_at: demoSeries.updated_at,

    age_rating: demoSeries.age_rating,

    details_background_url: demoSeries.details_background_url ?? null,

  };

}



function mapDemoChapters(demoSeries: DemoSeries, seriesId: string): SeriesChapterItem[] {

  return getDemoChaptersForSeries(seriesId).map((chapter) => ({

    id: chapter.id,

    title: chapter.title,

    chapter_number: chapter.chapter_number,

    page_count: chapter.page_count,

    release_date: chapter.release_date,

    view_count: chapter.view_count,

    is_locked: chapter.is_locked,

    unlock_cost: chapter.unlock_cost,

    thumbnail_url: demoSeries.cover_image_url,

    access_type: chapter.access_type,

    comment_count: chapter.comment_count,

  }));

}



function getStartChapterNumber(chapters: SeriesChapterItem[], seriesId: string): number {

  const continued = getContinueChapterNumber(seriesId);

  if (continued != null && chapters.some((c) => c.chapter_number === continued)) {

    return continued;

  }

  const chronological = [...chapters].sort((a, b) => a.chapter_number - b.chapter_number);

  const free = chronological.find((c) => c.access_type === 'free' || !c.is_locked);

  return (free || chronological[0])?.chapter_number ?? 1;

}



function collectAccessBadges(chapters: SeriesChapterItem[]): Array<'free' | 'coins' | 'premium'> {

  const badges = new Set<'free' | 'coins' | 'premium'>();

  chapters.forEach((c) => {

    if (c.access_type === 'premium') badges.add('premium');

    else if (c.access_type === 'coins' || (c.is_locked && c.unlock_cost > 0)) badges.add('coins');

    else badges.add('free');

  });

  return [...badges];

}



function demoSeriesIndex(id: string): number {

  const match = id.match(/a000-(\d+)$/);

  return match ? parseInt(match[1], 10) - 1 : 0;

}



const ModernSeriesDetail = () => {

  const { id } = useParams<{ id: string }>();

  const { toast } = useToast();

  const [series, setSeries] = useState<MangaSeries | null>(null);

  const [chapters, setChapters] = useState<SeriesChapterItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<SeriesDetailTabId>('overview');

  const [readingState, setReadingState] = useState(() =>

    id ? getSeriesReadingState(id, 0) : getSeriesReadingState('_', 0)

  );

  const isDemo = id ? isDemoSeriesId(id) || shouldUseOfflineDemo() : shouldUseOfflineDemo();



  const refreshReadingState = useCallback(() => {

    if (!series) return;

    setReadingState(getSeriesReadingState(series.id, chapters.length));

  }, [series, chapters.length]);



  useEffect(() => {

    if (id) fetchSeriesData();

  }, [id]);



  useEffect(() => {

    refreshReadingState();

  }, [chapters.length, series?.id, refreshReadingState]);



  const fetchSeriesData = async () => {

    if (!id) return;

    try {

      setLoading(true);



      if (isDemoSeriesId(id)) {

        const demoSeries = getDemoSeriesById(id);

        if (demoSeries) {

          activateDemoMode();

          setSeries(mapDemoSeriesToDetail(demoSeries));

          setChapters(mapDemoChapters(demoSeries, id));

          return;

        }

      }



      if (shouldUseOfflineDemo()) {

        const demoSeries = getDemoSeriesById(id);

        if (demoSeries) {

          activateDemoMode();

          setSeries(mapDemoSeriesToDetail(demoSeries));

          setChapters(mapDemoChapters(demoSeries, id));

          return;

        }

      }



      const { data: seriesData, error: seriesError } = await supabase

        .from('manga_meta')

        .select('*')

        .eq('id', id)

        .single();

      if (seriesError) throw seriesError;



      if (seriesData) {

        await supabase

          .from('manga_meta')

          .update({ view_count: (seriesData.view_count || 0) + 1 })

          .eq('id', id);

      }



      const { data: chaptersData, error: chaptersError } = await supabase.rpc(

        'get_series_chapter_listings',

        { series_id_param: id }

      );

      if (chaptersError) throw chaptersError;



      setSeries(seriesData as MangaSeries);

      setChapters((chaptersData as SeriesChapterItem[]) || []);

    } catch (error) {

      console.error('Error fetching series data:', error);

      const demoSeries = id ? getDemoSeriesById(id) : undefined;

      if (demoSeries) {

        activateDemoMode();

        setSeries(mapDemoSeriesToDetail(demoSeries));

        setChapters(mapDemoChapters(demoSeries, demoSeries.id));

        return;

      }

      toast({

        title: 'Error',

        description: 'Failed to load series data',

        variant: 'destructive',

      });

    } finally {

      setLoading(false);

    }

  };



  const startChapter = chapters.length > 0 && series ? getStartChapterNumber(chapters, series.id) : 1;

  const continueLabel = readingState.continueChapter != null ? 'Continue Reading' : 'Start Reading';

  const accessBadges = useMemo(() => collectAccessBadges(chapters), [chapters]);

  const relatedSeries = useMemo(

    () => (series && isDemoSeriesId(series.id) ? getRelatedDemoSeries(series.id, 8) : []),

    [series]

  );



  const handleContinue = () => {

    if (!series) return;

    setContinueChapterNumber(series.id, startChapter);

    refreshReadingState();

  };



  const handleLibraryToggle = () => {

    if (!series) return;

    const added = toggleSeriesLibrary(series.id);

    refreshReadingState();

    toast({

      title: added ? 'Added to library' : 'Removed from library',

      description: isDemo ? 'Saved locally for this demo session.' : undefined,

    });

  };



  const handleShare = async () => {

    if (!series) return;

    const result = await shareSeries(series.id, series.title);

    if (result === 'shared') {

      toast({ title: 'Shared', description: 'Thanks for spreading the word!' });

    } else if (result === 'copied') {

      toast({ title: 'Link copied', description: 'Series URL copied to clipboard.' });

    } else {

      toast({ title: 'Share failed', variant: 'destructive' });

    }

  };



  const seoImage = series

    ? getOptimizedImageUrl(series.cover_image_url || getFallbackCoverImage(series.id), 1200, 630)

    : undefined;



  const structuredData = series

    ? {

        '@context': 'https://schema.org',

        '@type': 'BookSeries',

        name: series.title,

        author: series.author ? { '@type': 'Person', name: series.author } : undefined,

        description: series.description,

        genre: series.genres,

        aggregateRating:

          series.rating_average && series.rating_count

            ? {

                '@type': 'AggregateRating',

                ratingValue: series.rating_average,

                reviewCount: series.rating_count,

              }

            : undefined,

      }

    : undefined;



  if (loading) {

    return (

      <SeriesDetailsBackground seriesId={id || '_loading_'}>

        <div className="container mx-auto px-4 py-8 sm:py-10">

          <div className="animate-pulse space-y-6">

            <div className="mx-auto h-56 max-w-[200px] rounded-2xl bg-muted/40 sm:mx-0 sm:h-72 sm:max-w-[220px]" />

            <div className="h-10 max-w-xl rounded-xl bg-muted/30" />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

              {[...Array(4)].map((_, i) => (

                <div key={i} className="h-20 rounded-xl bg-muted/30" />

              ))}

            </div>

          </div>

        </div>

      </SeriesDetailsBackground>

    );

  }



  if (!series) {

    return (

      <SeriesDetailsBackground seriesId={id || '_missing_'}>

        <div className="container mx-auto px-4 py-12">

          <div className="rounded-3xl border border-border/30 bg-card/70 p-10 text-center backdrop-blur-xl sm:p-16">

            <div className="mb-6 text-6xl sm:text-8xl">🔍</div>

            <h1 className="mb-4 text-2xl font-bold sm:text-4xl">Series not found</h1>

            <p className="text-base text-muted-foreground sm:text-lg">

              The series you&apos;re looking for doesn&apos;t exist or has been removed.

            </p>

          </div>

        </div>

      </SeriesDetailsBackground>

    );

  }



  const coverForBg = series.cover_image_url || getFallbackCoverImage(series.id);



  return (

    <SeriesDetailsBackground

      seriesId={series.id}

      seriesCustomUrl={series.details_background_url}

      coverImageUrl={coverForBg}

    >

      <EnhancedSEOHelmet

        title={`${series.title} — Read Online`}

        description={

          series.description?.slice(0, 160) ||

          `Read ${series.title} on ZAX Million.`

        }

        image={seoImage}

        type="book"

        author={series.author || undefined}

        tags={series.genres || []}

        canonical={`${appConfig.siteUrl}${appConfig.basePath.replace(/\/$/, '')}/series/${series.id}`}

        noindex={appConfig.shouldNoIndex}

        schema={structuredData}

        customMeta={[

          { property: 'og:type', content: 'book' },

          { name: 'twitter:card', content: 'summary_large_image' },

        ]}

      />



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

          <li className="truncate font-medium text-foreground">{series.title}</li>

        </ol>

      </nav>



      <SeriesDetailHero series={series} accessBadges={accessBadges} />



      <div className="container mx-auto px-4 pb-24 lg:pb-8">

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">

          <div className="lg:col-span-8 xl:col-span-9">

            <div className="lg:hidden">

              <SeriesDetailReadingActions

                seriesId={series.id}

                seriesTitle={series.title}

                startChapter={startChapter}

                continueLabel={continueLabel}

                progressPercent={readingState.progressPercent}

                isInLibrary={readingState.isInLibrary}

                hasChapters={chapters.length > 0}

                accessBadges={accessBadges}

                onContinue={handleContinue}

                onLibraryToggle={handleLibraryToggle}

                onShare={handleShare}

                variant="inline"

              />

            </div>



            <SeriesDetailTabs

              activeTab={activeTab}

              onTabChange={setActiveTab}

              chapterCount={chapters.length}

            />



            <SeriesDetailTabPanel id="overview" activeTab={activeTab}>

              <SeriesDetailMetadata series={series} chapterCount={chapters.length} />

            </SeriesDetailTabPanel>



            <SeriesDetailTabPanel id="chapters" activeTab={activeTab}>

              <ModernChapterGrid chapters={chapters} seriesId={series.id} />

            </SeriesDetailTabPanel>



            <SeriesDetailTabPanel id="comments" activeTab={activeTab}>

              <div className="rounded-lg border border-border/25 bg-card/70 p-4 backdrop-blur-sm sm:p-6">

                {isDemo || isDemoSeriesId(series.id) ? (

                  <DemoSeriesCommentsPanel seriesId={series.id} seriesTitle={series.title} />

                ) : (

                  <SeriesComments seriesId={series.id} seriesTitle={series.title} />

                )}

              </div>

            </SeriesDetailTabPanel>



            <SeriesDetailTabPanel id="reviews" activeTab={activeTab}>

              <SeriesReviews seriesId={series.id} seriesIndex={demoSeriesIndex(series.id)} />

            </SeriesDetailTabPanel>



            <SeriesDetailTabPanel id="related" activeTab={activeTab}>

              <SeriesRelatedTitles series={relatedSeries} currentTitle={series.title} />

            </SeriesDetailTabPanel>

          </div>



          <div className="hidden lg:col-span-4 lg:block xl:col-span-3">

            <SeriesDetailReadingActions

              seriesId={series.id}

              seriesTitle={series.title}

              startChapter={startChapter}

              continueLabel={continueLabel}

              progressPercent={readingState.progressPercent}

              isInLibrary={readingState.isInLibrary}

              hasChapters={chapters.length > 0}

              accessBadges={accessBadges}

              onContinue={handleContinue}

              onLibraryToggle={handleLibraryToggle}

              onShare={handleShare}

              variant="sidebar"

            />

          </div>

        </div>

      </div>



      <SeriesDetailReadingActions

        seriesId={series.id}

        seriesTitle={series.title}

        startChapter={startChapter}

        continueLabel={continueLabel}

        progressPercent={readingState.progressPercent}

        isInLibrary={readingState.isInLibrary}

        hasChapters={chapters.length > 0}

        accessBadges={accessBadges}

        onContinue={handleContinue}

        onLibraryToggle={handleLibraryToggle}

        onShare={handleShare}

        variant="mobile-bar"

      />

    </SeriesDetailsBackground>

  );

};



export default ModernSeriesDetail;


