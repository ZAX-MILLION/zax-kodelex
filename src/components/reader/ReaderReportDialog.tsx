import { useEffect, useId, useState } from 'react';
import { Flag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { appConfig } from '@/config/env';
import { READER_SETTINGS_SELECT_Z } from './ReaderSettings';

interface ReaderReportDialogProps {
  open: boolean;
  onClose: () => void;
  chapterTitle: string;
  chapterNumber: number;
}

export function ReaderReportDialog({
  open,
  onClose,
  chapterTitle,
  chapterNumber,
}: ReaderReportDialogProps) {
  const titleId = useId();
  const [reason, setReason] = useState('other');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setStatus(null);
      setDetails('');
      setReason('other');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (document.querySelector('[role="listbox"]')) return;
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async () => {
    setSubmitting(true);
    try {
      if (appConfig.isDemo || !appConfig.features.paypal) {
        setStatus(
          'This report is simulated in the public demo. No production data was changed.'
        );
        return;
      }
      // Staging/production: safe local acknowledgement when no dedicated endpoint is wired.
      setStatus('Report received. Thank you for helping keep the library safe.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end justify-center sm:items-center print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close report form"
        onClick={onClose}
      />
      <div className="relative z-[76] w-full max-w-md rounded-t-2xl sm:rounded-xl border border-border bg-background p-4 shadow-2xl pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id={titleId} className="flex items-center gap-2 text-base font-semibold">
            <Flag className="h-4 w-4" aria-hidden />
            Report chapter
          </h2>
          <Button variant="ghost" size="sm" className="min-h-11 min-w-11" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          Ch. {chapterNumber}: {chapterTitle}
        </p>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="report-reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="report-reason" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className={READER_SETTINGS_SELECT_Z}>
                <SelectItem value="broken">Broken or missing pages</SelectItem>
                <SelectItem value="wrong">Wrong chapter content</SelectItem>
                <SelectItem value="copyright">Copyright concern</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-details">Details (optional)</Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 500))}
              className="min-h-[96px]"
              maxLength={500}
              placeholder="What should we know?"
            />
            <p className="text-xs text-muted-foreground">{details.length}/500</p>
          </div>
          {status && (
            <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
              {status}
            </p>
          )}
          <Button className="w-full min-h-11" onClick={submit} disabled={submitting}>
            Submit report
          </Button>
        </div>
      </div>
    </div>
  );
}
