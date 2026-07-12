import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { redirectToLogin } from '@/utils/authRedirect';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ModernAdminSidebar } from "./ModernAdminSidebar";
import { Button } from "@/components/ui/button";
import { Plus, User, Bell, Settings, Home } from "lucide-react";
import { useState } from "react";
import { ChapterUploadModal } from "./ChapterUploadModal";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isAdmin, isLoading, userProfile } = useAuth();
  const { toast } = useToast();
  const [showUploadModal, setShowUploadModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    redirectToLogin();
    return null;
  }

  const handleQuickUpload = () => {
    setShowUploadModal(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <ModernAdminSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Modern Fixed Header */}
          <header className="sticky top-0 z-50 h-16 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60">
            <div className="flex h-full items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9 hover:bg-slate-800/50 transition-colors" />
                <div className="flex items-center gap-3">
                  <Link to="/" className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                    <Home className="h-5 w-5 text-slate-400 hover:text-primary transition-colors" />
                  </Link>
                  <div>
                    <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
                    <p className="text-xs text-slate-400 hidden sm:block">Manga Management System</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 lg:gap-4">
                {/* Quick Upload - Desktop */}
                <Button
                  onClick={handleQuickUpload}
                  size="sm"
                  className="hidden md:flex gap-2 bg-primary/90 hover:bg-primary text-white border-0"
                >
                  <Plus className="h-4 w-4" />
                  Quick Upload
                </Button>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-slate-400 hover:text-white hover:bg-slate-800/50"
                >
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-red-500 text-xs">3</Badge>
                </Button>

                {/* User Profile */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-orange-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-white">{userProfile?.username || 'Admin'}</p>
                    <p className="text-xs text-slate-400">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 lg:p-6 space-y-6">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Floating Action Button */}
        <Button
          onClick={handleQuickUpload}
          size="lg"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl md:hidden bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 border-0"
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Upload Modal */}
        <ChapterUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
        />
      </div>
    </SidebarProvider>
  );
};