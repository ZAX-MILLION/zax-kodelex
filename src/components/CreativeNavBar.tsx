import { useEffect, useState, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoRole } from '@/contexts/DemoRoleContext';
import { Link, useLocation } from 'react-router-dom';
import { appConfig } from '@/config/env';
import { shouldUseDemoRolePreview } from '@/features/demo/demoAuthPolicy';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSubscription } from '@/hooks/useSubscription';
import { AdminOnly, AuthorOnly, RoleGuard } from '@/components/auth/RoleGuard';
import ThemeSelector from './ThemeSelector';
import UserProfileBadge from './UserProfileBadge';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '@/contexts/I18nContext';
import CoinStorePopup from './CoinStorePopup';
import InteractiveSearch from './InteractiveSearch';
import { useCoinWallet } from '@/hooks/useCoinWallet';

const MangaEditModal = appConfig.disableAdmin
  ? null
  : lazy(() =>
      import('@/components/admin/MangaEditModal').then((m) => ({ default: m.MangaEditModal }))
    );
import { BookOpen, Home, User, Settings, Search, Menu, X, Star, Heart, Bookmark, TrendingUp, LogOut, Coins, Crown, Zap, Shield, Edit, HelpCircle, ShoppingCart, Mail, FlaskConical } from 'lucide-react';
const CreativeNavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showCoinStore, setShowCoinStore] = useState(false);
  const [showInteractiveSearch, setShowInteractiveSearch] = useState(false);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const {
    user,
    userProfile,
    signOut,
    isAdmin,
    isLoading
  } = useAuth();
  const {
    isPremium
  } = useSubscription();
  const {
    t
  } = useI18n();
  const location = useLocation();
  const seriesMatch = /^\/series\/([a-z0-9-]+)/i.exec(location.pathname);
  const currentSeriesId = seriesMatch ? seriesMatch[1] : null;
  const { wallet } = useCoinWallet();
  const { profile: demoProfile, isSimulatingAuth, resetDemo } = useDemoRole();
  const paymentsEnabled = appConfig.features.coinStore;
  const adminNavEnabled = appConfig.features.adminPanel;
  const demoPreview = shouldUseDemoRolePreview();
  // Avoid duplicating Role Lab in the main nav when demo CTA already covers it
  const showRoleLabNav = appConfig.features.roleLab && !demoPreview && !isSimulatingAuth;

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  const navItems = [{
    icon: Home,
    label: t('header.home', 'Home'),
    path: '/',
    color: 'manga-gold'
  }, {
    icon: BookOpen,
    label: t('header.series', 'Series'),
    path: '/series',
    color: 'manga-blue'
  }, {
    icon: Mail,
    label: t('header.contact', 'Contact Us'),
    path: '/contact',
    color: 'manga-red'
  }, ...(showRoleLabNav ? [{
    icon: FlaskConical,
    label: 'Role Lab',
    path: '/demo',
    color: 'manga-blue'
  }] : []), ...(paymentsEnabled ? [{
    icon: ShoppingCart,
    label: t('header.shop', 'Shop'),
    path: '/shop',
    color: 'manga-green'
  }] : [])];
  return <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30 pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1.5 xs:space-x-2 sm:space-x-3 group min-w-0 shrink">
            <div className="relative shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-manga-gold to-manga-red p-0.5">
                <div className="w-full h-full rounded-xl sm:rounded-2xl bg-background flex items-center justify-center">
                  <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-primary group-hover:rotate-12 transition-transform duration-300 motion-reduce:transition-none motion-reduce:transform-none" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-manga-red animate-pulse motion-reduce:animate-none"></div>
            </div>
            <div className="min-w-0">
              <span className="block text-sm sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-manga-gold bg-clip-text text-transparent truncate max-w-[9.5rem] xs:max-w-[12rem] sm:max-w-none">
                Zax Million
              </span>
              <p className="text-xs text-muted-foreground -mt-0.5 hidden sm:block">Premium manga reading</p>
            </div>
          </Link>

          {/* Tablet + Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            if (item.path === '/shop') {
              if (!paymentsEnabled) return null;
              return <button key={item.path} onClick={() => setShowCoinStore(true)} className={`relative flex items-center space-x-2 px-3 lg:px-4 py-3 min-h-11 rounded-2xl font-medium transition-all duration-200 group text-muted-foreground hover:text-foreground hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}>
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="lg:hidden sr-only">{item.label}</span>
                </button>;
            }
            return <Link key={item.path} to={item.path} className={`relative flex items-center space-x-2 px-3 lg:px-4 py-3 min-h-11 rounded-2xl font-medium transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                  <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="lg:hidden sr-only">{item.label}</span>
                  {isActive && <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-manga-gold/5 to-manga-red/5 animate-pulse motion-reduce:animate-none"></div>}
                </Link>;
          })}
          </div>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-4">
            {/* Search Icon */}
            <Button variant="ghost" size="sm" onClick={() => setShowInteractiveSearch(true)} className="h-11 w-11 min-h-[44px] min-w-[44px] p-0 rounded-lg hover:bg-muted/50" aria-label="Search">
              <Search className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
            </Button>
            {currentSeriesId && (
              <AuthorOnly hide>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickEdit(true)}
                  className="h-11 w-11 min-h-[44px] min-w-[44px] p-0 rounded-xl hover:bg-muted/50"
                  aria-label="Quick Edit"
                  title="Quick Edit"
                >
                  <Edit className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </AuthorOnly>
            )}
            {user && (
              <button
                onClick={() => setShowCoinStore(true)}
                className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-muted/50 border border-border/30 text-foreground hover:bg-muted/70 transition-colors"
                aria-label="Wallet balance"
                title="Wallet balance"
              >
                <Coins className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">{wallet?.balance ?? 0}</span>
              </button>
            )}
            {/* User Menu */}
            {!isLoading && <>
                {user ? <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center space-x-1 xs:space-x-2 cursor-pointer outline-none" aria-label="Open user menu">
                        <div className="hidden xs:block">
                          <UserProfileBadge />
                        </div>
                        <div className="w-6 h-6 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary to-manga-gold flex items-center justify-center">
                          <User className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 text-white" />
                        </div>
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-60 xs:w-72 bg-background/95 backdrop-blur-xl border border-border/30 rounded-xl xs:rounded-2xl shadow-xl p-3 xs:p-4 z-50">
                      {/* User Info */}
                      <div className="flex items-center space-x-2 xs:space-x-3 pb-3 xs:pb-4 border-b border-border/30">
                        <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-manga-gold flex items-center justify-center">
                          <User className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground text-xs xs:text-sm truncate">{user.email?.split('@')[0]}</div>
                          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                          {/* Role Badge */}
                          {userProfile?.role && <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {userProfile.role === 'admin' && <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/30">
                                  <Shield className="h-2 w-2 xs:h-3 xs:w-3 mr-1" />
                                  Admin
                                </Badge>}
                              {userProfile.role === 'author' && <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30">
                                  <Edit className="h-2 w-2 xs:h-3 xs:w-3 mr-1" />
                                  Author
                                </Badge>}
                              {isPremium && <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                                  <Crown className="h-2 w-2 xs:h-3 xs:w-3 mr-1" />
                                  Premium
                                </Badge>}
                            </div>}
                        </div>
                      </div>

                      {/* Wallet balance */}
                      {paymentsEnabled && (
                      <button
                        onClick={() => setShowCoinStore(true)}
                        className="flex items-center justify-between w-full my-2 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg xs:rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-primary" />
                          <span className="text-xs xs:text-sm">Wallet</span>
                        </span>
                        <span className="text-xs xs:text-sm font-semibold">{wallet?.balance ?? 0}</span>
                      </button>
                      )}

                      {/* Quick Links */}
                      <div className="py-1 xs:py-2 space-y-1">
                        <DropdownMenuItem asChild className="cursor-pointer rounded-lg xs:rounded-xl px-2 xs:px-3 py-1.5 xs:py-2">
                          <Link to="/profile" className="flex items-center space-x-2 xs:space-x-3">
                            <User className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
                            <span className="text-xs xs:text-sm">Profile</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer rounded-lg xs:rounded-xl px-2 xs:px-3 py-1.5 xs:py-2">
                          <Link to="/settings" className="flex items-center space-x-2 xs:space-x-3">
                            <Settings className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
                            <span className="text-xs xs:text-sm">Settings</span>
                          </Link>
                        </DropdownMenuItem>
                        <AdminOnly hide>
                          {adminNavEnabled && (
                          <DropdownMenuItem asChild className="cursor-pointer rounded-lg xs:rounded-xl px-2 xs:px-3 py-1.5 xs:py-2">
                            <Link to="/admin" className="flex items-center space-x-2 xs:space-x-3">
                              <Shield className="h-3 w-3 xs:h-4 xs:w-4 text-manga-red" />
                              <span className="text-xs xs:text-sm text-manga-red">Admin Panel</span>
                            </Link>
                          </DropdownMenuItem>
                          )}
                        </AdminOnly>
                        <AuthorOnly hide>
                          <DropdownMenuItem asChild className="cursor-pointer rounded-lg xs:rounded-xl px-2 xs:px-3 py-1.5 xs:py-2">
                            <Link to="/author" className="flex items-center space-x-2 xs:space-x-3">
                              <Edit className="h-3 w-3 xs:h-4 xs:w-4 text-blue-500" />
                              <span className="text-xs xs:text-sm text-blue-600">Author Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                        </AuthorOnly>
                      </div>

                      {/* Sign Out */}
                      <div className="pt-2 xs:pt-3 border-t border-border/30">
                        <DropdownMenuItem
                          onClick={signOut}
                          className="cursor-pointer rounded-lg xs:rounded-xl px-2 xs:px-3 py-1.5 xs:py-2 hover:bg-destructive/10 focus:bg-destructive/10"
                        >
                          <LogOut className="h-3 w-3 xs:h-4 xs:w-4 text-destructive mr-2 xs:mr-3" />
                          <span className="text-xs xs:text-sm text-destructive">Sign Out</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu> : <div className="flex items-center space-x-1 xs:space-x-2">
                    {isSimulatingAuth && demoProfile ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-xl min-h-11 text-sm px-3">
                            Demo: {demoProfile.displayName}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem asChild>
                            <Link to="/demo">Switch demo role</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              resetDemo();
                            }}
                          >
                            Reset Demo / Exit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : demoPreview ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}
                        className="rounded-xl min-h-11 text-sm px-3"
                      >
                        Try Demo
                      </Button>
                    ) : (
                      <>
                        {showRoleLabNav && (
                          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                            <Link to="/demo">Role Lab</Link>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}
                          className="rounded-xl min-h-11 text-sm px-3"
                        >
                          Sign In
                        </Button>
                      </>
                    )}
                  </div>}
              </>}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden h-11 w-11 min-h-[44px] min-w-[44px] p-0 rounded-xl"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-primary-nav"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div id="mobile-primary-nav" className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-xl max-h-[min(80vh,calc(100dvh-3.5rem))] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            <div className="container mx-auto px-3 sm:px-6 py-4">
              <div className="space-y-3">
                {/* Mobile Navigation */}
                <div className="grid grid-cols-1 gap-2">
                {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                if (item.path === '/shop') {
                  if (!paymentsEnabled) return null;
                  return <button key={item.path} onClick={() => {
                    setShowCoinStore(true);
                    setIsMenuOpen(false);
                  }} className="flex items-center space-x-3 p-3 min-h-11 rounded-xl border transition-all duration-200 bg-card/30 border-border/30 text-muted-foreground hover:text-foreground hover:bg-card/50 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="font-medium text-base break-words">{item.label}</span>
                    </button>;
                }
                return <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className={`flex items-center space-x-3 p-3 min-h-11 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-card/30 border-border/30 text-muted-foreground hover:text-foreground hover:bg-card/50'}`}>
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="font-medium text-base break-words">{item.label}</span>
                      </Link>;
              })}
                </div>

                {/* Mobile User Actions */}
                {user ? <div className="pt-3 border-t border-border/30 space-y-2">
                    {paymentsEnabled && (
                    <button
                      onClick={() => {
                        setShowCoinStore(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center justify-between w-full px-3 py-3 rounded-xl bg-background/50 border border-border/50 hover:bg-background/70 transition-colors text-base min-h-11"
                    >
                      <span className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-primary" />
                        Wallet
                      </span>
                      <span className="font-semibold">{wallet?.balance ?? 0}</span>
                    </button>
                    )}
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full bg-background/50 border-border/50 hover:bg-background/70 rounded-xl text-base min-h-11 justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                    </Link>
                    <Link to="/settings" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full bg-background/50 border-border/50 hover:bg-background/70 rounded-xl text-base min-h-11 justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </Link>
                    <AdminOnly hide>
                      {adminNavEnabled && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full bg-background/50 border-border/50 hover:bg-background/70 rounded-xl text-base min-h-11">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Button>
                      </Link>
                      )}
                    </AdminOnly>
                    <AuthorOnly hide>
                      <Link to="/author" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full bg-background/50 border-border/50 hover:bg-background/70 rounded-xl text-base min-h-11">
                          <Edit className="h-4 w-4 mr-2" />
                          Author Dashboard
                        </Button>
                      </Link>
                    </AuthorOnly>
                    <Button variant="outline" onClick={() => {
                signOut();
                setIsMenuOpen(false);
              }} className="w-full bg-background/50 border-border/50 hover:bg-background/70 rounded-xl text-base min-h-11">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div> : <div className="pt-3 border-t border-border/30 space-y-2">
                    {isSimulatingAuth && demoProfile ? (
                      <>
                        <p className="text-sm text-muted-foreground px-1">Demo: {demoProfile.displayName}</p>
                        <Button variant="outline" asChild className="w-full min-h-11">
                          <Link to="/demo" onClick={() => setIsMenuOpen(false)}>Switch demo role</Link>
                        </Button>
                        <Button
                          variant="secondary"
                          className="w-full min-h-11"
                          onClick={() => {
                            resetDemo();
                            setIsMenuOpen(false);
                          }}
                        >
                          Reset Demo / Exit
                        </Button>
                      </>
                    ) : (
                      <>
                        {showRoleLabNav && (
                          <Button variant="outline" asChild className="w-full min-h-11">
                            <Link to="/demo" onClick={() => setIsMenuOpen(false)}>Role Lab</Link>
                          </Button>
                        )}
                        <Button onClick={() => {
                          window.dispatchEvent(new CustomEvent('open-auth-modal'));
                          setIsMenuOpen(false);
                        }} className="w-full bg-gradient-to-r from-primary to-manga-gold hover:from-primary/90 hover:to-manga-gold/90 rounded-xl text-base min-h-11">
                          <User className="h-4 w-4 mr-2" />
                          {demoPreview ? 'Try Demo' : 'Sign In / Get Started'}
                        </Button>
                      </>
                    )}
                  </div>}
              </div>
            </div>
          </div>}
      </div>
      
      {/* Coin Store Popup */}
      {paymentsEnabled && <CoinStorePopup isOpen={showCoinStore} onClose={() => setShowCoinStore(false)} />}
      
      {/* Interactive Search */}
      <InteractiveSearch isOpen={showInteractiveSearch} onClose={() => setShowInteractiveSearch(false)} />
      {currentSeriesId && MangaEditModal && (
        <Suspense fallback={null}>
          <MangaEditModal
            open={showQuickEdit}
            onOpenChange={setShowQuickEdit}
            seriesId={currentSeriesId}
          />
        </Suspense>
      )}
    </nav>;
};
export default CreativeNavBar;