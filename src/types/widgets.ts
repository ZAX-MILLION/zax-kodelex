export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  enabled: boolean;
  order: number;
  settings: WidgetSettings;
}

export type WidgetType = 
  | 'hero-slider'
  | 'trending-carousel'
  | 'latest-comics'
  | 'whats-hot'
  | 'top-rated'
  | 'most-viewed'
  | 'recently-added'
  | 'recently-updated'
  | 'genre-filter'
  | 'author-highlights'
  | 'featured-novels'
  | 'new-comments'
  | 'random-pick'
  | 'reading-history'
  | 'continue-reading'
  | 'xp-progress'
  | 'leaderboards';

export interface WidgetSettings {
  itemCount?: number;
  seriesType?: 'manga' | 'novel' | 'both';
  showTitle?: boolean;
  columns?: number;
  autoSlide?: boolean;
  slideInterval?: number;
  showFilters?: boolean;
  sortBy?: 'latest' | 'popular' | 'trending' | 'rating' | 'new' | 'random';
}

export interface WidgetTemplate {
  type: WidgetType;
  name: string;
  description: string;
  defaultSettings: WidgetSettings;
  category: 'content' | 'navigation' | 'user' | 'interactive';
  icon: string;
}

export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    type: 'hero-slider',
    name: 'Hero Slider',
    description: 'Featured manga carousel with large images',
    defaultSettings: {
      itemCount: 10,
      seriesType: 'both',
      showTitle: true,
      autoSlide: true,
      slideInterval: 5000,
      showFilters: true,
      sortBy: 'trending'
    },
    category: 'content',
    icon: 'Image'
  },
  {
    type: 'trending-carousel',
    name: 'Trending Carousel',
    description: 'Horizontal scrolling trending series',
    defaultSettings: {
      itemCount: 10,
      seriesType: 'both',
      showTitle: true,
      sortBy: 'trending'
    },
    category: 'content',
    icon: 'TrendingUp'
  },
  {
    type: 'latest-comics',
    name: 'Latest Comics Grid',
    description: 'Grid of recently updated comics',
    defaultSettings: {
      itemCount: 12,
      seriesType: 'manga',
      showTitle: true,
      columns: 4,
      sortBy: 'latest'
    },
    category: 'content',
    icon: 'BookOpen'
  },
  {
    type: 'whats-hot',
    name: "What's Hot Articles",
    description: 'News and featured articles section',
    defaultSettings: {
      itemCount: 6,
      seriesType: 'both',
      showTitle: true,
      columns: 3
    },
    category: 'content',
    icon: 'Flame'
  },
  {
    type: 'top-rated',
    name: 'Top Rated',
    description: 'Highest rated series',
    defaultSettings: {
      itemCount: 8,
      seriesType: 'both',
      showTitle: true,
      columns: 4,
      sortBy: 'rating'
    },
    category: 'content',
    icon: 'Star'
  },
  {
    type: 'most-viewed',
    name: 'Most Viewed',
    description: 'Series with highest view counts',
    defaultSettings: {
      itemCount: 8,
      seriesType: 'both',
      showTitle: true,
      columns: 4,
      sortBy: 'popular'
    },
    category: 'content',
    icon: 'Eye'
  },
  {
    type: 'recently-added',
    name: 'Recently Added',
    description: 'Newest series on the platform',
    defaultSettings: {
      itemCount: 6,
      seriesType: 'both',
      showTitle: true,
      columns: 3
    },
    category: 'content',
    icon: 'Plus'
  },
  {
    type: 'recently-updated',
    name: 'Recently Updated',
    description: 'Series with recent chapter updates',
    defaultSettings: {
      itemCount: 10,
      seriesType: 'both',
      showTitle: true,
      columns: 5
    },
    category: 'content',
    icon: 'Clock'
  },
  {
    type: 'genre-filter',
    name: 'Genre Filter Block',
    description: 'Quick genre navigation buttons',
    defaultSettings: {
      seriesType: 'both',
      showTitle: true
    },
    category: 'navigation',
    icon: 'Filter'
  },
  {
    type: 'author-highlights',
    name: 'Author Highlights',
    description: 'Featured authors and their works',
    defaultSettings: {
      itemCount: 4,
      seriesType: 'both',
      showTitle: true
    },
    category: 'content',
    icon: 'User'
  },
  {
    type: 'featured-novels',
    name: 'Featured Novels',
    description: 'Specially curated novel selections',
    defaultSettings: {
      itemCount: 6,
      seriesType: 'novel',
      showTitle: true,
      columns: 3
    },
    category: 'content',
    icon: 'Book'
  },
  {
    type: 'new-comments',
    name: 'Recent Comments',
    description: 'Latest community comments',
    defaultSettings: {
      itemCount: 5,
      seriesType: 'both',
      showTitle: true
    },
    category: 'interactive',
    icon: 'MessageCircle'
  },
  {
    type: 'random-pick',
    name: 'Random Pick',
    description: 'Randomly selected series recommendation',
    defaultSettings: {
      itemCount: 1,
      seriesType: 'both',
      showTitle: true
    },
    category: 'content',
    icon: 'Shuffle'
  },
  {
    type: 'reading-history',
    name: 'Reading History',
    description: 'User reading history (logged in users)',
    defaultSettings: {
      itemCount: 8,
      seriesType: 'both',
      showTitle: true,
      columns: 4
    },
    category: 'user',
    icon: 'History'
  },
  {
    type: 'continue-reading',
    name: 'Continue Reading',
    description: 'Resume reading progress (logged in users)',
    defaultSettings: {
      itemCount: 6,
      seriesType: 'both',
      showTitle: true,
      columns: 3
    },
    category: 'user',
    icon: 'Play'
  },
  {
    type: 'xp-progress',
    name: 'XP Progress',
    description: 'User experience points and level',
    defaultSettings: {
      seriesType: 'both',
      showTitle: true
    },
    category: 'user',
    icon: 'Award'
  },
  {
    type: 'leaderboards',
    name: 'Leaderboards',
    description: 'Top users by reading activity',
    defaultSettings: {
      itemCount: 10,
      seriesType: 'both',
      showTitle: true
    },
    category: 'user',
    icon: 'Trophy'
  }
];