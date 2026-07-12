import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  TrendingUp, 
  Tags, 
  User, 
  MessageCircle,
  Eye,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { HomepageWidget } from '@/hooks/useHomepageData';

// Drag and drop would require a library like @hello-pangea/dnd which is already installed
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const WIDGET_TYPES = [
  { 
    id: 'popular_this_week', 
    name: 'Popular This Week', 
    icon: TrendingUp,
    description: 'Shows trending series based on views'
  },
  { 
    id: 'genres_list', 
    name: 'Browse by Genre', 
    icon: Tags,
    description: 'List of available genres with counts'
  },
  { 
    id: 'top_authors', 
    name: 'Top Authors', 
    icon: User,
    description: 'Most popular authors by series count'
  },
  { 
    id: 'recent_comments', 
    name: 'Recent Comments', 
    icon: MessageCircle,
    description: 'Latest user comments on series'
  },
  { 
    id: 'featured_series', 
    name: 'Featured Series', 
    icon: Sparkles,
    description: 'Manually selected featured content'
  },
  { 
    id: 'most_viewed', 
    name: 'Most Viewed', 
    icon: Eye,
    description: 'Series with highest view counts'
  }
];

export const WidgetManager = () => {
  const [widgets, setWidgets] = useState<HomepageWidget[]>([]);
  const [allWidgets, setAllWidgets] = useState<HomepageWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWidget, setEditingWidget] = useState<HomepageWidget | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    try {
      // Fetch all widgets (enabled and disabled)
      const { data, error } = await supabase
        .from('homepage_widgets')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      const formattedWidgets: HomepageWidget[] = data?.map(widget => ({
        id: widget.id,
        widget_type: widget.widget_type,
        widget_name: widget.widget_name,
        is_enabled: widget.is_enabled,
        display_order: widget.display_order,
        settings: (widget.settings as any) || {}
      })) || [];

      setAllWidgets(formattedWidgets);
      setWidgets(formattedWidgets.filter(w => w.is_enabled));
    } catch (error) {
      console.error('Error fetching widgets:', error);
      toast({
        title: "Error",
        description: "Failed to load widgets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display order
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index + 1
    }));

    setWidgets(updatedItems);

    // Update in database
    try {
      const updates = updatedItems.map(widget => ({
        id: widget.id,
        display_order: widget.display_order
      }));

      for (const update of updates) {
        await supabase
          .from('homepage_widgets')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      toast({
        title: "Success",
        description: "Widget order updated successfully"
      });
    } catch (error) {
      console.error('Error updating widget order:', error);
      toast({
        title: "Error",
        description: "Failed to update widget order",
        variant: "destructive"
      });
      // Revert on error
      fetchWidgets();
    }
  };

  const toggleWidget = async (widgetId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('homepage_widgets')
        .update({ is_enabled: enabled })
        .eq('id', widgetId);

      if (error) throw error;

      await fetchWidgets();
      toast({
        title: "Success",
        description: `Widget ${enabled ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      console.error('Error toggling widget:', error);
      toast({
        title: "Error",
        description: "Failed to update widget",
        variant: "destructive"
      });
    }
  };

  const saveWidget = async (widget: Partial<HomepageWidget>) => {
    try {
      if (editingWidget) {
        // Update existing widget
        const { error } = await supabase
          .from('homepage_widgets')
          .update({
            widget_name: widget.widget_name,
            settings: widget.settings
          })
          .eq('id', editingWidget.id);

        if (error) throw error;
      } else {
        // Create new widget
        const { error } = await supabase
          .from('homepage_widgets')
          .insert({
            widget_type: widget.widget_type!,
            widget_name: widget.widget_name!,
            settings: widget.settings || {},
            display_order: allWidgets.length + 1
          });

        if (error) throw error;
      }

      await fetchWidgets();
      setEditingWidget(null);
      setShowAddDialog(false);
      toast({
        title: "Success",
        description: editingWidget ? "Widget updated successfully" : "Widget created successfully"
      });
    } catch (error) {
      console.error('Error saving widget:', error);
      toast({
        title: "Error",
        description: "Failed to save widget",
        variant: "destructive"
      });
    }
  };

  const deleteWidget = async (widgetId: string) => {
    try {
      const { error } = await supabase
        .from('homepage_widgets')
        .delete()
        .eq('id', widgetId);

      if (error) throw error;

      await fetchWidgets();
      toast({
        title: "Success",
        description: "Widget deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast({
        title: "Error",
        description: "Failed to delete widget",
        variant: "destructive"
      });
    }
  };

  const getWidgetIcon = (type: string) => {
    const widgetType = WIDGET_TYPES.find(w => w.id === type);
    return widgetType?.icon || Settings;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Widget Manager</CardTitle>
          <CardDescription>Loading widgets...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Widget Manager
          </CardTitle>
          <CardDescription>
            Manage homepage widgets, reorder them, and configure their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">Active Widgets</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop to reorder widgets
              </p>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {widgets.map((widget, index) => {
                    const Icon = getWidgetIcon(widget.widget_type);
                    return (
                      <Draggable key={widget.id} draggableId={widget.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab hover:cursor-grabbing"
                                  >
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <Icon className="h-5 w-5 text-primary" />
                                  <div>
                                    <h4 className="font-medium">{widget.widget_name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {widget.settings?.items_count || 5} items • Order: {index + 1}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={widget.is_enabled ? 'default' : 'secondary'}>
                                    {widget.is_enabled ? 'Enabled' : 'Disabled'}
                                  </Badge>
                                  <Switch
                                    checked={widget.is_enabled}
                                    onCheckedChange={(checked) => toggleWidget(widget.id, checked)}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingWidget(widget)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteWidget(widget.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {widgets.length === 0 && (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active widgets</h3>
              <p className="text-muted-foreground">Add some widgets to customize your homepage</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disabled Widgets */}
      {allWidgets.filter(w => !w.is_enabled).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Disabled Widgets</CardTitle>
            <CardDescription>
              These widgets are available but not currently displayed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allWidgets.filter(w => !w.is_enabled).map((widget) => {
                const Icon = getWidgetIcon(widget.widget_type);
                return (
                  <Card key={widget.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{widget.widget_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {widget.settings?.items_count || 5} items
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Disabled</Badge>
                          <Switch
                            checked={false}
                            onCheckedChange={() => toggleWidget(widget.id, true)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingWidget(widget)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteWidget(widget.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Widget Dialog */}
      <WidgetEditDialog
        widget={editingWidget}
        open={!!editingWidget || showAddDialog}
        onOpenChange={(open) => {
          if (!open) {
            setEditingWidget(null);
            setShowAddDialog(false);
          }
        }}
        onSave={saveWidget}
      />
    </div>
  );
};

interface WidgetEditDialogProps {
  widget: HomepageWidget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (widget: Partial<HomepageWidget>) => void;
}

const WidgetEditDialog = ({ widget, open, onOpenChange, onSave }: WidgetEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<HomepageWidget>>({
    widget_name: '',
    widget_type: '',
    settings: { items_count: 5, title: '' }
  });

  useEffect(() => {
    if (widget) {
      setFormData(widget);
    } else {
      setFormData({
        widget_name: '',
        widget_type: '',
        settings: { items_count: 5, title: '' }
      });
    }
  }, [widget]);

  const handleSave = () => {
    onSave(formData);
  };

  const selectedWidgetType = WIDGET_TYPES.find(w => w.id === formData.widget_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {widget ? 'Edit Widget' : 'Add New Widget'}
          </DialogTitle>
          <DialogDescription>
            Configure the widget settings and display options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!widget && (
            <div className="space-y-2">
              <Label htmlFor="widget_type">Widget Type</Label>
              <Select
                value={formData.widget_type}
                onValueChange={(value) => {
                  const widgetType = WIDGET_TYPES.find(w => w.id === value);
                  setFormData(prev => ({
                    ...prev,
                    widget_type: value,
                    widget_name: widgetType?.name || '',
                    settings: { ...prev.settings, title: widgetType?.name || '' }
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select widget type" />
                </SelectTrigger>
                <SelectContent>
                  {WIDGET_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{type.name}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="widget_name">Widget Name</Label>
            <Input
              id="widget_name"
              value={formData.widget_name}
              onChange={(e) => setFormData(prev => ({ ...prev, widget_name: e.target.value }))}
              placeholder="Enter widget name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Display Title</Label>
            <Input
              id="title"
              value={formData.settings?.title || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                settings: { ...prev.settings, title: e.target.value }
              }))}
              placeholder="Title shown on the widget"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="items_count">Number of Items</Label>
            <Input
              id="items_count"
              type="number"
              min="1"
              max="20"
              value={formData.settings?.items_count || 5}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                settings: { ...prev.settings, items_count: parseInt(e.target.value) || 5 }
              }))}
            />
          </div>

          {selectedWidgetType && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <selectedWidgetType.icon className="h-4 w-4" />
                <span className="font-medium">{selectedWidgetType.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedWidgetType.description}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!formData.widget_name || (!widget && !formData.widget_type)}
          >
            {widget ? 'Update Widget' : 'Create Widget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};