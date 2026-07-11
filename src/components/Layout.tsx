import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import UserProfileBadge from './UserProfileBadge';
import Footer from './Footer';
import ThemeSelector from './ThemeSelector';
import BackToTop from './BackToTop';
import CreativeNavBar from './CreativeNavBar';
import zaxMillionLogo from '@/assets/zax-million-logo.png';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user, isAdmin, signOut, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Expanded reader routes for immersive experience
  const path = location.pathname || '';
  const isReaderPage = /\/reader\//i.test(path) || /\/read\//i.test(path) || /\/series\/.+\/chapter\/.+/i.test(path);

  // Listen for global auth modal open events
  useEffect(() => {
    const openHandler = () => setShowAuthModal(true);
    window.addEventListener('open-auth-modal', openHandler as EventListener);
    return () => window.removeEventListener('open-auth-modal', openHandler as EventListener);
  }, []);
  
  if (isReaderPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <CreativeNavBar />
      <main className="flex-1 w-full max-w-full">{children}</main>
      <BackToTop />
      <Footer />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Layout;