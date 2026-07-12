import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Settings, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Grid,
  Image,
  TrendingUp,
  BookOpen,
  Flame,
  Star,
  Clock,
  Filter,
  User,
  Book,
  MessageCircle,
  Shuffle,
  History,
  Play,
  Award,
  Trophy
} from 'lucide-react';
import { useWidgetManager } from '@/hooks/useWidgetManager';
import { WIDGET_TEMPLATES, WidgetConfig, WidgetType } from '@/types/widgets';

const iconMap = {
  Image, TrendingUp, BookOpen, Flame, Star, Eye, Plus, Clock, Filter, User, Book, 
  MessageCircle, Shuffle, History, Play, Award, Trophy, Grid
};

export const HomepageWidgetManager = () => {
  const { widgets, loading, addWidget, updateWidget, deleteWidget, reorderWidgets, toggleWidget, resetToDefaults } = useWidgetManager();
  const [selectedWidget, setSelectedWidget] = useState<WidgetConfig | null>(null);
  const [isAddingWidget, setIsAddingWidget] = useState(false);

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Grid;
    return <IconComponent className="h-4 w-4" />;
  };

  const handleSettingsUpdate = (settings: any) => {
    if (selectedWidget) {
      updateWidget(selectedWidget.id, { settings });
      setSelectedWidget({ ...selectedWidget, settings });
    }
  };

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const currentIndex = widgets.findIndex(w => w.id === id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < widgets.length) {
      reorderWidgets(currentIndex, newIndex);
    }
  };

  const categorizedTemplates = WIDGET_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof WIDGET_TEMPLATES>);

  if (loading) {
    return <div className="animate-pulse">Loading widget manager...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Homepage Widgets</h2>
          <p className="text-muted-foreground">Customize your homepage layout and content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Dialog open={isAddingWidget} onOpenChange={setIsAddingWidget}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add New Widget</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="navigation">Navigation</TabsTrigger>
                  <TabsTrigger value="user">User</TabsTrigger>
                  <TabsTrigger value="interactive">Interactive</TabsTrigger>
                </TabsList>
                {Object.entries(categorizedTemplates).map(([category, templates]) => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {templates.map((template) => (
                        <Card 
                          key={template.type} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => {
                            addWidget(template.type);
                            setIsAddingWidget(false);
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              {getIcon(template.icon)}
                              <h4 className="font-semibold">{template.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                            <Badge variant="outline" className="mt-2">
                              {category}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Widgets ({widgets.filter(w => w.enabled).length}/{widgets.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {widgets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No widgets configured. Add your first widget to get started.
                </div>
              ) : (
                widgets.map((widget, index) => (
                  <div 
                    key={widget.id} 
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      widget.enabled ? 'bg-background' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveWidget(widget.id, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveWidget(widget.id, 'down')}
                          disabled={index === widgets.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getIcon(WIDGET_TEMPLATES.find(t => t.type === widget.type)?.icon || 'Grid')}
                        <div>
                          <div className="font-medium">{widget.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {widget.settings.itemCount} items • {widget.settings.seriesType}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={widget.enabled}
                        onCheckedChange={() => toggleWidget(widget.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedWidget(widget)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWidget(widget.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Widget Settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Widget Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedWidget ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="widget-title">Widget Title</Label>
                    <Input
                      id="widget-title"
                      value={selectedWidget.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        updateWidget(selectedWidget.id, { title: newTitle });
                        setSelectedWidget({ ...selectedWidget, title: newTitle });
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="item-count">Item Count</Label>
                    <Input
                      id="item-count"
                      type="number"
                      min="1"
                      max="20"
                      value={selectedWidget.settings.itemCount || 5}
                      onChange={(e) => handleSettingsUpdate({
                        ...selectedWidget.settings,
                        itemCount: parseInt(e.target.value)
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="series-type">Series Type</Label>
                    <Select
                      value={selectedWidget.settings.seriesType}
                      onValueChange={(value) => handleSettingsUpdate({
                        ...selectedWidget.settings,
                        seriesType: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Both</SelectItem>
                        <SelectItem value="manga">Manga Only</SelectItem>
                        <SelectItem value="novel">Novel Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedWidget.settings.columns !== undefined && (
                    <div>
                      <Label htmlFor="columns">Columns</Label>
                      <Select
                        value={selectedWidget.settings.columns?.toString()}
                        onValueChange={(value) => handleSettingsUpdate({
                          ...selectedWidget.settings,
                          columns: parseInt(value)
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 Columns</SelectItem>
                          <SelectItem value="3">3 Columns</SelectItem>
                          <SelectItem value="4">4 Columns</SelectItem>
                          <SelectItem value="5">5 Columns</SelectItem>
                          <SelectItem value="6">6 Columns</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-title"
                      checked={selectedWidget.settings.showTitle}
                      onCheckedChange={(checked) => handleSettingsUpdate({
                        ...selectedWidget.settings,
                        showTitle: checked
                      })}
                    />
                    <Label htmlFor="show-title">Show Title</Label>
                  </div>

                  {selectedWidget.type === 'hero-slider' && (
                    <>
                      <div>
                        <Label htmlFor="slider-item-count">Slider Items (5-16)</Label>
                        <Input
                          id="slider-item-count"
                          type="number"
                          min="5"
                          max="16"
                          value={selectedWidget.settings.itemCount || 10}
                          onChange={(e) => handleSettingsUpdate({
                            ...selectedWidget.settings,
                            itemCount: parseInt(e.target.value)
                          })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="sort-method">Sort Method</Label>
                        <Select
                          value={selectedWidget.settings.sortBy || 'trending'}
                          onValueChange={(value) => handleSettingsUpdate({
                            ...selectedWidget.settings,
                            sortBy: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="trending">Trending</SelectItem>
                            <SelectItem value="latest">Latest</SelectItem>
                            <SelectItem value="popular">Popular</SelectItem>
                            <SelectItem value="rating">Top Rated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="auto-slide"
                          checked={selectedWidget.settings.autoSlide}
                          onCheckedChange={(checked) => handleSettingsUpdate({
                            ...selectedWidget.settings,
                            autoSlide: checked
                          })}
                        />
                        <Label htmlFor="auto-slide">Auto Slide</Label>
                      </div>

                      {selectedWidget.settings.autoSlide && (
                        <div>
                          <Label htmlFor="slide-interval">Slide Interval (ms)</Label>
                          <Input
                            id="slide-interval"
                            type="number"
                            min="2000"
                            max="10000"
                            step="1000"
                            value={selectedWidget.settings.slideInterval || 5000}
                            onChange={(e) => handleSettingsUpdate({
                              ...selectedWidget.settings,
                              slideInterval: parseInt(e.target.value)
                            })}
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-filters"
                          checked={selectedWidget.settings.showFilters !== false}
                          onCheckedChange={(checked) => handleSettingsUpdate({
                            ...selectedWidget.settings,
                            showFilters: checked
                          })}
                        />
                        <Label htmlFor="show-filters">Show Filter Buttons</Label>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a widget to configure its settings
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Total Widgets:</span>
                <span>{widgets.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Enabled:</span>
                <span>{widgets.filter(w => w.enabled).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Disabled:</span>
                <span>{widgets.filter(w => !w.enabled).length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};