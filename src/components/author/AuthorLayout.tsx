import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AuthorSidebar } from './AuthorSidebar';
import { AuthorHeader } from './AuthorHeader';

interface AuthorLayoutProps {
  children: ReactNode;
}

export const AuthorLayout = ({ children }: AuthorLayoutProps) => {
  const { user, userProfile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is author or admin
  const isAuthor = userProfile?.role === 'author' || userProfile?.role === 'admin';
  
  if (!user || !isAuthor) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AuthorSidebar />
        <div className="flex-1">
          <AuthorHeader />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};