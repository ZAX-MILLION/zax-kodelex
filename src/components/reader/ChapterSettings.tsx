import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Settings, X } from 'lucide-react';
import { useChapterLayout, type ReadingMode, type ImageFit } from '@/hooks/useChapterLayout';

interface ChapterSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChapterSettings = ({ isOpen, onClose }: ChapterSettingsProps) => {
  const {
    readingMode,
    imageGap,
    imageFit,
    imageScale,
    updateReadingMode,
    updateImageGap,
    updateImageFit,
    updateImageScale,
    loading
  } = useChapterLayout();

  const [boxedWidth, setBoxedWidth] = useState(() => {
    const stored = localStorage.getItem('manga-boxed-width');
    // Default to true (boxed) unless explicitly set to 'false'
    return stored === null ? true : stored === 'true';
  });

  const handleBoxedWidthChange = (enabled: boolean) => {
    setBoxedWidth(enabled);
    localStorage.setItem('manga-boxed-width', enabled.toString());
    // Trigger a custom event to update the reader
    window.dispatchEvent(new CustomEvent('boxedWidthChange', { detail: enabled }));
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed top-20 right-4 z-50 w-80 p-4 bg-background/95 backdrop-blur-sm border shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Chapter Settings
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading settings...</div>
      ) : (
        <div className="space-y-4">
          {/* Reading Mode */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Reading Mode</Label>
            <Select value={readingMode} onValueChange={(value: ReadingMode) => updateReadingMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webtoon">Webtoon (Vertical)</SelectItem>
                <SelectItem value="single">Single Page</SelectItem>
                <SelectItem value="double">Double Page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Boxed Width */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Boxed Width</Label>
            <Switch
              checked={boxedWidth}
              onCheckedChange={handleBoxedWidthChange}
            />
          </div>

          {/* Image Fit */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Image Fit</Label>
            <Select value={imageFit} onValueChange={(value: ImageFit) => updateImageFit(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contain">Fit to Screen</SelectItem>
                <SelectItem value="width">Fit to Width</SelectItem>
                <SelectItem value="height">Fit to Height</SelectItem>
                <SelectItem value="auto">Original Size</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image Scale */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Image Scale: {imageScale}%</Label>
            <Slider
              value={[imageScale]}
              onValueChange={(value) => updateImageScale(value[0])}
              min={50}
              max={200}
              step={10}
              className="w-full"
            />
          </div>

          {/* Image Gap (for webtoon mode) */}
          {readingMode === 'webtoon' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Image Gap: {imageGap}px</Label>
              <Slider
                value={[imageGap]}
                onValueChange={(value) => updateImageGap(value[0])}
                min={0}
                max={50}
                step={5}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
};