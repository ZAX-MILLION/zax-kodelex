# Zax Million Homepage — Responsive Fix Plan

**Purpose:** Fix how the homepage looks on phones, tablets, and desktops.  
**Status:** Plan only — no code changes yet.  
**Homepage entry point:** `src/pages/Home.tsx` → `ResetScansHomepage`  
**Last reviewed:** July 2026

---

## 1. What’s wrong (plain language)

These are the problems seen in screenshots and confirmed in the code.

### On phones (~375px wide)

| Problem | What users see | Root cause in code |
|--------|----------------|-------------------|
| Hero shows 2 squeezed cards | Two tiny cover images side by side; hard to read titles | `HeroSlider` uses `basis-1/2` (50% width per slide) on mobile |
| Latest Comics feels cramped | Two very narrow columns; titles cut off mid-word | Grid is `grid-cols-2` with `gap-4`; cards carry full desktop metadata |
| Chapter buttons too tall | Each card has two thick chapter rows eating vertical space | `EnhancedMangaCard` always shows 2 chapter rows with `py-1`, icons, and “NEW” badges |
| Cards feel crowded | Rating, MANGA tag, status dot, title, and chapters all compete | Same card layout on all screen sizes; `size="medium"` used everywhere |
| Not enough side breathing room | Content touches or nearly touches screen edges | Mix of `px-4` (16px) padding; hero carousel has no horizontal inset |
| Big empty gap after hero | Large blank band between featured carousel and “Latest Comics” | Stacked spacing: parent `space-y-8` + hero `mb-8` + full-width `Separator` |

### On tablets (~768px) and desktops (~1280px)

| Problem | What users see | Root cause in code |
|--------|----------------|-------------------|
| Cards look overloaded | Every card shows rating + genre tag + status + title + 2 chapter rows | `EnhancedMangaCard` with `showMetadata={true}`; no simplified variant |
| Hero shows too many small cards | 4–6 tiny covers in a row on tablet/desktop | `basis-1/4` at md, `basis-1/5` at lg, `basis-1/6` at xl |
| Sidebar competes with main grid | On tablet, trending list appears below comics but cards are still dense | Sidebar only splits at `lg` (1024px); card density unchanged |
| Section headers tight on small tablet | “View All” button wraps awkwardly next to long headings | Header is single-row flex without mobile stack |

### Navigation (all sizes)

| Problem | What users see | Root cause in code |
|--------|----------------|-------------------|
| Logo text hidden on smallest phones | Icon only below ~320px (`xs`) | `hidden xs:block` on site name in `CreativeNavBar` |
| Mobile menu only below 1024px | Tablet users get desktop nav squeezed into top bar | Desktop nav shows at `lg:flex` (1024px), not `md` |
| Hero filter dots have no labels on mobile | Three icon buttons with tooltips only | Acceptable, but tooltips don’t work on touch |

**What you’ll see after fixes:** One featured comic at a time on phone (with a peek of the next), cleaner comic cards that fit the screen, comfortable side margins, less wasted space under the hero, and cards that show only what matters on each device size.

---

## 2. Target layouts by screen size

Tailwind breakpoints used in this project:

| Name | Min width | Typical device |
|------|-----------|----------------|
| (default) | 0px | Small phones |
| `xs` | 320px | Phones |
| `sm` | 640px | Large phones / small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Wide monitors |

---

### Mobile target (~375px)

```
┌─────────────────────────────┐
│  Nav: logo + search + menu  │  px-16 (16px sides)
├─────────────────────────────┤
│  [ Demo banner if shown ]   │
├─────────────────────────────┤
│  ○ ○ ○  (filter icons)      │
│  ┌──────────────────┐ ┌──   │  Hero: 1 card ~82% wide
│  │   FEATURED       │ │pe   │  + ~18% peek of next
│  │   cover + title  │ │ek   │
│  └──────────────────┘ └──   │
├─────────────────────────────┤
│  Latest Comics              │  Section gap: 24px (not 64px)
│  ┌──────────┐ ┌──────────┐  │  2 columns OK if cards simplified
│  │ cover    │ │ cover    │  │  OR 1 column if titles still truncate
│  │ title    │ │ title    │  │
│  │ Ch.12    │ │ Ch.8     │  │  1 chapter row only
│  └──────────┘ └──────────┘  │
├─────────────────────────────┤
│  Latest Updates (feed list) │
├─────────────────────────────┤
│  Trending (stacked below)   │  Sidebar moves under main content
├─────────────────────────────┤
│  Blog articles (1 column)   │
├─────────────────────────────┤
│  Footer                     │
└─────────────────────────────┘
```

