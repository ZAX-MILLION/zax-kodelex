import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReaderComments } from './ReaderComments';
import { cn } from '@/lib/utils';

interface ReaderCommentsDrawerProps {
  open: boolean;
  onClose: () => void;
  chapterKey: string;
  onJumpToInline: () => void;
}

export function ReaderCommentsDrawer({
  open,
  onClose,
  chapterKey,
  onJumpToInline,
}: ReaderCommentsDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-stretch sm:justify-end print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Chapter comments"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close comments"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-[71] flex w-full flex-col border border-border bg-background shadow-2xl',
          'h-[min(92dvh,720px)] rounded-t-2xl sm:h-full sm:max-h-none sm:w-[min(28rem,100vw)] sm:rounded-none sm:rounded-l-xl',
          'pb-[max(0.5rem,env(safe-area-inset-bottom))]'
        )}
      >
        <div className="flex items-center justify-between border-b border-border/50 px-3 py-2 shrink-0">
          <p className="text-sm font-medium">Comments</p>
          <Button variant="ghost" size="sm" className="min-h-11 min-w-11" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-3 pt-2">
          <ReaderComments
            chapterKey={chapterKey}
            variant="drawer"
            onRequestClose={onClose}
            onJumpToInline={onJumpToInline}
          />
        </div>
      </div>
    </div>
  );
}
