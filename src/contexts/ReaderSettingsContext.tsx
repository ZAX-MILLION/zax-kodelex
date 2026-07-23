import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { appConfig } from '@/config/env';

export type ReadingMode = 'webtoon' | 'single' | 'double';
export type ReadingDirection = 'ltr' | 'rtl';
export type ImageFit = 'width' | 'screen' | 'original' | 'contain';
export type ReaderWidth = 'original' | 'comfortable' | 'wide' | 'full' | 'custom';
export type PageAlign = 'center' | 'left' | 'right';
export type ReaderBackground = 'black' | 'charcoal' | 'soft-dark' | 'sepia';
/** Top bar chrome — replaces legacy toolbarBehavior (bottom bar removed). */
export type TopBarBehavior = 'always' | 'auto-hide' | 'tap';
export type SideRailBehavior = 'always' | 'auto-hide' | 'collapsed-mobile';
export type ProgressStyle = 'badge' | 'percent' | 'bar' | 'hidden';
export type AutoScrollSpeed = 'slow' | 'normal' | 'fast';

/** @deprecated kept for sanitizing older stored settings */
export type ToolbarBehavior = 'auto-hide' | 'always' | 'tap';

export interface ReaderSettingsState {
  readingMode: ReadingMode;
  direction: ReadingDirection;
  widthMode: ReaderWidth;
  customMaxWidth: number;
  imageFit: ImageFit;
  imageScale: number;
  imageGap: number;
  background: ReaderBackground;
  pageAlign: PageAlign;
  topBarBehavior: TopBarBehavior;
  sideRailBehavior: SideRailBehavior;
  progressStyle: ProgressStyle;
  autoScrollSpeed: AutoScrollSpeed;
}

export const READER_SETTINGS_DEFAULTS: ReaderSettingsState = {
  readingMode: 'webtoon',
  direction: 'ltr',
  widthMode: 'wide',
  customMaxWidth: 1050,
  imageFit: 'width',
  imageScale: 100,
  imageGap: 0,
  background: 'charcoal',
  pageAlign: 'center',
  topBarBehavior: 'always',
  sideRailBehavior: 'collapsed-mobile',
  progressStyle: 'badge',
  autoScrollSpeed: 'normal',
};

const STORAGE_KEY = 'zax-reader-settings-v2';
const LEGACY_STORAGE_KEY = 'zax-reader-settings-v1';

const BACKGROUND_CSS: Record<ReaderBackground, string> = {
  black: '#000000',
  charcoal: '#141414',
  'soft-dark': '#1c1c1e',
  sepia: '#2a241c',
};

const WIDTH_PRESETS: Record<Exclude<ReaderWidth, 'full' | 'custom'>, number> = {
  original: 720,
  comfortable: 860,
  wide: 1050,
};

