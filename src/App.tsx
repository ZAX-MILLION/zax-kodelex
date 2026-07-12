import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import React, { Suspense, ReactNode } from 'react';
import { LoadingState } from './components/LoadingSpinner';
import { AuthProvider } from './contexts/AuthContext';
import { FeatureFlagProvider } from './contexts/FeatureFlagContext';
import ErrorBoundary from './components/ErrorBoundary';
import Analytics from './components/Analytics';
import PWAInstaller from './components/PWAInstaller';
import { useColorScheme } from './hooks/useColorScheme';
import { ThemeProvider } from './components/themes/ThemeProvider';
import { EnhancedSEOHelmet } from './components/EnhancedSEOHelmet';
import Home from './pages/Home';
import Blog from './pages/Blog';
import MangaReader from './pages/MangaReader';
import Reader from './pages/Reader';
import LoginRedirect from './pages/LoginRedirect';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Author from './pages/Author';
import Support from './pages/Support';
import Subscribe from './pages/Subscribe';
import Premium from './pages/Premium';
import NotFound from './pages/NotFound';
import { AnalyticsWrapper } from './components/AnalyticsWrapper';
import Buy from './pages/Buy';
import Contests from './pages/Contests';
import Coins from './pages/Coins';
import Monetization from './pages/Monetization';
import Series from './pages/Series';
import Browse from './pages/Browse';
import Categories from './pages/Categories';
import Contact from './pages/Contact';
import Help from './pages/Help';
import Search from './pages/Search';
import SeriesDetail from './pages/SeriesDetail';
import { InstallationGate } from './components/setup/InstallationGate';
import DMCAPage from './pages/DMCAPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CookiesPage from './pages/CookiesPage';
import Article from './pages/Article';
import Feedback from './pages/Feedback';
import Community from './pages/Community';
import CoinAnalytics from './pages/CoinAnalytics';
import { WordPressCrawler } from './pages/WordPressCrawler';
import Settings from './pages/Settings';
import Chapters from './pages/Chapters';
import './utils/logger';

function AppShell({ children, seo }: { children: ReactNode; seo?: ReactNode }) {
  return (
    <>
      {seo}
      <Layout>{children}</Layout>
    </>
  );
}

function AppContent() {
  useColorScheme();

  return (
    <InstallationGate>
      <ThemeProvider>
        <AnalyticsWrapper>
          <Analytics />
          <PWAInstaller />
          <Suspense fallback={<LoadingState message="Loading..." />}>
            <Routes>
              <Route
                path="/"
                element={
                  <AppShell
                    seo={
                      <EnhancedSEOHelmet
                        title="Zax Million — Premium Manga Reading"
                        description="Read manga online with Zax Million — premium themes, smooth reader, and curated library."
                        keywords="manga, read manga online, zax million, webtoon, manhwa"
                        image={`${window.location.origin}/zax-million-favicon.png`}
                      />
                    }
                  >
                    <Home />
                  </AppShell>
                }
              />
              <Route path="/home" element={<AppShell><Home /></AppShell>} />
              <Route path="/login" element={<LoginRedirect />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reader/:chapterId" element={<AppShell><Reader /></AppShell>} />
              <Route path="/reader/:seriesId/:chapterNumber" element={<AppShell><Reader /></AppShell>} />
              <Route path="/profile" element={<AppShell><Profile /></AppShell>} />
              <Route path="/support" element={<AppShell><Support /></AppShell>} />
              <Route path="/subscribe" element={<AppShell><Subscribe /></AppShell>} />
              <Route path="/premium" element={<AppShell><Premium /></AppShell>} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="/author/*" element={<Author />} />
              <Route path="/buy" element={<AppShell><Buy /></AppShell>} />
              <Route path="/contests" element={<AppShell><Contests /></AppShell>} />
              <Route path="/coins" element={<AppShell><Coins /></AppShell>} />
              <Route path="/monetization" element={<AppShell><Monetization /></AppShell>} />
              <Route path="/series" element={<AppShell><Series /></AppShell>} />
              <Route path="/series/:id" element={<AppShell><SeriesDetail /></AppShell>} />
              <Route path="/browse" element={<AppShell><Browse /></AppShell>} />
              <Route path="/categories" element={<AppShell><Categories /></AppShell>} />
              <Route path="/authors" element={<AppShell><Browse /></AppShell>} />
              <Route path="/trending" element={<AppShell><Browse /></AppShell>} />
              <Route path="/contact" element={<AppShell><Contact /></AppShell>} />
              <Route path="/help" element={<AppShell><Help /></AppShell>} />
              <Route path="/search" element={<AppShell><Search /></AppShell>} />
              <Route path="/setup" element={<Navigate to="/" replace />} />
              <Route path="/dmca" element={<AppShell><DMCAPage /></AppShell>} />
              <Route path="/privacy" element={<AppShell><PrivacyPage /></AppShell>} />
              <Route path="/terms" element={<AppShell><TermsPage /></AppShell>} />
              <Route path="/cookies" element={<AppShell><CookiesPage /></AppShell>} />
              <Route path="/article/:id" element={<AppShell><Article /></AppShell>} />
              <Route path="/feedback" element={<AppShell><Feedback /></AppShell>} />
              <Route path="/community" element={<AppShell><Community /></AppShell>} />
              <Route path="/install" element={<Navigate to="/" replace />} />
              <Route path="/coin-analytics" element={<AppShell><CoinAnalytics /></AppShell>} />
              <Route path="/wordpress-crawler" element={<AppShell><WordPressCrawler /></AppShell>} />
              <Route path="/read/:seriesSlug/:chapterSlug" element={<MangaReader />} />
              <Route path="/series/:id/chapter/:chapterNumber" element={<AppShell><Reader /></AppShell>} />
              <Route path="/blog" element={<AppShell><Blog /></AppShell>} />
              <Route path="/blog/:slug" element={<AppShell><Blog /></AppShell>} />
              <Route path="/settings" element={<AppShell><Settings /></AppShell>} />
              <Route path="/chapters" element={<AppShell><Chapters /></AppShell>} />
              <Route path="*" element={<AppShell><NotFound /></AppShell>} />
            </Routes>
          </Suspense>
        </AnalyticsWrapper>
      </ThemeProvider>
    </InstallationGate>
  );
}

const App = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <HelmetProvider>
        <TooltipProvider>
          <AuthProvider>
            <FeatureFlagProvider>
              <Toaster />
              <Sonner />
              <AppContent />
            </FeatureFlagProvider>
          </AuthProvider>
        </TooltipProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </BrowserRouter>
);

export default App;
