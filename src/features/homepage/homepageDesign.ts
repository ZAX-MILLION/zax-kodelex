export type HomepageDesignId = 'A' | 'B' | 'C' | 'D';

export const HOMEPAGE_DESIGN_DEFAULT: HomepageDesignId = 'C';

export const HOMEPAGE_DESIGN_META: Record<
  HomepageDesignId,
  { label: string; description: string; component: 'editorial' | 'cinematic' | 'catalogue' | 'conversion' }
> = {
  A: {
    label: 'Editorial Premium',
    description: 'Magazine-style typographic hero, refined cards, calm discovery lists.',
    component: 'editorial',
  },
  B: {
    label: 'Cinematic Showcase',
    description: 'Full-bleed hero artwork, film-strip carousels, immersive spotlight.',
    component: 'cinematic',
  },
  C: {
    label: 'Catalogue / Product',
    description: 'Search-first browse hub with category chips and uniform cover grids.',
    component: 'catalogue',
  },
  D: {
    label: 'Hybrid Conversion',
    description: 'Marketing landing flow with pricing bands, trust, and repeated CTAs.',
    component: 'conversion',
  },
};

const GLOBAL_KEY = 'zax-homepage-design-global';

const VALID: HomepageDesignId[] = ['A', 'B', 'C', 'D'];

function isDesignId(value: unknown): value is HomepageDesignId {
  return typeof value === 'string' && VALID.includes(value as HomepageDesignId);
}

export function getGlobalHomepageDesign(): HomepageDesignId {
  try {
    const v = localStorage.getItem(GLOBAL_KEY);
    if (isDesignId(v)) return v;
  } catch {
    /* ignore */
  }
  return HOMEPAGE_DESIGN_DEFAULT;
}

export function setGlobalHomepageDesign(design: HomepageDesignId | null) {
  try {
    if (design === null) localStorage.removeItem(GLOBAL_KEY);
    else localStorage.setItem(GLOBAL_KEY, design);
  } catch {
    /* ignore */
  }
}

export function resolveHomepageDesign(): HomepageDesignId {
  return getGlobalHomepageDesign();
}
