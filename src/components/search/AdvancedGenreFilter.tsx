import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Filter } from 'lucide-react';

interface GenreFilterState {
  [genre: string]: 'none' | 'include' | 'exclude';
}

interface AdvancedGenreFilterProps {
  availableGenres: string[];
  onFilterChange: (included: string[], excluded: string[]) => void;
  className?: string;
}

export const AdvancedGenreFilter: React.FC<AdvancedGenreFilterProps> = ({
  availableGenres,
  onFilterChange,
  className = ""
}) => {
  const [genreStates, setGenreStates] = useState<GenreFilterState>({});

  const getGenreState = (genre: string): 'none' | 'include' | 'exclude' => {
    return genreStates[genre] || 'none';
  };

  const toggleGenreState = (genre: string) => {
    const currentState = getGenreState(genre);
    let newState: 'none' | 'include' | 'exclude';

    switch (currentState) {
      case 'none':
        newState = 'include';
        break;
      case 'include':
        newState = 'exclude';
        break;
      case 'exclude':
        newState = 'none';
        break;
    }

    const newStates = { ...genreStates, [genre]: newState };
    setGenreStates(newStates);

    // Calculate included and excluded arrays
    const included = Object.entries(newStates)
      .filter(([_, state]) => state === 'include')
      .map(([genre, _]) => genre);
    
    const excluded = Object.entries(newStates)
      .filter(([_, state]) => state === 'exclude')
      .map(([genre, _]) => genre);

    onFilterChange(included, excluded);
  };

  const clearAllFilters = () => {
    setGenreStates({});
    onFilterChange([], []);
  };

  const getStateColor = (state: 'none' | 'include' | 'exclude') => {
    switch (state) {
      case 'include':
        return 'bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20';
      case 'exclude':
        return 'bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20';
      default:
        return 'bg-muted hover:bg-muted/80';
    }
  };

  const getStateIcon = (state: 'none' | 'include' | 'exclude') => {
    switch (state) {
      case 'include':
        return <Plus className="h-3 w-3" />;
      case 'exclude':
        return <X className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const hasActiveFilters = Object.values(genreStates).some(state => state !== 'none');

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Genre Filter
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-auto p-1 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">
            Click once to include, twice to exclude, third to remove
          </div>
          
          <div className="flex flex-wrap gap-2">
            {availableGenres.map((genre) => {
              const state = getGenreState(genre);
              return (
                <Badge
                  key={genre}
                  variant="outline"
                  className={`cursor-pointer transition-all duration-200 ${getStateColor(state)} gap-1`}
                  onClick={() => toggleGenreState(genre)}
                >
                  {getStateIcon(state)}
                  {genre}
                </Badge>
              );
            })}
          </div>

          {hasActiveFilters && (
            <div className="pt-2 border-t text-xs space-y-1">
              {Object.entries(genreStates)
                .filter(([_, state]) => state === 'include')
                .length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-green-600 font-medium">Include:</span>
                  <span className="text-muted-foreground">
                    {Object.entries(genreStates)
                      .filter(([_, state]) => state === 'include')
                      .map(([genre, _]) => genre)
                      .join(', ')}
                  </span>
                </div>
              )}
              
              {Object.entries(genreStates)
                .filter(([_, state]) => state === 'exclude')
                .length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-red-600 font-medium">Exclude:</span>
                  <span className="text-muted-foreground">
                    {Object.entries(genreStates)
                      .filter(([_, state]) => state === 'exclude')
                      .map(([genre, _]) => genre)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};