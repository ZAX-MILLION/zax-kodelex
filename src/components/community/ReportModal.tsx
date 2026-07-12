import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Flag } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: string;
  targetId: string;
}

const reportReasons = [
  { value: 'spam', label: 'Spam or repetitive content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate_content', label: 'Inappropriate or offensive content' },
  { value: 'copyright', label: 'Copyright violation' },
  { value: 'misinformation', label: 'False or misleading information' },
  { value: 'other', label: 'Other (please specify)' },
];

export const ReportModal = ({ isOpen, onClose, targetType, targetId }: ReportModalProps) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !reason) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          target_type: targetType,
          target_id: targetId,
          reason,
          description: description.trim() || null,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Reported",
            description: "You have already reported this content.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Report Submitted",
          description: "Thank you for helping keep our community safe. We'll review your report.",
        });
        
        // Create notification for content moderation
        await supabase
          .from('user_notifications')
          .insert({
            user_id: user.id,
            type: 'content_reported',
            title: 'Report Submitted',
            message: `Your report for ${targetType} has been submitted and will be reviewed by our moderation team.`,
            related_type: targetType,
            related_id: targetId,
          });

        onClose();
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Report Content
          </DialogTitle>
          <DialogDescription>
            Help us maintain a safe and respectful community by reporting content that violates our guidelines.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">Why are you reporting this content?</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="mt-3">
              {reportReasons.map((reportReason) => (
                <div key={reportReason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reportReason.value} id={reportReason.value} />
                  <Label htmlFor={reportReason.value} className="text-sm font-normal">
                    {reportReason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="description">
              Additional details (optional)
              {reason === 'other' && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide any additional context that might help us understand the issue..."
              rows={4}
              className="mt-2"
            />
            {reason === 'other' && !description.trim() && (
              <p className="text-sm text-red-500 mt-1">
                Please provide details when selecting "Other"
              </p>
            )}
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Community Guidelines Reminder:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be respectful and civil in all interactions</li>
              <li>• No spam, harassment, or offensive content</li>
              <li>• Respect intellectual property rights</li>
              <li>• Report genuine violations only</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!reason || isSubmitting || (reason === 'other' && !description.trim())}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};