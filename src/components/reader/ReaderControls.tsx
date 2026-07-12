import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Scroll, 
  BookOpen, 
  Columns2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Expand,
  Minimize,
  Layers,
  Eye,
  Monitor
} from 'lucide-react';
import { useChapterLayout, ReadingMode, ImageFit } from '@/hooks/useChapterLayout';

interface ReaderControlsProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const ReaderControls = ({ isVisible, onToggle }: ReaderControlsProps) => {
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

  const [showAdvanced, setShowAdvanced] = useState(false);

  if (loading) return null;

  return (
    <>
      {/* Settings Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onToggle}
        className="fixed top-20 right-4 z-50 bg-background/95 backdrop-blur-sm border-border/50 hover:bg-accent"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {/* Settings Panel */}
      {isVisible && (
        <Card className="fixed top-16 right-2 sm:right-4 z-50 w-72 sm:w-80 max-w-[calc(100vw-1rem)] p-3 sm:p-4 bg-background/95 backdrop-blur-sm border-border/50 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Reading Settings</h3>
              <Button variant="ghost" size="icon" onClick={onToggle}>
                <Minimize className="h-4 w-4" />
              </Button>
            </div>

            {/* Reading Mode */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Reading Mode
              </Label>
              <Select value={readingMode} onValueChange={(value) => updateReadingMode(value as ReadingMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single" className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Single Page
                  </SelectItem>
                  <SelectItem value="webtoon" className="flex items-center gap-2">
                    <Scroll className="h-4 w-4" />
                    Webtoon Style
                  </SelectItem>
                  <SelectItem value="double" className="flex items-center gap-2">
                    <Columns2 className="h-4 w-4" />
                    Double Page
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {readingMode === 'single' && 'Traditional manga reading, one page at a time'}
                {readingMode === 'webtoon' && 'Vertical scrolling, all pages in sequence'}
                {readingMode === 'double' && 'Side-by-side pages for wide screen reading'}
              </p>
            </div>

            <Separator />

            {/* Image Settings */}
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Image Settings
              </Label>

              {/* Image Fit */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Image Fit</Label>
                <Select value={imageFit} onValueChange={(value) => updateImageFit(value as ImageFit)}>
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
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Scale</Label>
                  <span className="text-xs font-mono">{imageScale}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateImageScale(Math.max(50, imageScale - 10))}
                  >
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <Slider
                    value={[imageScale]}
                    onValueChange={([value]) => updateImageScale(value)}
                    min={50}
                    max={200}
                    step={5}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateImageScale(Math.min(200, imageScale + 10))}
                  >
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateImageScale(100)}
                  className="w-full text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset to 100%
                </Button>
              </div>

              {/* Image Gap (Webtoon Mode) */}
              {readingMode === 'webtoon' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Page Gap</Label>
                    <span className="text-xs font-mono">{imageGap}px</span>
                  </div>
                  <Slider
                    value={[imageGap]}
                    onValueChange={([value]) => updateImageGap(value)}
                    min={0}
                    max={50}
                    step={2}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>No Gap</span>
                    <span>Large Gap</span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Advanced Settings Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Advanced Settings
              </Label>
              <Switch
                checked={showAdvanced}
                onCheckedChange={setShowAdvanced}
              />
            </div>

            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Keyboard Shortcuts</Label>
                  <div className="text-xs space-y-1 p-3 bg-muted/50 rounded-md">
                    <div className="flex justify-between">
                      <span>Next Page:</span>
                      <code className="bg-background px-1 rounded">→ / D</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Previous Page:</span>
                      <code className="bg-background px-1 rounded">← / A</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Toggle Controls:</span>
                      <code className="bg-background px-1 rounded">Space</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Fullscreen:</span>
                      <code className="bg-background px-1 rounded">F</code>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Performance Tips</Label>
                  <div className="text-xs space-y-1 p-3 bg-muted/50 rounded-md">
                    <p>• Webtoon mode preloads all pages for smooth scrolling</p>
                    <p>• Single page mode loads pages on demand</p>
                    <p>• Lower scale reduces memory usage</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reset All */}
            <Button
              variant="outline"
              onClick={() => {
                updateReadingMode('single');
                updateImageGap(4);
                updateImageFit('contain');
                updateImageScale(100);
              }}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All Settings
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};