**Mobile rules:**
- Hero: **1 slide visible + partial next slide** (~82% / 18% split)
- Latest Comics: **2 columns** with **simplified cards**, OR **1 column** if 2-col still truncates titles after simplification
- Chapter rows: **1 per card** (latest only)
- Cover badges: **status dot only** (hide MANGA tag and rating on cover)
- Page padding: **16px** minimum; hero carousel inset **12px** from screen edge
- Vertical gap hero → content: **24px max**

---

### Tablet target (~768px)

```
┌──────────────────────────────────────────┐
│  Nav: logo + links OR hamburger at md    │
├──────────────────────────────────────────┤
│  Hero: 3 cards visible (or 2 + peek)     │
├──────────────────────────────────────────┤
│  Latest Comics          │  (no sidebar    │
│  ┌────┐ ┌────┐ ┌────┐   │   until lg)     │
│  │    │ │    │ │    │   │                 │
│  └────┘ └────┘ └────┘   │                 │
│  3 columns, medium cards │                 │
├──────────────────────────────────────────┤
│  Trending sidebar (full width below)       │
└──────────────────────────────────────────┘
```

**Tablet rules:**
- Hero: **3 cards** (`basis-1/3`) or **2 + peek** if cards feel small
- Latest Comics: **3 columns** (`md:grid-cols-3`)
- Cards: **medium detail** — title + 1 chapter row; rating OR status, not both on cover
- Sidebar (`TrendingSidebarWidget`): full width below main content until `lg`
- Section header: title and “View All” on **one row** with `flex-wrap` fallback

---

### Desktop target (~1280px)

```
┌────────────────────────────────────────────────────────────┐
│  Nav: full links + search + wallet + profile               │
├────────────────────────────────────────────────────────────┤
│  Hero: 5–6 cards in carousel                               │
├────────────────────────────────────────────────────────────┤
│  Latest Comics (main)              │  Trending sidebar     │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐          │  rank + thumb + title │
│  │   │ │   │ │   │ │   │          │                       │
│  └───┘ └───┘ └───┘ └───┘          │  Support widget       │
│  4 columns, full card detail      │                       │
├────────────────────────────────────────────────────────────┤
│  Latest Updates feed                                       │
├────────────────────────────────────────────────────────────┤
│  Blog: 3 columns                                           │
└────────────────────────────────────────────────────────────┘
```

**Desktop rules:**
- Hero: **5 cards** at lg, **6 at xl** (current intent, keep)
- Latest Comics: **4 columns** (`lg:grid-cols-4`)
- Cards: **full detail** — rating, type badge, status, title, **2 chapter rows**
- Sidebar: fixed **320px** column (`lg:grid-cols-[1fr_320px]`)
- Max content width: container centers at **1280px** (`xl`)

---

## 3. Ordered fixes (with files and concrete UI rules)

Do these in order. Each item says **what to change**, **where**, and **exact rules**.

---

### Fix 1 — Hero: one card + peek on mobile

**File:** `src/components/homepage/HeroSlider.tsx`

| Rule | Current | Target |
|------|---------|--------|
| Mobile slide width | `basis-1/2` | `basis-[82%] sm:basis-[70%]` |
| Small tablet | `sm:basis-1/3` | `sm:basis-1/2 md:basis-1/3` |
| Desktop | `lg:basis-1/5 xl:basis-1/6` | Keep |
| Carousel align | `align: "start"` | Keep (enables peek) |
| Horizontal inset | None on wrapper | Wrap carousel in `container mx-auto px-3 sm:px-4` |
| Bottom margin | `mb-8` | `mb-4 sm:mb-6` |

**Also update:** `CarouselContent` negative margin — use `-ml-3` on mobile to match inset.

**What you’ll see:** On phone, one large featured cover with a sliver of the next comic inviting a swipe.

