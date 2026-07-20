import { useEffect, useRef } from 'react';
import { Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  useReaderSettings,
  type ReadingMode,
  type ImageFit,
  type ReaderWidth,
  type ReaderBackground,
  type PageAlign,
  type ToolbarBehavior,
  type ProgressStyle,
  type ReadingDirection,
} from '@/contexts/ReaderSettingsContext';

interface ReaderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Select portals to document.body with default z-50.
 * Reader Settings overlay uses z-[60]/z-[61], so dropdowns must sit above that stack.
 */
export const READER_SETTINGS_SELECT_Z =
  'z-[80] max-h-[min(16rem,50vh)] overflow-y-auto';

export const ReaderSettings = ({ isOpen, onClose }: ReaderSettingsProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const { settings, patch, resetSettings } = useReaderSettings();

  useEffect(() => {
    if (!isOpen) return;
    // Capture phase sees an open listbox before Radix unmounts it on Escape.
    let selectOpenOnEscape = false;
    const onKeyCapture = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      selectOpenOnEscape = !!document.querySelector('[role="listbox"]');
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (selectOpenOnEscape) {
        selectOpenOnEscape = false;
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', onKeyCapture, true);
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKeyCapture, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-start sm:justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Reader Settings"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close reader settings"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-[61] w-full sm:w-96 sm:max-w-[calc(100vw-2rem)] sm:mt-20 sm:mr-4 max-h-[min(90vh,720px)] overflow-y-auto rounded-t-2xl sm:rounded-xl border border-border bg-background/98 backdrop-blur-md shadow-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] outline-none"
      >
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-background/95 py-1 z-10">
          <h3 className="font-semibold flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" aria-hidden />
            Reader Settings
          </h3>
          <Button variant="ghost" size="sm" className="min-h-11 min-w-11" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="reading-mode">Reading Mode</Label>
            <Select
              value={settings.readingMode}
              onValueChange={(value: ReadingMode) => patch({ readingMode: value })}
            >
              <SelectTrigger id="reading-mode" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className={READER_SETTINGS_SELECT_Z}>
                <SelectItem value="webtoon">Webtoon / continuous vertical</SelectItem>
                <SelectItem value="single">Single page</SelectItem>
                <SelectItem value="double">Two page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.readingMode !== 'webtoon' && (
            <div className="space-y-2">
              <Label htmlFor="reading-direction">Direction</Label>
              <Select
                value={settings.direction}
                onValueChange={(value: ReadingDirection) => patch({ direction: value })}
              >
                <SelectTrigger id="reading-direction" className="min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4} className={READER_SETTINGS_SELECT_Z}>
                  <SelectItem value="ltr">Left to right</SelectItem>
                  <SelectItem value="rtl">Right to left</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reader-width">Reader Width</Label>
            <Select
              value={settings.widthMode}
              onValueChange={(value: ReaderWidth) => patch({ widthMode: value })}
            >
              <SelectTrigger id="reader-width" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className={READER_SETTINGS_SELECT_Z}>
                <SelectItem value="full">Full width</SelectItem>
                <SelectItem value="comfortable">Comfortable (720px)</SelectItem>
                <SelectItem value="boxed">Boxed (900px)</SelectItem>
                <SelectItem value="custom">Custom maximum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.widthMode === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-width">Custom max width: {settings.customMaxWidth}px</Label>
              <Slider
                id="custom-width"
                value={[settings.customMaxWidth]}
                onValueChange={([v]) => patch({ customMaxWidth: v })}
                min={480}
                max={1400}
                step={20}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="image-fit">Image Fit</Label>
            <Select
              value={settings.imageFit}
              onValueChange={(value: ImageFit) => patch({ imageFit: value })}
            >
              <SelectTrigger id="image-fit" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className={READER_SETTINGS_SELECT_Z}>
                <SelectItem value="width">Fit to width</SelectItem>
                <SelectItem value="screen">Fit to screen</SelectItem>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="original">Original size</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-scale">Image Scale: {settings.imageScale}%</Label>
            <Slider
              id="image-scale"
              value={[settings.imageScale]}
              onValueChange={([v]) => patch({ imageScale: v })}
              min={50}
              max={200}
              step={5}
            />
          </div>

          {settings.readingMode === 'webtoon' && (
            <div className="space-y-2">
              <Label htmlFor="image-gap">Image Gap: {settings.imageGap}px</Label>
              <Slider
                id="image-gap"
                value={[settings.imageGap]}
                onValueChange={([v]) => patch({ imageGap: v })}
                min={0}
                max={48}
                step={2}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reader-bg">Background</Label>
            <Select
              value={settings.background}
              onValueChange={(value: ReaderBackground) => patch({ background: value })}
            >
              <SelectTrigger id="reader-bg" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className={READER_SETTINGS_SELECT_Z}>
                <SelectItem value="black">Pure black</SelectItem>
                <SelectItem value="charcoal">Charcoal</SelectItem>
                <SelectItem value="soft-dark">Soft dark</SelectItem>
                <SelectItem value="sepia">Warm paper</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="page-align">Page Alignment</Label>
            <Select
              value={settings.pageAlign}
              onValueChange={(value: PageAlign) => patch({ pageAlign: value })}
            >
              <SelectTrigger id="page-align" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className={READER_SETTINGS_SELECT_Z}>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toolbar-behavior">Toolbar Behavior</Label>
            <Select
              value={settings.toolbarBehavior}
              onValueChange={(value: ToolbarBehavior) => patch({ toolbarBehavior: value })}
            >
              <SelectTrigger id="toolbar-behavior" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className={READER_SETTINGS_SELECT_Z}>
                <SelectItem value="auto-hide">Auto-hide on scroll</SelectItem>
                <SelectItem value="always">Always visible</SelectItem>
                <SelectItem value="tap">Tap to toggle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="progress-style">Progress</Label>
            <Select
              value={settings.progressStyle}
              onValueChange={(value: ProgressStyle) => patch({ progressStyle: value })}
            >
              <SelectTrigger id="progress-style" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className={READER_SETTINGS_SELECT_Z}>
                <SelectItem value="full">Page count + percentage + bar</SelectItem>
                <SelectItem value="bar">Progress bar only</SelectItem>
                <SelectItem value="minimal">Page count only</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">
            Image quality options appear when alternate sources are available. Demo chapters use a
            single original asset.
          </p>

          <Button variant="outline" className="w-full min-h-11" onClick={resetSettings}>
            Reset Reader Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReaderSettings;
