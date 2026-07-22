import { useCallback, useEffect, useState } from 'react';
import {
  applyEffectiveScheme,
  getGlobalAppearanceMode,
  getSystemPrefersDark,
  resolveAppearanceMode,
  resolveEffectiveScheme,
  setGlobalAppearanceMode,
  type AppearanceMode,
  type EffectiveScheme,
} from '@/features/appearance/appearanceMode';

/**
 * Root-level Light / Dark / System driver. Mount once near the app root
 * (mirrors the existing `useColorScheme` pattern) so every public page and
 * all four series-details layouts inherit a consistent, functional theme.
 * Applies immediately on mount (the inline script in `index.html` already
 * set the class before paint — this just keeps React state in sync), then
 * keeps listening for system preference changes and cross-tab updates.
 */
export function useAppearance() {
  const [mode, setMode] = useState<AppearanceMode>(() => getGlobalAppearanceMode());
  const [effective, setEffective] = useState<EffectiveScheme>(() => resolveEffectiveScheme(mode));

  const sync = useCallback(() => {
    const nextMode = getGlobalAppearanceMode();
    const nextEffective = resolveEffectiveScheme(nextMode);
    setMode(nextMode);
    setEffective(nextEffective);
    applyEffectiveScheme(nextEffective);
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (getGlobalAppearanceMode() !== 'system') return;
      const scheme: EffectiveScheme = getSystemPrefersDark() ? 'dark' : 'light';
      setEffective(scheme);
      applyEffectiveScheme(scheme);
    };
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'zax-appearance-global' || event.key === null) sync();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [sync]);

  const setGlobalMode = useCallback(
    (next: AppearanceMode | null) => {
      setGlobalAppearanceMode(next);
      sync();
    },
    [sync]
  );

  return { mode, effective, setGlobalMode };
}

/**
 * Applies a per-series appearance override (if one resolves differently from
 * the global preference) while a series-details page is mounted, then
 * restores the global appearance on unmount. Use alongside `useAppearance()`,
 * which continues to own the global default for every other page.
 */
export function useSeriesAppearanceOverride(seriesId?: string, dbOverride?: string | null) {
  useEffect(() => {
    if (!seriesId) return;
    const resolvedMode = resolveAppearanceMode(seriesId, dbOverride);
    const globalMode = getGlobalAppearanceMode();
    if (resolvedMode === globalMode) return;

    applyEffectiveScheme(resolveEffectiveScheme(resolvedMode));

    return () => {
      applyEffectiveScheme(resolveEffectiveScheme(getGlobalAppearanceMode()));
    };
  }, [seriesId, dbOverride]);
}
