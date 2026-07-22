import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Bell, Home, LogOut, Plus, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { Button } from '@/components/ui/button';
import { ChapterUploadModal } from './ChapterUploadModal';
import { Badge } from '@/components/ui/badge';
import { appConfig } from '@/config/env';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isAdmin, isLoading, userProfile, signOut } = useAuth();
  const location = useLocation();
  const [showUploadModal, setShowUploadModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div
          className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"
          role="status"
          aria-label="Loading admin dashboard"
        />
      </div>
    );
  }

  // Defense-in-depth: AdminRoute already gates this tree, but never render
  // admin content if the session/role check ever comes back negative here.
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  const handleQuickUpload = () => setShowUploadModal(true);
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AdminSidebar />

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
            <div className="flex h-full items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9 hover:bg-accent" aria-label="Toggle admin navigation" />
                <div className="flex items-center gap-3">
                  <Link to="/" className="rounded-lg p-2 hover:bg-accent" aria-label="Go to homepage">
                    <Home className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  </Link>
                  <div>
                    <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
                    <p className="hidden text-xs text-muted-foreground sm:block">Zax Million management console</p>
                  </div>
                </div>
                {appConfig.isProduction ? (
                  <Badge variant="outline" className="hidden gap-1 border-emerald-500/40 text-emerald-500 sm:flex">
                    Production
                  </Badge>
                ) : (
                  <Badge variant="outline" className="hidden gap-1 border-amber-500/40 text-amber-500 sm:flex">
                    {appConfig.environment}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 lg:gap-3">
                <Button
                  onClick={handleQuickUpload}
                  size="sm"
                  className="hidden gap-2 md:flex"
                >
                  <Plus className="h-4 w-4" />
                  Quick Upload
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-muted-foreground hover:text-foreground"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-2 border-l border-border pl-2 lg:pl-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-orange-500">
                    <User className="h-4 w-4 text-white" aria-hidden />
                  </div>
                  <div className="hidden lg:block">
                    <p className="flex items-center gap-1 text-sm font-medium text-foreground">
                      {userProfile?.username || 'Admin'}
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
                    </p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={handleLogout}
                    aria-label="Log out"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:ml-2">Log out</span>
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="space-y-6 p-4 lg:p-6">{children}</div>
          </main>
        </div>

        <Button
          onClick={handleQuickUpload}
          size="lg"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl md:hidden"
          aria-label="Quick upload"
        >
          <Plus className="h-6 w-6" />
        </Button>

        <ChapterUploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} />
      </div>
    </SidebarProvider>
  );
};
