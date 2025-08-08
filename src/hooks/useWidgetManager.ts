import { useState, useEffect } from 'react';
import { WidgetConfig, WidgetType, WIDGET_TEMPLATES } from '@/types/widgets';

export const useWidgetManager = () => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Default homepage configuration
  const defaultWidgets: WidgetConfig[] = [
    {
      id: 'hero-1',
      type: 'hero-slider',
      title: 'Featured',
      enabled: true,
      order: 1,
      settings: {
        itemCount: 10,
        seriesType: 'both',
        showTitle: true,
        autoSlide: true,
        slideInterval: 5000,
        showFilters: true,
        sortBy: 'trending'
      }
    },
    {
      id: 'latest-1',
      type: 'latest-comics',
      title: 'Latest Comics',
      enabled: true,
      order: 2,
      settings: {
        itemCount: 12,
        seriesType: 'manga',
        showTitle: true,
        columns: 4,
        sortBy: 'latest'
      }
    },
    {
      id: 'trending-1',
      type: 'trending-carousel',
      title: 'Trending Now',
      enabled: true,
      order: 3,
      settings: {
        itemCount: 10,
        seriesType: 'both',
        showTitle: true,
        sortBy: 'trending'
      }
    },
    {
      id: 'whats-hot-1',
      type: 'whats-hot',
      title: "What's Hot",
      enabled: true,
      order: 4,
      settings: {
        itemCount: 6,
        seriesType: 'both',
        showTitle: true,
        columns: 3
      }
    }
  ];

  useEffect(() => {
    // Load widgets from localStorage or use defaults
    const savedWidgets = localStorage.getItem('homepage-widgets');
    if (savedWidgets) {
      try {
        setWidgets(JSON.parse(savedWidgets));
      } catch (error) {
        console.error('Failed to parse saved widgets:', error);
        setWidgets(defaultWidgets);
      }
    } else {
      setWidgets(defaultWidgets);
    }
    setLoading(false);
  }, []);

  const saveWidgets = (updatedWidgets: WidgetConfig[]) => {
    setWidgets(updatedWidgets);
    localStorage.setItem('homepage-widgets', JSON.stringify(updatedWidgets));
  };

  const addWidget = (type: WidgetType): WidgetConfig => {
    const template = WIDGET_TEMPLATES.find(t => t.type === type);
    if (!template) throw new Error(`Widget template not found: ${type}`);

    const newWidget: WidgetConfig = {
      id: `${type}-${Date.now()}`,
      type,
      title: template.name,
      enabled: true,
      order: widgets.length + 1,
      settings: { ...template.defaultSettings }
    };

    const updatedWidgets = [...widgets, newWidget];
    saveWidgets(updatedWidgets);
    return newWidget;
  };

  const updateWidget = (id: string, updates: Partial<WidgetConfig>) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === id ? { ...widget, ...updates } : widget
    );
    saveWidgets(updatedWidgets);
  };

  const deleteWidget = (id: string) => {
    const updatedWidgets = widgets.filter(widget => widget.id !== id);
    saveWidgets(updatedWidgets);
  };

  const reorderWidgets = (startIndex: number, endIndex: number) => {
    const result = Array.from(widgets);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Update order values
    const reorderedWidgets = result.map((widget, index) => ({
      ...widget,
      order: index + 1
    }));

    saveWidgets(reorderedWidgets);
  };

  const toggleWidget = (id: string) => {
    updateWidget(id, { enabled: !widgets.find(w => w.id === id)?.enabled });
  };

  const resetToDefaults = () => {
    saveWidgets(defaultWidgets);
  };

  const getEnabledWidgets = () => {
    return widgets
      .filter(widget => widget.enabled)
      .sort((a, b) => a.order - b.order);
  };

  return {
    widgets,
    loading,
    addWidget,
    updateWidget,
    deleteWidget,
    reorderWidgets,
    toggleWidget,
    resetToDefaults,
    getEnabledWidgets
  };
};