---

### Fix 2 — Remove double gap after hero

**Files:**
- `src/components/homepage/HeroSlider.tsx` — reduce `mb-8` (Fix 1)
- `src/components/homepage/ResetScansHomepage.tsx` — change root `space-y-8` to `space-y-6 lg:space-y-8`
- `src/components/homepage/ResetScansHomepage.tsx` — optionally hide or soften `Separator` after hero on mobile: `hidden sm:block` OR reduce separator margin

**Spacing rule after hero:** Total gap = **24px on mobile**, **32px on tablet+**.

**What you’ll see:** Latest Comics sits closer to the hero; less dead space.

---

### Fix 3 — Page-wide horizontal padding

**Files:**
- `src/components/homepage/ResetScansHomepage.tsx` — standardize containers to `px-4 sm:px-6 lg:px-8`
- `src/components/homepage/HeroSlider.tsx` — same padding on hero wrapper (Fix 1)
- `src/components/homepage/BlogSection.tsx` — already uses `container px-4`; align to `px-4 sm:px-6 lg:px-8`

**Spacing standard:** See Section 5.

**What you’ll see:** Comfortable margins on left and right; content no longer feels edge-to-edge.

---

### Fix 4 — Latest Comics grid columns

**File:** `src/components/homepage/ResetScansHomepage.tsx` (line ~128)

| Breakpoint | Current | Target |
|------------|---------|--------|
| Default (mobile) | `grid-cols-2` | `grid-cols-2` (keep if Fix 5 simplifies cards) OR `grid-cols-1 xs:grid-cols-2` if still cramped |
| `sm` (640px) | (inherits 2) | `sm:grid-cols-2` |
| `md` (768px) | `md:grid-cols-3` | Keep |
| `lg` (1024px) | `lg:grid-cols-4` | Keep |
| Gap | `gap-4` | `gap-3 sm:gap-4 md:gap-5` |

**Loading skeleton** (same file, line ~75): match live grid classes.

**What you’ll see:** Three comics per row on tablet, four on desktop; two on phone with room to breathe.

---

### Fix 5 — Card simplification by breakpoint (main fix)

**File:** `src/components/manga/EnhancedMangaCard.tsx`

Add a responsive mode OR a `variant` prop: `'compact' | 'standard' | 'full'`.

**Recommended approach:** Use Tailwind responsive classes inside the card (no JS breakpoint hook needed).

#### Mobile (< `md`, under 768px) — **Compact**

| Element | Show? | Rule |
|---------|-------|------|
| Cover | Yes | `aspect-[2/3]` (taller, narrower — better for 2-col) |
| MANGA / type badge | **Hide** | `hidden md:block` |
| Rating on cover | **Hide** | `hidden md:flex` |
| Status on cover | **Dot only** | Hide text label; keep colored dot `w-2 h-2` |
| Title | Yes | `text-sm line-clamp-2 min-h-[2.5rem]` |
| Chapter rows | **1 only** | Slice chapters to `[0]` on mobile via prop or CSS `max-h` + hide second |
| Chapter button height | Shorter | `py-1.5` → `py-1`; `text-xs`; hide Clock/NEW on mobile |
| Card padding | Tighter | `p-2 md:p-3` |
| Min height below cover | Lower | `min-h-[72px] md:min-h-[100px]` |

#### Tablet (`md` to `lg-1`) — **Standard**

| Element | Show? |
|---------|-------|
| Type badge | Small: `text-[10px] px-1.5` |
| Rating OR status | One on cover (pick rating); status as dot only |
| Chapter rows | 1 |
| Title | `text-sm md:text-base line-clamp-2` |

#### Desktop (`lg`+) — **Full** (current behavior)

| Element | Show? |
|---------|-------|
| Type badge | Yes |
| Rating | Yes |
| Status dot + label | Yes |
| Chapter rows | 2 |
| NEW badge / lock / timestamp | Yes |

**Caller update — File:** `src/components/homepage/ResetScansHomepage.tsx`

```tsx
<EnhancedMangaCard
  series={series}
  showMetadata={true}
  size="medium"   // consider size="small" on mobile via responsive prop
/>
```

