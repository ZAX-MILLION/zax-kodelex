import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import React, { Suspense, ReactNode, lazy } from 'react';
import { LoadingState } from './components/LoadingSpinner';
import { AuthProvider } from './contexts/AuthContext';
import { DemoRoleProvider } from './contexts/DemoRoleContext';
import { FeatureFlagProvider } from './contexts/FeatureFlagContext';
import { AdminRouteGuard, PaymentsRouteGuard } from './components/guards/FeatureRouteGuard';
import ErrorBoundary from './components/ErrorBoundary';
import Analytics from './components/Analytics';
import PWAInstaller from './components/PWAInstaller';
import { useColorScheme } from './hooks/useColorScheme';
import { ThemeProvider } from './components/themes/ThemeProvider';
import { EnhancedSEOHelmet } from './components/EnhancedSEOHelmet';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { AnalyticsWrapper } from './components/AnalyticsWrapper';
import { InstallationGate } from './components/setup/InstallationGate';
import './utils/logger';

// Lazy-load heavy routes so the homepage loads fast
const Blog = lazy(() => import('./pages/Blog'));
const MangaReader = lazy(() => import('./pages/MangaReader'));
const Reader = lazy(() => import('./pages/Reader'));
const LoginRedirect = lazy(() => import('./pages/LoginRedirect'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const Author = lazy(() => import('./pages/Author'));
const Support = lazy(() => import('./pages/Support'));
const Subscribe = lazy(() => import('./pages/Subscribe'));
const Premium = lazy(() => import('./pages/Premium'));
const Buy = lazy(() => import('./pages/Buy'));
const Contests = lazy(() => import('./pages/Contests'));
const Coins = lazy(() => import('./pages/Coins'));
const Monetization = lazy(() => import('./pages/Monetization'));
const Series = lazy(() => import('./pages/Series'));
const Browse = lazy(() => import('./pages/Browse'));
const Categories = lazy(() => import('./pages/Categories'));
const Contact = lazy(() => import('./pages/Contact'));
const Help = lazy(() => import('./pages/Help'));
const Search = lazy(() => import('./pages/Search'));
const SeriesDetail = lazy(() => import('./pages/SeriesDetail'));
const DMCAPage = lazy(() => import('./pages/DMCAPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage'));
const AcceptableUsePage = lazy(() => import('./pages/AcceptableUsePage'));
const Article = lazy(() => import('./pages/Article'));
const Feedback = lazy(() => import('./pages/Feedback'));
const Community = lazy(() => import('./pages/Community'));
const CoinAnalytics = lazy(() => import('./pages/CoinAnalytics'));
const WordPressCrawler = lazy(() =>
  import('./pages/WordPressCrawler').then((m) => ({ default: m.WordPressCrawler }))
);
const Settings = lazy(() => import('./pages/Settings'));
const Chapters = lazy(() => import('./pages/Chapters'));
const DemoRoleLab = lazy(() => import('./pages/DemoRoleLab'));

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
              <Route path="/admin/*" element={<AdminRouteGuard><Admin /></AdminRouteGuard>} />
              <Route path="/author/*" element={<Author />} />
              <Route path="/support" element={<AppShell><Support /></AppShell>} />
              <Route path="/coins" element={<PaymentsRouteGuard><AppShell><Coins /></AppShell></PaymentsRouteGuard>} />
              <Route path="/monetization" element={<PaymentsRouteGuard><AppShell><Monetization /></AppShell></PaymentsRouteGuard>} />
              <Route path="/subscribe" element={<PaymentsRouteGuard><AppShell><Subscribe /></AppShell></PaymentsRouteGuard>} />
              <Route path="/premium" element={<AppShell><Premium /></AppShell>} />
              <Route path="/buy" element={<PaymentsRouteGuard><AppShell><Buy /></AppShell></PaymentsRouteGuard>} />
              <Route path="/contests" element={<AppShell><Contests /></AppShell>} />
              <Route path="/demo" element={<AppShell><DemoRoleLab /></AppShell>} />
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
              <Route path="/disclaimer" element={<AppShell><DisclaimerPage /></AppShell>} />
              <Route path="/acceptable-use" element={<AppShell><AcceptableUsePage /></AppShell>} />
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

const routerBasename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || undefined;

const App = () => (
  <BrowserRouter basename={routerBasename}>
    <ErrorBoundary>
      <HelmetProvider>
        <TooltipProvider>
          <AuthProvider>
            <DemoRoleProvider>
              <FeatureFlagProvider>
                <Toaster />
                <Sonner />
                <AppContent />
              </FeatureFlagProvider>
            </DemoRoleProvider>
          </AuthProvider>
        </TooltipProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </BrowserRouter>
);

export default App;
