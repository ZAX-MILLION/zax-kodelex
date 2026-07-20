/**
 * Seeded demo chapter comments — local only, never written to Supabase.
 * Fictional usernames only.
 */

export interface DemoCommentSeed {
  id: string;
  chapterKey: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
  pinned?: boolean;
  parentId?: string | null;
}

/** chapterKey = `${seriesIndex}-${chapterNumber}` e.g. `0-1` for first featured series ch.1 */
export const DEMO_COMMENT_SEEDS: DemoCommentSeed[] = [
  // Crimson Blade Chronicles — Ch.1 (popular)
  {
    id: 'dc-c0-1-1',
    chapterKey: '0-1',
    author: 'InkFox',
    content: 'That opening panel hit hard. The pacing already feels sharper than most openers.',
    createdAt: '2026-06-12T10:00:00.000Z',
    likes: 42,
    pinned: true,
  },
  {
    id: 'dc-c0-1-2',
    chapterKey: '0-1',
    author: 'NightScroll',
    content: 'The ink work on the sword clash is gorgeous. Instantly hooked.',
    createdAt: '2026-06-12T11:20:00.000Z',
    likes: 28,
  },
  {
    id: 'dc-c0-1-3',
    chapterKey: '0-1',
    author: 'TeaAndPanels',
    content: 'Anyone else re-read the last three pages? Something big is coming.',
    createdAt: '2026-06-12T14:05:00.000Z',
    likes: 19,
  },
  {
    id: 'dc-c0-1-4',
    chapterKey: '0-1',
    author: 'QuietReader',
    content: 'Same — that silhouette shot is going to haunt me until chapter 2.',
    createdAt: '2026-06-12T15:10:00.000Z',
    likes: 11,
    parentId: 'dc-c0-1-3',
  },
  {
    id: 'dc-c0-1-5',
    chapterKey: '0-1',
    author: 'PanelHopper',
    content: 'Short and punchy. Perfect commute read.',
    createdAt: '2026-06-13T08:00:00.000Z',
    likes: 7,
  },
  {
    id: 'dc-c0-1-6',
    chapterKey: '0-1',
    author: 'GoldBookmark',
    content: 'Adding this to my weekly list already.',
    createdAt: '2026-06-13T09:30:00.000Z',
    likes: 15,
  },
  {
    id: 'dc-c0-1-7',
    chapterKey: '0-1',
    author: 'ScrollSage',
    content: 'Love the vertical flow. Feels designed for phone reading.',
    createdAt: '2026-06-14T12:00:00.000Z',
    likes: 22,
  },
  {
    id: 'dc-c0-1-8',
    chapterKey: '0-1',
    author: 'MoonInk',
    content: 'Staff pick energy. Excited for the free sample run.',
    createdAt: '2026-06-14T16:45:00.000Z',
    likes: 9,
  },

  // Crimson Blade — Ch.2
  {
    id: 'dc-c0-2-1',
    chapterKey: '0-2',
    author: 'InkFox',
    content: 'Chapter 2 raises the stakes without rushing. Nice balance.',
    createdAt: '2026-06-20T10:00:00.000Z',
    likes: 18,
  },
  {
    id: 'dc-c0-2-2',
    chapterKey: '0-2',
    author: 'ForgeFan',
    content: 'That mid-chapter reveal was clean. Didn’t see it coming.',
    createdAt: '2026-06-20T12:30:00.000Z',
    likes: 13,
  },
  {
    id: 'dc-c0-2-3',
    chapterKey: '0-2',
    author: 'QuietReader',
    content: 'Same! The dialogue timing sold it.',
    createdAt: '2026-06-20T13:00:00.000Z',
    likes: 4,
    parentId: 'dc-c0-2-2',
  },
  {
    id: 'dc-c0-2-4',
    chapterKey: '0-2',
    author: 'NightScroll',
    content: 'Art still consistent. Rare for early chapters.',
    createdAt: '2026-06-21T09:00:00.000Z',
    likes: 8,
  },

  // Crimson Blade — Ch.3 (premium-ish / fewer)
  {
    id: 'dc-c0-3-1',
    chapterKey: '0-3',
    author: 'GoldBookmark',
    content: 'Worth unlocking. The cliffhanger is unfair in the best way.',
    createdAt: '2026-06-28T11:00:00.000Z',
    likes: 25,
  },
  {
    id: 'dc-c0-3-2',
    chapterKey: '0-3',
    author: 'PanelHopper',
    content: 'Calling it now: rival shows up next arc.',
    createdAt: '2026-06-28T15:20:00.000Z',
    likes: 12,
  },

  // Dragon Throne Wars — Ch.1
  {
    id: 'dc-c1-1-1',
    chapterKey: '1-1',
    author: 'ThroneWatcher',
    content: 'Court intrigue already? I’m in.',
    createdAt: '2026-06-15T10:00:00.000Z',
    likes: 31,
    pinned: true,
  },
  {
    id: 'dc-c1-1-2',
    chapterKey: '1-1',
    author: 'TeaAndPanels',
    content: 'The color palette feels royal without being loud.',
    createdAt: '2026-06-15T12:00:00.000Z',
    likes: 14,
  },
  {
    id: 'dc-c1-1-3',
    chapterKey: '1-1',
    author: 'ScrollSage',
    content: 'Agree — the gold accents on dark panels work great on OLED.',
    createdAt: '2026-06-15T12:40:00.000Z',
    likes: 6,
    parentId: 'dc-c1-1-2',
  },
  {
    id: 'dc-c1-1-4',
    chapterKey: '1-1',
    author: 'MoonInk',
    content: 'Worldbuilding dump done right — short captions, big visuals.',
    createdAt: '2026-06-16T08:15:00.000Z',
    likes: 10,
  },
  {
    id: 'dc-c1-1-5',
    chapterKey: '1-1',
    author: 'ForgeFan',
    content: 'Saving this for weekend binge.',
    createdAt: '2026-06-16T18:00:00.000Z',
    likes: 5,
  },
  {
    id: 'dc-c1-1-6',
    chapterKey: '1-1',
    author: 'QuietReader',
    content: 'Chapter length felt perfect.',
    createdAt: '2026-06-17T07:00:00.000Z',
    likes: 3,
  },

  // Mystic Academy — Ch.1
  {
    id: 'dc-c2-1-1',
    chapterKey: '2-1',
    author: 'Spellbound',
    content: 'Academy settings are my weakness. Enrollment accepted.',
    createdAt: '2026-06-18T09:00:00.000Z',
    likes: 20,
  },
  {
    id: 'dc-c2-1-2',
    chapterKey: '2-1',
    author: 'InkFox',
    content: 'The classroom crowd shot is packed with personality.',
    createdAt: '2026-06-18T11:30:00.000Z',
    likes: 16,
  },
  {
    id: 'dc-c2-1-3',
    chapterKey: '2-1',
    author: 'NightScroll',
    content: 'Who’s your favorite side character already?',
    createdAt: '2026-06-18T14:00:00.000Z',
    likes: 9,
  },
  {
    id: 'dc-c2-1-4',
    chapterKey: '2-1',
    author: 'TeaAndPanels',
    content: 'The quiet kid in the back row. 100%.',
    createdAt: '2026-06-18T14:25:00.000Z',
    likes: 7,
    parentId: 'dc-c2-1-3',
  },

  // Shadow Ninja — Ch.1 (lighter)
  {
    id: 'dc-c3-1-1',
    chapterKey: '3-1',
    author: 'ShadowStep',
    content: 'Stealth intro done right.',
    createdAt: '2026-06-22T10:00:00.000Z',
    likes: 11,
  },
  {
    id: 'dc-c3-1-2',
    chapterKey: '3-1',
    author: 'PanelHopper',
    content: 'Those night panels look great in dark mode.',
    createdAt: '2026-06-22T13:00:00.000Z',
    likes: 8,
  },

  // Mecha Guardian — Ch.1
  {
    id: 'dc-c4-1-1',
    chapterKey: '4-1',
    author: 'GearHead',
    content: 'Mecha silhouette in the rain = instant classic vibe.',
    createdAt: '2026-06-25T10:00:00.000Z',
    likes: 17,
  },
  {
    id: 'dc-c4-1-2',
    chapterKey: '4-1',
    author: 'GoldBookmark',
    content: 'Sound effects placement is excellent for vertical scroll.',
    createdAt: '2026-06-25T12:00:00.000Z',
    likes: 6,
  },
  {
    id: 'dc-c4-1-3',
    chapterKey: '4-1',
    author: 'ForgeFan',
    content: 'Waiting for the full cockpit reveal.',
    createdAt: '2026-06-26T09:00:00.000Z',
    likes: 4,
  },
];

export function getDemoCommentSeedsForChapter(chapterKey: string): DemoCommentSeed[] {
  return DEMO_COMMENT_SEEDS.filter((c) => c.chapterKey === chapterKey);
}

export function makeDemoChapterKey(seriesIndex: number, chapterNumber: number): string {
  return `${seriesIndex}-${chapterNumber}`;
}

export const DEMO_COMMENTS_SESSION_KEY = 'zax-demo-comments-session';
export const DEMO_COMMENT_LIKES_SESSION_KEY = 'zax-demo-comment-likes';