Optional: pass `maxChapters={1}` on mobile using a small hook, or bake responsive limits into the card.

**What you’ll see:** Phone cards show cover + title + one chapter link. Desktop cards keep the rich detail.

---

### Fix 6 — Section header stacking on mobile

**File:** `src/components/homepage/ResetScansHomepage.tsx` (Latest Comics header, ~line 114)

| Rule | Target |
|------|--------|
| Container | `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6` |
| Title | `text-xl sm:text-2xl` |
| Subtitle | `text-sm` |
| View All button | Full width on mobile optional: `w-full sm:w-auto` |

**What you’ll see:** Heading and button don’t fight for space on narrow screens.

---

### Fix 7 — Sidebar / Trending on mobile & tablet

**Files:**
- `src/components/homepage/TrendingSidebarWidget.tsx`
- `src/components/homepage/ResetScansHomepage.tsx`

| Rule | Target |
|------|--------|
| Sidebar order on mobile | Move trending **above** Latest Comics OR keep below but add `order-first lg:order-none` if trending should be higher |
| Default recommendation | Keep below main content (current order) but simplify rows on mobile |
| Trending row height | Hide star rating row on `< md`: wrap rating block in `hidden md:flex` |
| Tab buttons | Ensure `text-[11px]` on mobile if “This Week” wraps |
| Thumbnail | Keep `w-12 h-16` |

**Alternative (Phase 3):** Horizontal scroll “Trending” strip on mobile instead of long vertical list.

**What you’ll see:** Trending list is scannable on phone without tiny stars and genre pills.

---

### Fix 8 — Feed section mobile polish

**Files:**
- `src/components/homepage/FeedSection.tsx`
- `src/components/homepage/ChapterFeedItem.tsx`

| Rule | Target |
|------|--------|
| Scroll area height | `h-[320px] sm:h-[400px]` |
| Feed item padding | `p-3 sm:p-4` |
| Badge row | Allow wrap: `flex-wrap gap-1` |
| Timestamp | Hide on very small: `hidden xs:flex` or stack below title |

**What you’ll see:** Latest Updates list fits phone height; rows don’t overflow.

---

### Fix 9 — Navigation tweaks

**File:** `src/components/CreativeNavBar.tsx`

| Issue | Fix |
|-------|-----|
| Site name hidden below 320px | Show abbreviated name at all sizes: remove `hidden xs:block`, use `text-sm truncate max-w-[120px] sm:max-w-none` |
| Tablet nav cramped | Consider mobile menu up to `md` (768px): change `lg:flex` / `lg:hidden` to `md:flex` / `md:hidden` **only if** desktop links overflow at 768px — test first |
| Nav padding | Align with page: `px-4 sm:px-6 lg:px-8` (replace `px-2 xs:px-4`) |
| Touch targets | Minimum **44×44px** for menu, search, profile buttons on mobile |

**File:** `src/components/Layout.tsx`

| Rule | Target |
|------|--------|
| Horizontal overflow | Keep `overflow-x-hidden` |
| Main width | Keep `w-full max-w-full` |

**What you’ll see:** Logo/name always visible; nav matches page margins; buttons easy to tap.

---

### Fix 10 — Footer alignment

**File:** `src/components/Footer.tsx`

| Rule | Target |
|------|--------|
| Padding | Match page standard: `px-4 sm:px-6 lg:px-8` |
| Grid | Keep `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` — already reasonable |
| Compact mode | OK for homepage |

---

### Fix 11 — SeriesGrid (shared component, future-proof)

**File:** `src/components/homepage/SeriesGrid.tsx`

Not used on `ResetScansHomepage` today but used elsewhere. Apply same card density rules if this grid appears on homepage variants:

- Default mobile: 2 cols with same compact card rules
- Gap: `gap-3 md:gap-4`
- Chapter buttons: `py-1 sm:py-1.5`

---

### Fix 12 — HeroSlider metadata on small cards

**File:** `src/components/homepage/HeroSlider.tsx`

When slides are large (mobile 82%), current overlays are fine. When many slides show (desktop), optionally:

- Hide view count below `md`
- Reduce title to `text-xs lg:text-sm`

---

## 4. Card simplification summary (mobile vs desktop)

