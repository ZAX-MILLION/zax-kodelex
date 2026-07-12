import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ChapterLayout = 1 | 2 | 3;
export type ReadingMode = 'single' | 'webtoon' | 'double';
export type ImageFit = 'contain' | 'width' | 'height' | 'auto';

export const useChapterLayout = () => {
  const { user } = useAuth();
  const [layout, setLayout] = useState<ChapterLayout>(1);
  const [readingMode, setReadingMode] = useState<ReadingMode>('webtoon');
  const [imageGap, setImageGap] = useState(0); // Gap in pixels - 0 for seamless webtoon
  const [imageFit, setImageFit] = useState<ImageFit>('height');
  const [imageScale, setImageScale] = useState(100); // Scale percentage
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLayout = async () => {
      try {
        // Load from localStorage for all users since database columns don't exist yet
        const savedLayout = localStorage.getItem('chapter-layout');
        const savedReadingMode = localStorage.getItem('reading-mode');
        const savedImageGap = localStorage.getItem('image-gap');
        const savedImageFit = localStorage.getItem('image-fit');
        const savedImageScale = localStorage.getItem('image-scale');
        
        if (savedLayout) {
          const parsedLayout = parseInt(savedLayout) as ChapterLayout;
          if ([1, 2, 3].includes(parsedLayout)) {
            setLayout(parsedLayout);
          }
        }
        
        if (savedReadingMode && ['single', 'webtoon', 'double'].includes(savedReadingMode)) {
          setReadingMode(savedReadingMode as ReadingMode);
        }
        
        if (savedImageGap) {
          const gap = parseInt(savedImageGap);
          if (!isNaN(gap) && gap >= 0 && gap <= 50) {
            setImageGap(gap);
          }
        }
        
        if (savedImageFit && ['contain', 'width', 'height', 'auto'].includes(savedImageFit)) {
          setImageFit(savedImageFit as ImageFit);
        }
        
        if (savedImageScale) {
          const scale = parseInt(savedImageScale);
          if (!isNaN(scale) && scale >= 50 && scale <= 200) {
            setImageScale(scale);
          }
        }
      } catch (error) {
        console.error('Error loading chapter layout:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLayout();
  }, [user]);

  const updateLayout = async (newLayout: ChapterLayout) => {
    setLayout(newLayout);
    await savePreferences({ layout: newLayout });
  };

  const updateReadingMode = async (mode: ReadingMode) => {
    setReadingMode(mode);
    await savePreferences({ readingMode: mode });
  };

  const updateImageGap = async (gap: number) => {
    setImageGap(gap);
    await savePreferences({ imageGap: gap });
  };

  const updateImageFit = async (fit: ImageFit) => {
    setImageFit(fit);
    await savePreferences({ imageFit: fit });
  };

  const updateImageScale = async (scale: number) => {
    setImageScale(scale);
    await savePreferences({ imageScale: scale });
  };

  const savePreferences = async (prefs: {
    layout?: ChapterLayout;
    readingMode?: ReadingMode;
    imageGap?: number;
    imageFit?: ImageFit;
    imageScale?: number;
  }) => {
    try {
      // Save to localStorage for all users since database columns don't exist yet
      if (prefs.layout !== undefined) {
        localStorage.setItem('chapter-layout', prefs.layout.toString());
      }
      if (prefs.readingMode !== undefined) {
        localStorage.setItem('reading-mode', prefs.readingMode);
      }
      if (prefs.imageGap !== undefined) {
        localStorage.setItem('image-gap', prefs.imageGap.toString());
      }
      if (prefs.imageFit !== undefined) {
        localStorage.setItem('image-fit', prefs.imageFit);
      }
      if (prefs.imageScale !== undefined) {
        localStorage.setItem('image-scale', prefs.imageScale.toString());
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  return {
    layout,
    readingMode,
    imageGap,
    imageFit,
    imageScale,
    updateLayout,
    updateReadingMode,
    updateImageGap,
    updateImageFit,
    updateImageScale,
    loading
  };
};