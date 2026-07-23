/**
 * Persists per-series details-page overrides (layout / appearance / background theme)
 * to `manga_meta` for staging/production. Demo mode never calls this — demo previews
 * stay entirely in localStorage per the "zero backend requests" rule.
 *
 * Admin-only writes: RLS on `manga_meta` already restricts UPDATE to `is_admin()`
 * (see supabase/migrations/20250724210705..., "Admins can manage manga meta"), so this
 * is safe to call from any authenticated admin session — Postgres rejects the write
 * for anyone else.
 */
import { appConfig } from '@/config/env';
import { supabase } from '@/integrations/supabase/client';
import type { SeriesDetailsLayoutId } from './seriesDetailsLayout';
import type { AppearanceMode } from '@/features/appearance/appearanceMode';
import type { SeriesDetailsBgTheme } from './seriesDetailsBackground';

export interface SeriesDetailsDbOverridePatch {
  details_layout_override?: SeriesDetailsLayoutId | null;
  appearance_override?: AppearanceMode | null;
  details_background_url?: string | null;
  details_bg_position?: SeriesDetailsBgTheme['position'] | null;
  details_bg_overlay_darkness?: number | null;
  details_bg_blur?: number | null;
  details_bg_accent_color?: string | null;
  details_bg_attachment?: SeriesDetailsBgTheme['attachment'] | null;
}

/** Only meaningful outside demo mode, for real (non-demo-catalogue) series records. */
export function canSyncSeriesDetailsOverrideToDb(seriesId: string | undefined): seriesId is string {
  return Boolean(seriesId) && !appConfig.isDemo && appConfig.hasSupabase;
}

/**
 * Note: `ok`/`error` are intentionally not a strict discriminated union — this
 * project builds with `strict: false` (see tsconfig.app.json), under which
 * TypeScript's discriminated-union narrowing is unreliable. `error` is simply
 * present whenever `ok` is false.
 */
export interface SeriesDetailsDbSyncResult {
  ok: boolean;
  error?: string;
}

/**
 * Best-effort write; resolves `{ ok: false, error }` instead of throwing so admin
 * preview UIs can keep the fast localStorage path working even if this fails
 * (e.g. missing migration, offline, or a non-admin session).
 */
export async function syncSeriesDetailsOverrideToDb(
  seriesId: string,
  patch: SeriesDetailsDbOverridePatch
): Promise<SeriesDetailsDbSyncResult> {
  if (!canSyncSeriesDetailsOverrideToDb(seriesId)) {
    return { ok: false, error: 'Database sync skipped (demo mode or Supabase not configured).' };
  }
  try {
    const { error } = await supabase.from('manga_meta').update(patch).eq('id', seriesId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
