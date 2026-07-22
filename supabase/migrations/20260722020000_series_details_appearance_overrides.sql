-- Seamless V2: per-series details layout / appearance / background overrides.
-- Adds nullable metadata columns to manga_meta so staging/production can persist
-- admin choices that today only live in the browser's localStorage (demo preview).
--
-- Resolution stays the same everywhere else in the app:
--   per-series override (these columns) -> global default (site_settings / localStorage) -> built-in default.
-- A NULL value on any column below means "no override — inherit the global default",
-- so every existing series row is compatible with zero data migration required.
--
-- RLS: manga_meta already has "Anyone can view manga meta" (SELECT true) and
-- "Admins can manage manga meta" (FOR ALL USING is_admin()) from the initial schema
-- migration — these new columns inherit that same public-read / admin-write policy
-- with no additional policy needed.

ALTER TABLE public.manga_meta
  ADD COLUMN IF NOT EXISTS details_layout_override text,
  ADD COLUMN IF NOT EXISTS appearance_override text,
  ADD COLUMN IF NOT EXISTS details_background_url text,
  ADD COLUMN IF NOT EXISTS details_bg_position text,
  ADD COLUMN IF NOT EXISTS details_bg_overlay_darkness integer,
  ADD COLUMN IF NOT EXISTS details_bg_blur integer,
  ADD COLUMN IF NOT EXISTS details_bg_accent_color text,
  ADD COLUMN IF NOT EXISTS details_bg_attachment text;

ALTER TABLE public.manga_meta
  DROP CONSTRAINT IF EXISTS manga_meta_details_layout_override_check,
  ADD CONSTRAINT manga_meta_details_layout_override_check
    CHECK (details_layout_override IS NULL OR details_layout_override IN ('A', 'B', 'C', 'D'));

ALTER TABLE public.manga_meta
  DROP CONSTRAINT IF EXISTS manga_meta_appearance_override_check,
  ADD CONSTRAINT manga_meta_appearance_override_check
    CHECK (appearance_override IS NULL OR appearance_override IN ('light', 'dark', 'system'));

ALTER TABLE public.manga_meta
  DROP CONSTRAINT IF EXISTS manga_meta_details_bg_position_check,
  ADD CONSTRAINT manga_meta_details_bg_position_check
    CHECK (details_bg_position IS NULL OR details_bg_position IN ('center', 'top', 'bottom'));

ALTER TABLE public.manga_meta
  DROP CONSTRAINT IF EXISTS manga_meta_details_bg_attachment_check,
  ADD CONSTRAINT manga_meta_details_bg_attachment_check
    CHECK (details_bg_attachment IS NULL OR details_bg_attachment IN ('fixed', 'scroll'));

ALTER TABLE public.manga_meta
  DROP CONSTRAINT IF EXISTS manga_meta_details_bg_overlay_darkness_check,
  ADD CONSTRAINT manga_meta_details_bg_overlay_darkness_check
    CHECK (details_bg_overlay_darkness IS NULL OR details_bg_overlay_darkness BETWEEN 40 AND 95);

ALTER TABLE public.manga_meta
  DROP CONSTRAINT IF EXISTS manga_meta_details_bg_blur_check,
  ADD CONSTRAINT manga_meta_details_bg_blur_check
    CHECK (details_bg_blur IS NULL OR details_bg_blur BETWEEN 0 AND 12);

COMMENT ON COLUMN public.manga_meta.details_layout_override IS
  'Per-series series-details page layout override: A (Editorial) / B (Cinematic) / C (Compact) / D (Compact List). NULL = inherit global default.';
COMMENT ON COLUMN public.manga_meta.appearance_override IS
  'Per-series Light/Dark/System appearance override. NULL = inherit global appearance preference.';
COMMENT ON COLUMN public.manga_meta.details_background_url IS
  'Per-series details-page background image override. NULL = inherit global background / cover / fallback chain.';
COMMENT ON COLUMN public.manga_meta.details_bg_position IS 'Background image focal position: center / top / bottom.';
COMMENT ON COLUMN public.manga_meta.details_bg_overlay_darkness IS 'Background dimming overlay strength, 40-95 (%).';
COMMENT ON COLUMN public.manga_meta.details_bg_blur IS 'Background image blur radius in pixels, 0-12.';
COMMENT ON COLUMN public.manga_meta.details_bg_accent_color IS 'Optional hex accent tint blended over the background.';
COMMENT ON COLUMN public.manga_meta.details_bg_attachment IS 'Background scroll behavior: fixed (cinematic) / scroll.';
