import { describe, expect, it } from 'vitest';
import {
  applyReaderSettingsPatch,
  READER_SETTINGS_DEFAULTS,
  getReaderSettingsStorageKey,
} from '../../src/contexts/ReaderSettingsContext';
import {
  DEMO_COMMENT_SEEDS,
  getDemoCommentSeedsForChapter,
  makeDemoChapterKey,
} from '../../src/features/demo/data/demoComments';
import {
  shouldUseDemoRolePreview,
  isRealAuthEnabled,
  DEMO_BANNER_COPY,
} from '../../src/features/demo/demoAuthPolicy';
import { appConfig } from '../../src/config/env';
import { isSupabaseConfigured, isLiveSupabaseClient } from '../../src/integrations/supabase/client';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('reader settings', () => {
  it('applies scale and gap immediately via patch helper', () => {
    const next = applyReaderSettingsPatch(READER_SETTINGS_DEFAULTS, {
      imageScale: 125,
      imageGap: 12,
      widthMode: 'comfortable',
    });
    expect(next.imageScale).toBe(125);
    expect(next.imageGap).toBe(12);
    expect(next.widthMode).toBe('comfortable');
  });

  it('defaults to wide webtoon-oriented width and migrates boxed', () => {
    expect(READER_SETTINGS_DEFAULTS.widthMode).toBe('wide');
    expect(READER_SETTINGS_DEFAULTS.imageGap).toBe(0);
    const migrated = applyReaderSettingsPatch(READER_SETTINGS_DEFAULTS, {
      widthMode: 'boxed' as never,
    });
    expect(migrated.widthMode).toBe('wide');
  });

  it('resets to defaults when sanitized empty', () => {
    const next = applyReaderSettingsPatch(READER_SETTINGS_DEFAULTS, {
      imageScale: 999,
      imageGap: -5,
    });
    expect(next.imageScale).toBe(200);
    expect(next.imageGap).toBe(0);
  });

  it('uses a dedicated namespaced storage key', () => {
    expect(getReaderSettingsStorageKey()).toBe('zax-reader-settings-v2');
  });
});

describe('demo comments', () => {
  it('seeds comments for popular featured chapters without Supabase', () => {
    const popular = getDemoCommentSeedsForChapter(makeDemoChapterKey(0, 1));
    expect(popular.length).toBeGreaterThanOrEqual(6);
    expect(DEMO_COMMENT_SEEDS.length).toBeGreaterThan(20);
    expect(popular.some((c) => c.pinned)).toBe(true);
    expect(popular.some((c) => c.parentId)).toBe(true);
  });

  it('includes quieter chapters and empty-capable keys', () => {
    expect(getDemoCommentSeedsForChapter(makeDemoChapterKey(3, 1)).length).toBeGreaterThanOrEqual(2);
    expect(getDemoCommentSeedsForChapter(makeDemoChapterKey(9, 9)).length).toBe(0);
  });
});

describe('auth environment matrix', () => {
  it('never enables real auth or replaces Sign In when public demo', () => {
    if (appConfig.isDemo) {
      expect(shouldUseDemoRolePreview()).toBe(true);
      expect(isRealAuthEnabled()).toBe(false);
    }
  });

  it('keeps real auth off in unit/node without env credentials', () => {
    expect(isRealAuthEnabled()).toBe(false);
  });

  it('updates banner copy for readable chapters and admin sims', () => {
    expect(DEMO_BANNER_COPY).toContain('administration simulations');
    expect(DEMO_BANNER_COPY).not.toContain('chapter pages are not included');
  });
});

describe('demo backend isolation', () => {
  it('does not treat the offline stub as a live Supabase client in unit env', () => {
    expect(isSupabaseConfigured).toBe(false);
    expect(isLiveSupabaseClient()).toBe(false);
  });

  it('never constructs a placeholder createClient URL in the client module', () => {
    const source = readFileSync(
      resolve(__dirname, '../../src/integrations/supabase/client.ts'),
      'utf8'
    );
    expect(source).toContain('createOfflineDemoClient');
    expect(source).toContain('Must NEVER call createClient');
    // Offline path must not open placeholder.supabase.co
    const offlineFn = source.slice(source.indexOf('function createOfflineDemoClient'));
    expect(offlineFn).not.toMatch(/createClient\s*\(\s*['"]https:\/\/placeholder/);
  });
});

describe('reader isolation', () => {
  it('uses a single top bar and side rail without a bottom toolbar', () => {
    const source = readFileSync(
      resolve(__dirname, '../../src/components/reader/WebtoonReader.tsx'),
      'utf8'
    );
    expect(source).not.toMatch(/pages\/Admin/);
    expect(source).toContain('ReaderComments');
    expect(source).toContain('ReaderSettings');
    expect(source).toContain('data-reader-top-bar');
    expect(source).toContain('ReaderSideRail');
    expect(source).toContain('ReaderCommentsDrawer');
    expect(source).toContain('ReaderChapterList');
    expect(source).not.toMatch(/aria-label="Reader controls"[\s\S]*fixed bottom-0/);
    expect(source).not.toContain('pb-24');
    expect(source).not.toMatch(/fixed bottom-0 left-0 right-0 z-50/);
    // Mobile reading column keeps a safe-area-aware right gutter clear of the rail
    expect(source).toContain('safe-area-inset-right');
    expect(source).toMatch(/pr-\[calc\(2\.75rem/);
  });

  it('keeps the mobile side rail as a launcher that expands into a dismissible panel', () => {
    const rail = readFileSync(
      resolve(__dirname, '../../src/components/reader/ReaderSideRail.tsx'),
      'utf8'
    );
    expect(rail).toContain('data-reader-side-rail-mobile-launcher');
    expect(rail).toContain('data-reader-side-rail-mobile-panel');
    expect(rail).toContain('data-reader-side-rail-backdrop');
    expect(rail).toContain('min-h-11 min-w-11');
    expect(rail).toContain('safe-area-inset-right');
    expect(rail).toContain('Open reader controls');
    expect(rail).toContain('Dismiss reader controls');
  });

  it('layers Reader Settings select menus above the settings panel', () => {
    const source = readFileSync(
      resolve(__dirname, '../../src/components/reader/ReaderSettings.tsx'),
      'utf8'
    );
    expect(source).toContain('READER_SETTINGS_SELECT_Z');
    expect(source).toMatch(/READER_SETTINGS_SELECT_Z\s*=\s*[\s\S]*z-\[80\]/);
    expect(source).toMatch(/className=\{READER_SETTINGS_SELECT_Z\}/);
    const selectContentUsesElevatedZ = (
      source.match(/SelectContent[^>]*className=\{READER_SETTINGS_SELECT_Z\}/g) || []
    ).length;
    expect(selectContentUsesElevatedZ).toBeGreaterThanOrEqual(7);
    expect(source).toContain("addEventListener('keydown', onKeyCapture, true)");
    expect(source).toContain("querySelector('[role=\"listbox\"]')");
    expect(source).toContain('Top Bar Behavior');
    expect(source).not.toContain('Toolbar Behavior');

    const readerSource = readFileSync(
      resolve(__dirname, '../../src/components/reader/WebtoonReader.tsx'),
      'utf8'
    );
    expect(readerSource).toContain("addEventListener('keydown', onKeyCapture, true)");
    expect(readerSource).toContain('selectOpenOnEscape');
  });
});