export const AUTO_SCROLL_PX_PER_FRAME: Record<AutoScrollSpeed, number> = {
  slow: 0.55,
  normal: 1.15,
  fast: 2.2,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function migrateWidthMode(raw: unknown): ReaderWidth {
  if (raw === 'boxed') return 'wide';
  if (['original', 'comfortable', 'wide', 'full', 'custom'].includes(raw as string)) {
    return raw as ReaderWidth;
  }
  return READER_SETTINGS_DEFAULTS.widthMode;
}

function migrateProgressStyle(raw: unknown): ProgressStyle {
  if (raw === 'full' || raw === 'minimal') return 'badge';
  if (['badge', 'percent', 'bar', 'hidden'].includes(raw as string)) {
    return raw as ProgressStyle;
  }
  return READER_SETTINGS_DEFAULTS.progressStyle;
}

function migrateTopBar(raw: Partial<ReaderSettingsState> & { toolbarBehavior?: string }): TopBarBehavior {
  if (['always', 'auto-hide', 'tap'].includes(raw.topBarBehavior as string)) {
    return raw.topBarBehavior as TopBarBehavior;
  }
  if (['always', 'auto-hide', 'tap'].includes(raw.toolbarBehavior as string)) {
    return raw.toolbarBehavior as TopBarBehavior;
  }
  return READER_SETTINGS_DEFAULTS.topBarBehavior;
}

function sanitize(raw: unknown): ReaderSettingsState {
  if (!raw || typeof raw !== 'object') return { ...READER_SETTINGS_DEFAULTS };
  const o = raw as Partial<ReaderSettingsState> & { toolbarBehavior?: string };
  const readingMode = ['webtoon', 'single', 'double'].includes(o.readingMode as string)
    ? (o.readingMode as ReadingMode)
    : READER_SETTINGS_DEFAULTS.readingMode;
  const direction = ['ltr', 'rtl'].includes(o.direction as string)
    ? (o.direction as ReadingDirection)
    : READER_SETTINGS_DEFAULTS.direction;
  const widthMode = migrateWidthMode(o.widthMode);
  const imageFit = ['width', 'screen', 'original', 'contain'].includes(o.imageFit as string)
    ? (o.imageFit as ImageFit)
    : READER_SETTINGS_DEFAULTS.imageFit;
  const background = ['black', 'charcoal', 'soft-dark', 'sepia'].includes(o.background as string)
    ? (o.background as ReaderBackground)
    : READER_SETTINGS_DEFAULTS.background;
  const pageAlign = ['center', 'left', 'right'].includes(o.pageAlign as string)
    ? (o.pageAlign as PageAlign)
    : READER_SETTINGS_DEFAULTS.pageAlign;
  const sideRailBehavior = ['always', 'auto-hide', 'collapsed-mobile'].includes(
    o.sideRailBehavior as string
  )
    ? (o.sideRailBehavior as SideRailBehavior)
    : READER_SETTINGS_DEFAULTS.sideRailBehavior;
  const autoScrollSpeed = ['slow', 'normal', 'fast'].includes(o.autoScrollSpeed as string)
    ? (o.autoScrollSpeed as AutoScrollSpeed)
    : READER_SETTINGS_DEFAULTS.autoScrollSpeed;

  return {
    readingMode,
    direction: readingMode === 'webtoon' ? 'ltr' : direction,
    widthMode,
    customMaxWidth: clamp(Number(o.customMaxWidth) || 1050, 480, 1400),
    imageFit,
    imageScale: clamp(Number(o.imageScale) || 100, 50, 200),
    imageGap: clamp(Number(o.imageGap) || 0, 0, 48),
    background,
    pageAlign,
    topBarBehavior: migrateTopBar(o),
    sideRailBehavior,
    progressStyle: migrateProgressStyle(o.progressStyle),
    autoScrollSpeed,
  };
}

function loadSettings(): ReaderSettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return { ...READER_SETTINGS_DEFAULTS };
    return sanitize(JSON.parse(raw));
  } catch {
    return { ...READER_SETTINGS_DEFAULTS };
  }
}

interface ReaderSettingsContextValue {
  settings: ReaderSettingsState;
  patch: (partial: Partial<ReaderSettingsState>) => void;
  resetSettings: () => void;
  backgroundCss: string;
  contentMaxWidth: string | number | undefined;
  justifyClass: string;
}

const ReaderSettingsContext = createContext<ReaderSettingsContextValue | undefined>(undefined);

export function ReaderSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ReaderSettingsState>(() =>
    typeof window === 'undefined' ? { ...READER_SETTINGS_DEFAULTS } : loadSettings()
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore quota */
    }
  }, [settings]);

  const patch = useCallback((partial: Partial<ReaderSettingsState>) => {
    setSettings((prev) => sanitize({ ...prev, ...partial }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...READER_SETTINGS_DEFAULTS });
  }, []);

  const value = useMemo<ReaderSettingsContextValue>(() => {
    let contentMaxWidth: string | number | undefined;
    if (settings.widthMode === 'full') contentMaxWidth = '100%';
    else if (settings.widthMode === 'custom') contentMaxWidth = settings.customMaxWidth;
    else contentMaxWidth = WIDTH_PRESETS[settings.widthMode];

    const justifyClass =
      settings.pageAlign === 'left'
        ? 'mr-auto'
        : settings.pageAlign === 'right'
          ? 'ml-auto'
          : 'mx-auto';

    return {
      settings,
      patch,
      resetSettings,
      backgroundCss: BACKGROUND_CSS[settings.background],
      contentMaxWidth,
      justifyClass,
    };
  }, [settings, patch, resetSettings]);

  return (
    <ReaderSettingsContext.Provider value={value}>{children}</ReaderSettingsContext.Provider>
  );
}

export function useReaderSettings() {
  const ctx = useContext(ReaderSettingsContext);
  if (!ctx) {
    throw new Error('useReaderSettings must be used within ReaderSettingsProvider');
  }
  return ctx;
}

/** Pure helpers for unit tests */
export function applyReaderSettingsPatch(
  current: ReaderSettingsState,
  partial: Partial<ReaderSettingsState>
): ReaderSettingsState {
  return sanitize({ ...current, ...partial });
}

export function getReaderSettingsStorageKey() {
  return STORAGE_KEY;
}

export function isDemoReaderPersistenceLocalOnly() {
  return appConfig.isDemo;
}
