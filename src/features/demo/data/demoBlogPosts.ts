/**
 * Local demo blog catalogue for public showcase builds.
 * Never mixed into production Supabase — client-only, read-only.
 */

export interface DemoBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  published_at: string;
  reading_time_minutes: number;
  featured_image_url: string;
  featured_image_alt: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
  view_count: number;
}

const AUTHOR = 'ZAX MILLION';

/** Resolve public asset paths under the current Vite base (supports `/` and `/zax-kodelex/`). */
export function demoPublicAsset(path: string): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export const DEMO_BLOG_POSTS: DemoBlogPost[] = [
  {
    id: 'demo-blog-1',
    slug: 'introducing-zax-seamless-v2',
    title: 'Introducing ZAX Seamless V2',
    excerpt:
      'A clearer public experience for Zax Million — editorial homepage flow, Role Lab demos, and stronger trust surfaces.',
    content: `ZAX Seamless V2 is the latest public upgrade of the Zax Million platform. It focuses on one goal: make browsing, reading, and exploring membership feel intentional rather than crowded.

The homepage now leads with a quieter hero, curated discovery, plain membership pricing, and a direct path into the Role Lab. Legal and support links sit where visitors expect them, so trust is part of the layout instead of an afterthought.

Under the surface, demo and production stay separated. The GitHub Pages showcase runs without a live database connection, while staging and production keep their real data pipelines.

Whether you are evaluating the reader, testing a persona in Role Lab, or reviewing membership language, Seamless V2 is designed to feel like one product — dark, focused, and ready for serious use.`,
    category: 'Product',
    author: AUTHOR,
    published_at: '2026-07-18T10:00:00.000Z',
    reading_time_minutes: 4,
    featured_image_url: demoPublicAsset('/demo-covers/1.jpg'),
    featured_image_alt: 'Zax Million library homepage with featured series',
    tags: ['release', 'seamless-v2', 'platform'],
    seo_title: 'Introducing ZAX Seamless V2 | Zax Million',
    seo_description:
      'Learn what changed in ZAX Seamless V2: homepage structure, Role Lab, membership clarity, and safer public demos.',
    view_count: 1280,
  },
  {
    id: 'demo-blog-2',
    slug: 'building-a-faster-manga-reading-experience',
    title: 'Building a Faster Manga Reading Experience',
    excerpt:
      'How Zax Million keeps first paint lean: lazy routes, local demo covers, and no heavy admin code on the public homepage.',
    content: `Speed is part of reading comfort. A manga desk that stalls while downloading admin tools or payment SDKs breaks immersion before the first chapter starts.

Seamless V2 keeps the public path light. Admin editing tools load only when that capability is enabled. Payment interfaces stay off demo hosts. Demo builds skip heavy service-worker precache so the first visit stays responsive.

Chapter artwork in the public demo remains intentionally limited so the showcase can load quickly on GitHub Pages. Production deployments can attach full media through your configured storage without changing the reader shell.

The result is a reader that feels ready sooner — especially on mobile networks where every unnecessary request shows up as waiting.`,
    category: 'Performance',
    author: AUTHOR,
    published_at: '2026-07-16T14:30:00.000Z',
    reading_time_minutes: 5,
    featured_image_url: demoPublicAsset('/demo-covers/2.jpg'),
    featured_image_alt: 'Manga cover art representing a fast reading experience',
    tags: ['performance', 'reader', 'mobile'],
    seo_title: 'Faster Manga Reading on Zax Million',
    seo_description:
      'See how Zax Million improves load performance for public browsing and reading sessions.',
    view_count: 940,
  },
  {
    id: 'demo-blog-3',
    slug: 'exploring-the-zax-demo-role-lab',
    title: 'Exploring the ZAX Demo Role Lab',
    excerpt:
      'One-click personas for Guest, Member, Premium, Buyer, Uploader, and Admin preview — without passwords or live data.',
    content: `The Role Lab lets visitors try how the interface adapts to different personas. There are no shared passwords and no production accounts.

Choose Guest to browse the library as a visitor. Switch to Member or Premium to see profile and membership cues. Buyer opens a simulated checkout path that never contacts a payment gateway. Uploader and Admin open lightweight previews that do not write files or change settings.

Everything stays in session storage for the current browser tab. Reset Demo returns you to Guest. That isolation is intentional: a public showcase must never reach real orders, users, or deployment controls.

Use Role Lab when you want to evaluate UX honestly — what each role sees — without standing up a full staging login.`,
    category: 'Demo',
    author: AUTHOR,
    published_at: '2026-07-14T09:15:00.000Z',
    reading_time_minutes: 4,
    featured_image_url: demoPublicAsset('/demo-covers/3.jpg'),
    featured_image_alt: 'Interface preview representing Role Lab personas',
    tags: ['demo', 'role-lab', 'ux'],
    seo_title: 'ZAX Demo Role Lab Explained',
    seo_description:
      'Tour the Zax Million Role Lab and learn what each public demo persona can safely preview.',
    view_count: 1120,
  },
  {
    id: 'demo-blog-4',
    slug: 'how-premium-membership-works',
    title: 'How Premium Membership Works',
    excerpt:
      'Clear USD pricing, honest labels, and a final-sale posture for digital access — without confusing membership with donations.',
    content: `Premium membership on Zax Million is a paid reading benefit, not a charitable donation. Pricing is shown in USD with monthly and yearly options so visitors can compare plans without decoding marketing jargon.

Coins remain a separate digital good for chapter unlocks. Theme source licenses are another product line. Keeping those labels honest helps readers understand what they are buying before checkout.

Production purchases are intended to complete only after server-side verification. Client success pages alone never grant access. Demo hosts disable live checkout entirely so public visitors cannot trigger real charges.

Cancellation and renewal rules belong in your published Terms. Seamless V2 surfaces membership language on the homepage so the commercial offer is visible before someone opens the subscribe flow.`,
    category: 'Membership',
    author: AUTHOR,
    published_at: '2026-07-12T16:00:00.000Z',
    reading_time_minutes: 5,
    featured_image_url: demoPublicAsset('/demo-covers/4.jpg'),
    featured_image_alt: 'Premium membership presentation on a dark interface',
    tags: ['premium', 'membership', 'pricing'],
    seo_title: 'Premium Membership on Zax Million',
    seo_description:
      'Understand Premium membership pricing, entitlements, and how it differs from coins and licenses.',
    view_count: 870,
  },
  {
    id: 'demo-blog-5',
    slug: 'the-uploader-dashboard-experience',
    title: 'The Uploader Dashboard Experience',
    excerpt:
      'What series authors see when preparing chapters — and how the public demo keeps uploads fully simulated.',
    content: `Uploaders need a calm place to describe a series, attach pages, and preview results before anything goes live. The Author experience in Zax Million is built around that workflow.

On production and staging hosts with authentication enabled, uploads can connect to your configured storage rules. MIME types, size limits, and role checks remain part of the security model.

On the public GitHub Pages demo, the Uploader simulation never writes to storage or the database. Forms accept input for UX review, then clearly report that the action was simulated. That keeps the showcase useful without creating permanent junk files.

If you are evaluating the product as a publisher, use Role Lab’s Uploader persona first, then move to a private staging project for real media tests.`,
    category: 'Creator Tools',
    author: AUTHOR,
    published_at: '2026-07-10T11:45:00.000Z',
    reading_time_minutes: 4,
    featured_image_url: demoPublicAsset('/demo-covers/5.jpg'),
    featured_image_alt: 'Uploader workspace concept for series and chapters',
    tags: ['uploader', 'authors', 'workflow'],
    seo_title: 'Uploader Dashboard on Zax Million',
    seo_description:
      'Explore the uploader experience and how the public demo keeps file writes simulated.',
    view_count: 760,
  },
  {
    id: 'demo-blog-6',
    slug: 'inside-the-zax-administration-dashboard',
    title: 'Inside the ZAX Administration Dashboard',
    excerpt:
      'A realistic admin preview for navigation and layout — without loading production controls on the public demo.',
    content: `Administrators manage series, users, themes, SEO settings, and monetization configuration. Those tools are powerful, so public demos must never expose them for real writes.

Seamless V2 therefore ships a lightweight Admin simulation for Role Lab. It shows the shape of a dashboard and blocks every sensitive action with a clear message. The full Admin package stays out of the homepage request path on demo hosts.

Staging and production can enable the real Admin panel behind authentication and role checks. Operators should still treat dashboard access as privileged: rotate credentials, restrict redirects, and review RLS policies before go-live.

Use the simulation to discuss information architecture. Use a private environment to practice real operations.`,
    category: 'Administration',
    author: AUTHOR,
    published_at: '2026-07-08T13:20:00.000Z',
    reading_time_minutes: 4,
    featured_image_url: demoPublicAsset('/demo-covers/6.jpg'),
    featured_image_alt: 'Administration dashboard layout preview',
    tags: ['admin', 'security', 'operations'],
    seo_title: 'ZAX Administration Dashboard Overview',
    seo_description:
      'See how Zax Million separates public admin simulation from production administration tools.',
    view_count: 690,
  },
  {
    id: 'demo-blog-7',
    slug: 'responsive-reading-across-every-device',
    title: 'Responsive Reading Across Every Device',
    excerpt:
      'From compact phones to wide desktops — spacing, navigation, and discovery that stay usable without horizontal overflow.',
    content: `Readers open Zax Million on many screen sizes. Seamless V2 treats that as a primary requirement, not a polish pass.

On smaller phones, the homepage reduces visual noise: fewer competing cards, clearer calls to action, and touch targets sized for thumbs. Tablets get breathing room without forcing a desktop sidebar. Wide displays use editorial spotlight rows instead of a wall of identical tiles.

The manga reader continues to support vertical and page-by-page modes. Navigation remains reachable without covering art unnecessarily. Reduced-motion preferences are respected so animation never becomes a barrier.

If something still feels cramped on your device, Role Lab plus the public library are the fastest places to reproduce and report it.`,
    category: 'Design',
    author: AUTHOR,
    published_at: '2026-07-06T08:00:00.000Z',
    reading_time_minutes: 3,
    featured_image_url: demoPublicAsset('/demo-covers/7.jpg'),
    featured_image_alt: 'Responsive manga reading layout across devices',
    tags: ['responsive', 'design', 'mobile'],
    seo_title: 'Responsive Manga Reading on Zax Million',
    seo_description:
      'How Zax Million adapts homepage and reader layouts from phones to desktops.',
    view_count: 1010,
  },
  {
    id: 'demo-blog-8',
    slug: 'secure-payments-coins-and-digital-licenses',
    title: 'Secure Payments, Coins, and Digital Licenses',
    excerpt:
      'Server-side catalogues, verified webhooks, and demo hosts that never call PayPal — the safety model behind commerce.',
    content: `Commerce on Zax Million is designed to fail closed when configuration is incomplete. Product amounts come from a server catalogue, not from whatever a browser posts.

Coin packs, premium subscriptions, and theme licenses are distinct products. Pending purchases store PayPal order identifiers. Entitlements are created only after verified webhook completion. Duplicate events are ignored. Cancelled or failed payments stay unfulfilled.

Public demo builds disable payments entirely. There is no PayPal SDK on those hosts, and simulated buyer flows never open a gateway. Staging defaults to sandbox. Live mode requires an explicit operator gate.

That separation protects both visitors and the business. You can showcase the product publicly while keeping real money flows on environments you control.`,
    category: 'Payments',
    author: AUTHOR,
    published_at: '2026-07-04T12:00:00.000Z',
    reading_time_minutes: 6,
    featured_image_url: demoPublicAsset('/demo-covers/8.jpg'),
    featured_image_alt: 'Secure digital commerce concept for coins and licenses',
    tags: ['payments', 'security', 'coins', 'licenses'],
    seo_title: 'Secure Payments on Zax Million',
    seo_description:
      'Learn how coins, memberships, and licenses are validated server-side — and why demo never calls PayPal.',
    view_count: 1180,
  },
];

export function listDemoBlogPosts(limit?: number): DemoBlogPost[] {
  const sorted = [...DEMO_BLOG_POSTS].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
}

export function getDemoBlogPostBySlug(slug: string): DemoBlogPost | undefined {
  return DEMO_BLOG_POSTS.find((post) => post.slug === slug);
}

export function getRelatedDemoBlogPosts(slug: string, limit = 3): DemoBlogPost[] {
  const current = getDemoBlogPostBySlug(slug);
  const others = listDemoBlogPosts().filter((post) => post.slug !== slug);
  if (!current) return others.slice(0, limit);

  const related = others.filter(
    (post) =>
      post.category === current.category ||
      post.tags.some((tag) => current.tags.includes(tag))
  );

  if (related.length >= limit) return related.slice(0, limit);

  const relatedIds = new Set(related.map((post) => post.id));
  const fillers = others.filter((post) => !relatedIds.has(post.id));
  return [...related, ...fillers].slice(0, limit);
}
