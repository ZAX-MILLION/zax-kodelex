import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  ArrowUpDown, 
  EyeOff, 
  Eye, 
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChapterControlsProps {
  totalChapters: number;
  lockedChapters: number;
  sortOrder: 'asc' | 'desc';
  showLocked: boolean;
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onShowLockedChange: (show: boolean) => void;
}

export const ChapterControls: React.FC<ChapterControlsProps> = ({
  totalChapters,
  lockedChapters,
  sortOrder,
  showLocked,
  onSortOrderChange,
  onShowLockedChange
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {totalChapters} chapters total
          {lockedChapters > 0 && (
            <span className="ml-2">
              ({lockedChapters} locked)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Sort Order Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSortOrderChange(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="gap-2"
              >
                {sortOrder === 'desc' ? (
                  <>
                    <SortDesc className="h-4 w-4" />
                    Newest First
                  </>
                ) : (
                  <>
                    <SortAsc className="h-4 w-4" />
                    Oldest First
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {sortOrder === 'desc' 
                  ? 'Switch to show oldest chapters first' 
                  : 'Switch to show newest chapters first'
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Show/Hide Locked Chapters */}
        {lockedChapters > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Label htmlFor="show-locked" className="text-sm cursor-pointer">
                    Show locked
                  </Label>
                  <Switch
                    id="show-locked"
                    checked={showLocked}
                    onCheckedChange={onShowLockedChange}
                  />
                  {showLocked ? (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {showLocked 
                    ? 'Hide locked chapters from the list' 
                    : 'Show locked chapters (grayed out)'
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};