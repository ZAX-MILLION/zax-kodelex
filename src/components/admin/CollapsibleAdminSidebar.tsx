import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Settings, 
  Users, 
  BarChart3, 
  Shield,
  Palette,
  FileText,
  Coins,
  Package,
  Menu,
  X
} from 'lucide-react';

interface AdminMenuItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  badge?: string;
  category: string;
  component: React.ComponentType;
  keywords?: string[];
}

interface CollapsibleAdminSidebarProps {
  menuItems: AdminMenuItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const CollapsibleAdminSidebar = ({ 
  menuItems, 
  activeSection, 
  onSectionChange 
}: CollapsibleAdminSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    core: true // Default to core being open
  });

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    
    const query = searchQuery.toLowerCase();
    return menuItems.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.keywords?.some(keyword => keyword.toLowerCase().includes(query)) ||
      item.category.toLowerCase().includes(query)
    );
  }, [menuItems, searchQuery]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, AdminMenuItem[]> = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      core: <Settings className="h-4 w-4" />,
      content: <FileText className="h-4 w-4" />,
      users: <Users className="h-4 w-4" />,
      analytics: <BarChart3 className="h-4 w-4" />,
      security: <Shield className="h-4 w-4" />,
      themes: <Palette className="h-4 w-4" />,
      monetization: <Coins className="h-4 w-4" />,
      system: <Package className="h-4 w-4" />
    };
    return icons[category] || <Settings className="h-4 w-4" />;
  };

  if (isCollapsed) {
    return (
      <div className="w-12 border-r bg-card p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="w-full h-8 p-0"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-card overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Admin Dashboard</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(true)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search admin features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {searchQuery && (
          <div className="mt-2 text-xs text-muted-foreground">
            {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        {Object.entries(groupedItems).map(([category, items]) => (
          <Collapsible
            key={category}
            open={openCategories[category]}
            onOpenChange={() => toggleCategory(category)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between h-auto p-3 font-normal"
              >
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  <span className="capitalize font-medium">{category}</span>
                  <Badge variant="secondary" className="text-xs">
                    {items.length}
                  </Badge>
                </div>
                {openCategories[category] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-1 ml-2">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    activeSection === item.id ? 'bg-primary/10 border-primary' : ''
                  }`}
                  onClick={() => onSectionChange(item.id)}
                >
                  <CardHeader className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="text-primary mt-0.5">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-sm truncate">
                            {item.title}
                          </CardTitle>
                          {item.badge && (
                            <Badge variant="outline" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}

        {Object.keys(groupedItems).length === 0 && searchQuery && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No matching features found</p>
            <p className="text-xs mt-1">Try different keywords</p>
          </div>
        )}
      </div>
    </div>
  );
};