# Zax Million — Theme System

Zax Million uses the **child themes** system (`child_themes` table). Each theme is a JSON configuration stored in Supabase that drives CSS variables, homepage layout, and component overrides.

> **Note:** The legacy Theme Engine (`theme_settings` / `useThemeEngine`) has been removed. Child themes are the supported system going forward.

## Architecture overview

```
child_themes (Supabase)
       ↓
ThemeProvider loads active theme
       ↓
CSS variables applied to :root
       ↓
ComponentRegistry maps slots → theme components
       ↓
HomepageOverride renders themed homepage sections
```

### Key files

| Path | Role |
|------|------|
| `src/components/themes/ThemeProvider.tsx` | Loads active theme, injects CSS vars |
| `src/themes/components/02-cyberpunk-neon.tsx` | Cyberpunk Neon theme component |
| `src/themes/components/03-zen-minimalist.tsx` | Zen Minimalist theme component |
| `src/themes/components/04-shiranami-sakura.tsx` | Shiranami Sakura theme component |
| `src/themes/components/HomepageOverride.tsx` | Per-theme homepage layout |
| `src/components/admin/ThemeManager.tsx` | Admin UI to import/activate themes |

## Bundled themes

| Slug | File | Style |
|------|------|-------|
| `cyberpunk-neon` | `02-cyberpunk-neon.tsx` | Dark neon, magenta/cyan accents |
| `zen-minimalist` | `03-zen-minimalist.tsx` | Clean, light, minimal |
| `shiranami-sakura` | `04-shiranami-sakura.tsx` | Sakura pink, Japanese aesthetic |

Themes are numbered (`02-`, `03-`, `04-`) because `ComponentRegistry` references them by filename.

## Theme JSON schema

Themes are stored in `child_themes.config` (JSONB). Core fields:

```json
{
  "name": "Shiranami Sakura",
  "slug": "shiranami-sakura",
  "version": "1.0.0",
  "colors": {
    "primary": "350 65% 55%",
    "secondary": "340 30% 90%",
    "background": "350 20% 98%",
    "foreground": "350 30% 15%",
    "accent": "350 70% 60%",
    "muted": "350 15% 92%",
    "border": "350 20% 85%"
  },
  "typography": {
    "fontFamily": "Noto Sans, sans-serif",
    "headingFamily": "Noto Sans, sans-serif"
  },
  "layout": {
    "borderRadius": "0.75rem",
    "homepageVariant": "shiranami"
  },
  "components": {
    "navbar": "creative",
    "hero": "slider",
    "seriesGrid": "modern"
  },
  "customCss": ""
}
```

Color values use **HSL without** the `hsl()` wrapper — they map directly to CSS variables like `--primary: 350 65% 55%`.

## How activation works

1. Admin opens **Themes** in `/admin/themes`
2. Select a theme → **Activate**
3. `ThemeProvider` fetches the active row from `child_themes`
4. CSS variables are written to `document.documentElement`
5. `ComponentRegistry` resolves which React component renders each UI slot
6. `HomepageOverride` picks the homepage layout for the active theme

Only one theme is active at a time (`is_active = true`).

## CSS variables

Themes inject variables consumed by Tailwind and components:

| Variable | Usage |
|----------|-------|
| `--primary` | Buttons, links, accents |
| `--background` / `--foreground` | Page base colors |
| `--card` / `--card-foreground` | Card surfaces |
| `--muted` / `--muted-foreground` | Secondary text |
| `--border` | Borders and dividers |
| `--reader-bg` | Reader page background |
| `--manga-red` | Brand accent (legacy compat) |

Defined in `tailwind.config.ts` as `hsl(var(--primary))` etc.

## Homepage overrides

Each theme can override homepage sections via `HomepageOverride`:

- **Hero** — slider, static image, or themed banner
- **Series grid** — card style, columns, hover effects
- **Blog section** — optional articles block
- **Support widget** — floating Ko-fi / help button

The active theme's `layout.homepageVariant` selects which override component mounts.

## Creating a new theme

### From the admin panel

1. Go to `/admin/themes`
2. Click **Import Theme** and paste JSON matching the schema above
3. Preview, then **Activate**

### From code

1. Copy an existing file, e.g. `src/themes/components/04-shiranami-sakura.tsx`
2. Rename with the next number: `05-my-theme.tsx`
3. Register the component in `ComponentRegistry`
4. Add a `HomepageOverride` variant if needed
5. Insert a row into `child_themes` via admin or SQL:

```sql
INSERT INTO child_themes (name, slug, config, is_active)
VALUES (
  'My Theme',
  'my-theme',
  '{"name":"My Theme","slug":"my-theme","colors":{...}}'::jsonb,
  false
);
```

## Custom CSS

Themes support a `customCss` field — raw CSS injected at runtime after variables. Use for one-off tweaks without redeploying:

```css
.hero-section { background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent))); }
```

## Import / export

- **Export:** Admin → Themes → select theme → Export JSON
- **Import:** Paste JSON into Import dialog; slug must be unique
- **Shiranami import utility:** `src/utils/importShiranamiTheme.ts` (dev helper)

## Theme vs site settings

| Setting | Where | Scope |
|---------|-------|-------|
| Active child theme | `child_themes.is_active` | Visual design |
| Site title, logo | `SiteSettings` / `seo_settings` | Branding text |
| Footer links | `FooterManager` | Navigation |
| Hero image URL | Per-theme or `SiteSettings` | Homepage media |

## Development tips

- Run `npm run dev` on port **8080**
- Switch themes live in admin to preview without rebuild
- Theme components are lazy-loaded; check Network tab for chunk names like `04-shiranami-sakura-*.js`
- Use browser DevTools → Elements → `:root` to inspect injected CSS variables

## Checklists

- [Theme system checklist](THEME_SYSTEM_CHECKLIST.md)
- [Child theme enhancements](CHILD_THEME_ENHANCEMENTS_CHECKLIST.md)
- [Homepage override checklist](HOMEPAGE_OVERRIDE_CHECKLIST.md)

## FAQ

**Why are theme files numbered?**  
Historical convention from ComponentRegistry dynamic imports. The number ensures load order and avoids name collisions.

**Can I run multiple themes?**  
No — one active theme per site. Users can preview inactive themes in admin.

**What happened to Theme Engine?**  
The `theme_settings` / `useThemeEngine` system was experimental and unused in routes. Child themes replaced it.

**Empty homepage after theme switch?**  
Ensure series exist in the database, or enable `VITE_DEMO_MODE=true` in development.
