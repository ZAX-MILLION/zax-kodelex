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
export type ReaderWidth = 'full' | 'comfortable' | 'boxed' | 'custom';
export type PageAlign = 'center' | 'left' | 'right';
export type ReaderBackground = 'black' | 'charcoal' | 'soft-dark' | 'sepia';
export type ToolbarBehavior = 'auto-hide' | 'always' | 'tap';
export type ProgressStyle = 'full' | 'bar' | 'minimal' | 'hidden';

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
  toolbarBehavior: ToolbarBehavior;
  progressStyle: ProgressStyle;
}

export const READER_SETTINGS_DEFAULTS: ReaderSettingsState = {
  readingMode: 'webtoon',
  direction: 'ltr',
  widthMode: 'boxed',
  customMaxWidth: 900,
  imageFit: 'width',
  imageScale: 100,
  imageGap: 0,
  background: 'charcoal',
  pageAlign: 'center',
  toolbarBehavior: 'auto-hide',
  progressStyle: 'full',
};

const STORAGE_KEY = 'zax-reader-settings-v1';

const BACKGROUND_CSS: Record<ReaderBackground, string> = {
  black: '#000000',
  charcoal: '#141414',
  'soft-dark': '#1c1c1e',
  sepia: '#2a241c',
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function sanitize(raw: unknown): ReaderSettingsState {
  if (!raw || typeof raw !== 'object') return { ...READER_SETTINGS_DEFAULTS };
  const o = raw as Partial<ReaderSettingsState>;
  const readingMode = ['webtoon', 'single', 'double'].includes(o.readingMode as string)
    ? (o.readingMode as ReadingMode)
    : READER_SETTINGS_DEFAULTS.readingMode;
  const direction = ['ltr', 'rtl'].includes(o.direction as string)
    ? (o.direction as ReadingDirection)
    : READER_SETTINGS_DEFAULTS.direction;
  const widthMode = ['full', 'comfortable', 'boxed', 'custom'].includes(o.widthMode as string)
    ? (o.widthMode as ReaderWidth)
    : READER_SETTINGS_DEFAULTS.widthMode;
  const imageFit = ['width', 'screen', 'original', 'contain'].includes(o.imageFit as string)
    ? (o.imageFit as ImageFit)
    : READER_SETTINGS_DEFAULTS.imageFit;
  const background = ['black', 'charcoal', 'soft-dark', 'sepia'].includes(o.background as string)
    ? (o.background as ReaderBackground)
    : READER_SETTINGS_DEFAULTS.background;
  const pageAlign = ['center', 'left', 'right'].includes(o.pageAlign as string)
    ? (o.pageAlign as PageAlign)
    : READER_SETTINGS_DEFAULTS.pageAlign;
  const toolbarBehavior = ['auto-hide', 'always', 'tap'].includes(o.toolbarBehavior as string)
    ? (o.toolbarBehavior as ToolbarBehavior)
    : READER_SETTINGS_DEFAULTS.toolbarBehavior;
  const progressStyle = ['full', 'bar', 'minimal', 'hidden'].includes(o.progressStyle as string)
    ? (o.progressStyle as ProgressStyle)
    : READER_SETTINGS_DEFAULTS.progressStyle;

  return {
    readingMode,
    direction: readingMode === 'webtoon' ? 'ltr' : direction,
    widthMode,
    customMaxWidth: clamp(Number(o.customMaxWidth) || 900, 480, 1400),
    imageFit,
    imageScale: clamp(Number(o.imageScale) || 100, 50, 200),
    imageGap: clamp(Number(o.imageGap) || 0, 0, 48),
    background,
    pageAlign,
    toolbarBehavior,
    progressStyle,
  };
}

function loadSettings(): ReaderSettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
    const contentMaxWidth =
      settings.widthMode === 'full'
        ? '100%'
        : settings.widthMode === 'comfortable'
          ? 720
          : settings.widthMode === 'custom'
            ? settings.customMaxWidth
            : 900;

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
