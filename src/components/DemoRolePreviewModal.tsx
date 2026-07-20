import { useNavigate } from 'react-router-dom';
import { FlaskConical, User, Crown, Coins, Upload, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDemoRole } from '@/contexts/DemoRoleContext';
import { DEMO_ROLE_PREVIEW_ACTIONS } from '@/features/demo/demoAuthPolicy';
import type { DemoRoleId } from '@/config/env';

interface DemoRolePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICONS: Partial<Record<DemoRoleId, typeof User>> = {
  member: User,
  paid: Crown,
  buyer: Coins,
  uploader: Upload,
  admin: Shield,
};

/**
 * Demo-only replacement for real Sign In — no Supabase, no passwords.
 */
const DemoRolePreviewModal = ({ isOpen, onClose }: DemoRolePreviewModalProps) => {
  const navigate = useNavigate();
  const { setActiveRole, enabled } = useDemoRole();

  const handlePreview = (role: DemoRoleId, path: string) => {
    if (!enabled) return;
    setActiveRole(role);
    onClose();
    navigate(path);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-sm border-border/50 max-h-[90vh] overflow-y-auto shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-manga-red flex items-center justify-center gap-2">
            <FlaskConical className="h-6 w-6" aria-hidden />
            Try Demo Roles
          </DialogTitle>
          <p className="text-center text-muted-foreground text-sm">
            Demo preview — no account or password required.
          </p>
        </DialogHeader>

        <div className="space-y-2 pt-2">
          {DEMO_ROLE_PREVIEW_ACTIONS.map((action) => {
            const Icon = ICONS[action.role] ?? User;
            return (
              <Button
                key={action.path}
                variant="outline"
                className="w-full min-h-11 h-auto py-3 justify-start gap-3 text-left"
                onClick={() => handlePreview(action.role, action.path)}
              >
                <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <span className="flex flex-col items-start gap-0.5">
                  <span className="font-medium">{action.label}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {action.description}
                  </span>
                </span>
              </Button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          className="w-full min-h-11"
          onClick={() => {
            onClose();
            navigate('/demo');
          }}
        >
          Open full Role Lab
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DemoRolePreviewModal;