| Card part | Mobile (<768px) | Desktop (≥1024px) |
|-----------|-----------------|-------------------|
| Cover aspect | 2:3 | 3:4 |
| Type badge (MANGA) | Hidden | Shown |
| Rating | Hidden | Shown |
| Status | Dot only | Dot + label |
| Title lines | 2 max, smaller text | 2 max, base text |
| Chapter buttons | 1 row, compact | 2 rows, full labels |
| Lock / NEW / time | Hidden or icon only | Full |
| Card min-height | ~72px content | ~100px content |
| Hover lift | Reduce or disable on touch | Keep |

**Same component:** `EnhancedMangaCard.tsx` — one component, responsive visibility classes.  
**Do not** maintain two separate card components unless complexity grows.

---

## 5. Spacing standards

Use these everywhere on the homepage for consistency.

### Horizontal padding (page edges)

| Breakpoint | Padding class | Pixels |
|------------|-----------------|--------|
| Mobile | `px-4` | 16px |
| Tablet | `sm:px-6` | 24px |
| Desktop | `lg:px-8` | 32px |

### Vertical section gaps

| Location | Mobile | Tablet+ |
|----------|--------|---------|
| Between major sections | `space-y-6` (24px) | `space-y-8` (32px) |
| After hero | `mb-4` (16px) | `mb-6` (24px) |
| Section title → grid | `mb-4` | `mb-6` |
| Grid gap (cards) | `gap-3` (12px) | `gap-4`–`gap-5` (16–20px) |
| Separator margin | `my-4` | `my-6` |

### Card internal spacing

| Element | Mobile | Desktop |
|---------|--------|---------|
| Card padding | `p-2` | `p-3` |
| Title → chapters | `space-y-1` | `space-y-2` |
| Chapter button | `py-1 px-2` | `py-1.5 px-2` |

### Touch targets (mobile)

- Minimum **44px** height for buttons and chapter rows
- Carousel swipe area: full card width, no overlapping arrows on mobile (arrows already `hidden md:flex` ✓)

---

## 6. Navigation — broken or not?

**Verdict:** Navigation is **mostly working** but **not aligned** with the rest of the page.

| Item | Status | Action |
|------|--------|--------|
| Sticky top bar | OK | Keep |
| Mobile hamburger | OK | Keep |
| Search popup | OK | Keep |
| Logo text on tiny phones | **Issue** | Always show truncated site name |
| Padding mismatch | **Issue** | Match `px-4 sm:px-6 lg:px-8` |
| Desktop nav at 768px | **Maybe issue** | Test; switch to hamburger at `md` if cramped |
| Hero filter tooltips | Minor | Add `aria-label` on filter buttons for accessibility |

---

## 7. Verification checklist

Test in Chrome DevTools at **375px**, **768px**, and **1280px**. Also test one real phone if possible.

### Mobile (~375px)

- [ ] Hero shows **one large card** with visible **peek** of next slide
- [ ] Swipe / drag advances carousel smoothly
- [ ] Gap between hero and “Latest Comics” ≤ **24px** (no large empty band)
- [ ] Left/right page margin feels even (~16px)
- [ ] Latest Comics: cards readable; titles show **at least 2 lines** without ugly truncation
- [ ] Each card shows **at most 1 chapter button**; buttons are not overly tall
- [ ] No MANGA/rating clutter on cover (compact mode)
- [ ] Section headers stack cleanly; “View All” is tappable
- [ ] Trending sidebar below main content; rows not overcrowded
- [ ] Feed list scrolls inside fixed height; no horizontal page scroll
- [ ] Nav: logo/name visible; menu opens; buttons ≥ 44px tap area
- [ ] Footer columns stack in one column

### Tablet (~768px)

- [ ] Hero shows **~3** cards (or 2 + peek if chosen)
- [ ] Latest Comics: **3 columns**
- [ ] Cards use **standard** detail (not full desktop stack)
- [ ] Sidebar full width below grid OR side-by-side if ≥1024px
- [ ] Nav usable (hamburger or compact links — per Fix 9 decision)

### Desktop (~1280px)

- [ ] Hero shows **5–6** cards
- [ ] Latest Comics: **4 columns** + **320px** trending sidebar
- [ ] Cards show **full** metadata (2 chapters, badges, ratings)
- [ ] Container centered; max width comfortable
- [ ] Blog section: 3 columns
- [ ] No horizontal scrollbar on body

### Regression

- [ ] Demo mode banner still displays when using demo library
- [ ] Pagination on Latest Comics still works
- [ ] All card links go to correct series pages
- [ ] Dark mode / theme selector unchanged
- [ ] Loading skeleton matches final grid layout

---

## 8. Implementation phases

### Phase 1 — Quick wins (1–2 hours)

**Goal:** Fix the worst mobile issues with minimal code churn.

1. Hero slide width: `basis-[82%]` on mobile (`HeroSlider.tsx`)
2. Reduce hero bottom margin and homepage `space-y` (`HeroSlider.tsx`, `ResetScansHomepage.tsx`)
3. Standardize horizontal padding `px-4 sm:px-6 lg:px-8` on homepage containers
4. Section header flex-wrap for Latest Comics
5. Hide second chapter row on mobile in `EnhancedMangaCard` (quick slice or CSS)
6. Shorter chapter button padding on mobile

**What you’ll see after Phase 1:** Hero and spacing feel right; cards immediately less cramped on phones.

---

### Phase 2 — Card & grid refinement (2–4 hours)

**Goal:** Proper responsive card tiers and grid tuning.

1. Full compact / standard / full rules in `EnhancedMangaCard.tsx`
2. Responsive cover badges (hide type + rating on mobile)
3. Adjust grid gaps and confirm 2-col vs 1-col on smallest phones
4. Trending sidebar: hide star ratings on mobile
5. Feed section height and padding tweaks
6. Update loading skeleton grids to match

**What you’ll see after Phase 2:** Cards look intentionally designed per device, not squeezed desktop layouts.

---

### Phase 3 — Nav, polish & consistency (1–2 hours)

**Goal:** Align chrome with content; optional enhancements.

1. Nav padding + always-visible site name
2. Test tablet nav breakpoint (`md` vs `lg`)
3. Footer padding alignment
4. Hero metadata scaling on desktop density
5. Optional: horizontal trending strip on mobile
6. Optional: `SeriesGrid.tsx` parity for other homepage variants

**What you’ll see after Phase 3:** Whole page feels like one cohesive product at every size.

---

### Phase 4 — QA & sign-off

1. Run verification checklist (Section 7) at all three widths
2. Screenshot before/after for owner review
3. Test iOS Safari + Android Chrome if available
4. Document any deferred items

---

## Files touched (summary)

| File | Phase | Changes |
|------|-------|---------|
| `src/components/homepage/HeroSlider.tsx` | 1, 3 | Slide basis, padding, margins |
| `src/components/homepage/ResetScansHomepage.tsx` | 1, 2 | Spacing, grid, headers, skeleton |
| `src/components/manga/EnhancedMangaCard.tsx` | 1, 2 | Responsive card tiers |
| `src/components/homepage/TrendingSidebarWidget.tsx` | 2 | Mobile simplification |
| `src/components/homepage/FeedSection.tsx` | 2 | Scroll height |
| `src/components/homepage/ChapterFeedItem.tsx` | 2 | Row padding, badges |
| `src/components/CreativeNavBar.tsx` | 3 | Padding, logo text, breakpoint test |
| `src/components/Footer.tsx` | 3 | Padding alignment |
| `src/components/homepage/SeriesGrid.tsx` | 3 | Optional parity |
| `tailwind.config.ts` | — | No change expected (breakpoints already defined) |

---

## Out of scope (for this plan)

- Backend / API changes
- New images or demo cover assets
- Reader page responsiveness
- Theme system / child theme overrides (`HomepageOverride`)
- Performance / lazy loading (already partially handled)

---

## Success criteria (owner-friendly)

When this plan is fully implemented:

1. **Phone:** Opening the homepage shows one big featured comic you can swipe; the list below is easy to scan without squinting.
2. **Tablet:** Three comics per row with enough detail to choose what to read.
3. **Desktop:** Four comics per row plus trending sidebar — rich info without feeling cluttered.
4. **Everywhere:** Comfortable margins, no huge blank gaps, navigation and footer line up with content.

---

*End of plan.*
