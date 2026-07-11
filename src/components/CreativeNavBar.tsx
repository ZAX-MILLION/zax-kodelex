import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useSubscription } from '@/hooks/useSubscription';
import { AdminOnly, AuthorOnly, RoleGuard } from '@/components/auth/RoleGuard';
import ThemeSelector from './ThemeSelector';
import UserProfileBadge from './UserProfileBadge';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '@/contexts/I18nContext';
import CoinStorePopup from './CoinStorePopup';
import InteractiveSearch from './InteractiveSearch';
import { useCoinWallet } from '@/hooks/useCoinWallet';
import { MangaEditModal } from '@/components/admin/MangaEditModal';
import { BookOpen, Home, User, Settings, Search, Menu, X, Star, Heart, Bookmark, TrendingUp, LogOut, Coins, Crown, Zap, Shield, Edit, HelpCircle, ShoppingCart, Mail } from 'lucide-react';
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
  }, {
    icon: ShoppingCart,
    label: t('header.shop', 'Shop'),
    path: '/shop',
    color: 'manga-green'
  }];
  return <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
      <div className="container mx-auto px-2 xs:px-4 sm:px-6">
        <div className="flex items-center justify-between h-12 xs:h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3 group">
            <div className="relative">
              <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-lg xs:rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-manga-gold to-manga-red p-0.5">
                <div className="w-full h-full rounded-lg xs:rounded-xl sm:rounded-2xl bg-background flex items-center justify-center">
                  <BookOpen className="h-3 w-3 xs:h-4 xs:w-4 sm:h-6 sm:w-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div className="absolute -top-0.5 -right-0.5 xs:-top-1 xs:-right-1 w-2 h-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4 rounded-full bg-manga-red animate-pulse"></div>
            </div>
            <div className="hidden xs:block">
              <h1 className="text-sm xs:text-lg sm:text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-manga-gold bg-clip-text text-transparent">
                Zax Million
              </h1>
              <p className="text-xs xs:text-xs sm:text-xs text-muted-foreground -mt-0.5 xs:-mt-1 hidden sm:block">Manga Reader</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            if (item.path === '/shop') {
              return <button key={item.path} onClick={() => setShowCoinStore(true)} className={`relative flex items-center space-x-2 px-4 py-3 rounded-2xl font-medium transition-all duration-200 group text-muted-foreground hover:text-foreground hover:bg-muted/50`}>
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </button>;
            }
            return <Link key={item.path} to={item.path} className={`relative flex items-center space-x-2 px-4 py-3 rounded-2xl font-medium transition-all duration-200 group ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                  <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
                  <span>{item.label}</span>
                  {isActive && <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-manga-gold/5 to-manga-red/5 animate-pulse"></div>}
                </Link>;
          })}
          </div>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-4">
            {/* Search Icon */}
            <Button variant="ghost" size="sm" onClick={() => setShowInteractiveSearch(true)} className="h-6 w-6 xs:h-8 xs:w-8 sm:h-9 sm:w-9 p-0 rounded-lg xs:rounded-xl hover:bg-muted/50">
              <Search className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
            </Button>
            {currentSeriesId && (
              <AuthorOnly hide>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickEdit(true)}
                  className="h-6 w-6 xs:h-8 xs:w-8 sm:h-9 sm:w-9 p-0 rounded-lg xs:rounded-xl hover:bg-muted/50"
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
                {user ? <div className="relative group">
                     {/* Profile Picture - Compact */}
                    <div className="flex items-center space-x-1 xs:space-x-2 cursor-pointer">
                      <div className="hidden xs:block">
                        <UserProfileBadge />
                      </div>
                      <div className="w-6 h-6 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary to-manga-gold flex items-center justify-center">
                        <User className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 text-white" />
                      </div>
                    </div>
                    
                    {/* Dropdown Menu on Hover */}
                    <div className="absolute right-0 top-full mt-2 w-60 xs:w-72 bg-background/95 backdrop-blur-xl border border-border/30 rounded-xl xs:rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="p-3 xs:p-4">
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
                        
                         {/* Quick Links */}
                         <div className="py-2 xs:py-3 space-y-1">
                           <Link to="/profile" className="flex items-center space-x-2 xs:space-x-3 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg xs:rounded-xl hover:bg-muted/50 transition-colors">
                             <User className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
                             <span className="text-xs xs:text-sm">Profile</span>
                           </Link>
                           <Link to="/settings" className="flex items-center space-x-2 xs:space-x-3 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg xs:rounded-xl hover:bg-muted/50 transition-colors">
                             <Settings className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
                             <span className="text-xs xs:text-sm">Settings</span>
                           </Link>
                           
                           {/* Theme Selector */}
                           
                           
                           {/* Language Switcher */}
                           
                           
                           <AdminOnly hide>
                             <Link to="/admin" className="flex items-center space-x-2 xs:space-x-3 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg xs:rounded-xl hover:bg-muted/50 transition-colors">
                               <Shield className="h-3 w-3 xs:h-4 xs:w-4 text-manga-red" />
                               <span className="text-xs xs:text-sm text-manga-red">Admin Panel</span>
                             </Link>
                           </AdminOnly>
                           <AuthorOnly hide>
                             <Link to="/author" className="flex items-center space-x-2 xs:space-x-3 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg xs:rounded-xl hover:bg-muted/50 transition-colors">
                               <Edit className="h-3 w-3 xs:h-4 xs:w-4 text-blue-500" />
                               <span className="text-xs xs:text-sm text-blue-600">Author Dashboard</span>
                             </Link>
                           </AuthorOnly>
                         </div>
                        
                        {/* Sign Out */}
                        <div className={`${isAdmin ? 'pt-2 xs:pt-3 border-t border-border/30' : 'pt-0'}`}>
                          <button onClick={signOut} className="flex items-center space-x-2 xs:space-x-3 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg xs:rounded-xl hover:bg-destructive/10 transition-colors w-full text-left">
                            <LogOut className="h-3 w-3 xs:h-4 xs:w-4 text-destructive" />
                            <span className="text-xs xs:text-sm text-destructive">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div> : <div className="flex items-center space-x-1 xs:space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))} className="rounded-lg xs:rounded-xl h-6 xs:h-8 sm:h-9 text-xs xs:text-sm px-2 xs:px-3">
                      Sign In
                    </Button>
                    
                  </div>}
              </>}

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 p-0 rounded-lg xs:rounded-xl sm:rounded-2xl">
              {isMenuOpen ? <X className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" /> : <Menu className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-xl">
            <div className="container mx-auto px-2 xs:px-4 sm:px-6 py-3 xs:py-4 sm:py-6">
              <div className="space-y-3 xs:space-y-4">
                {/* Mobile Search removed - use main search bar on home page */}

                {/* Mobile Navigation */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3">
                {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                if (item.path === '/shop') {
                  return <button key={item.path} onClick={() => {
                    setShowCoinStore(true);
                    setIsMenuOpen(false);
                  }} className="flex items-center space-x-2 xs:space-x-3 p-2 xs:p-3 sm:p-4 rounded-xl xs:rounded-2xl border transition-all duration-200 bg-card/30 border-border/30 text-muted-foreground hover:text-foreground hover:bg-card/50 w-full">
                      <Icon className="h-4 w-4 xs:h-5 xs:w-5" />
                      <span className="font-medium text-sm xs:text-base">{item.label}</span>
                    </button>;
                }
                return <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className={`flex items-center space-x-2 xs:space-x-3 p-2 xs:p-3 sm:p-4 rounded-xl xs:rounded-2xl border transition-all duration-200 ${isActive ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-card/30 border-border/30 text-muted-foreground hover:text-foreground hover:bg-card/50'}`}>
                        <Icon className="h-4 w-4 xs:h-5 xs:w-5" />
                        <span className="font-medium text-sm xs:text-base">{item.label}</span>
                      </Link>;
              })}
                </div>

                {/* Mobile User Actions */}
                {user ? <div className="pt-3 xs:pt-4 border-t border-border/30 space-y-2">
                    <AdminOnly hide>
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full bg-background/50 border-border/50 hover:bg-background/70 rounded-xl text-sm xs:text-base h-8 xs:h-10">
                          <Settings className="h-3 w-3 xs:h-4 xs:w-4 mr-2" />
                          Admin Panel
                        </Button>
                      </Link>
                    </AdminOnly>
                    <AuthorOnly hide>
                      <Link to="/author" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full bg-background/50 border-border/50 hover:bg-background/70 rounded-xl text-sm xs:text-base h-8 xs:h-10">
                          <Edit className="h-3 w-3 xs:h-4 xs:w-4 mr-2" />
                          Author Dashboard
                        </Button>
                      </Link>
                    </AuthorOnly>
                    <Button variant="outline" onClick={() => {
                signOut();
                setIsMenuOpen(false);
              }} className="w-full bg-background/50 border-border/50 hover:bg-background/70 rounded-xl text-sm xs:text-base h-8 xs:h-10">
                      <LogOut className="h-3 w-3 xs:h-4 xs:w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div> : <div className="pt-3 xs:pt-4 border-t border-border/30">
                    <Button onClick={() => {
                window.dispatchEvent(new CustomEvent('open-auth-modal'));
                setIsMenuOpen(false);
              }} className="w-full bg-gradient-to-r from-primary to-manga-gold hover:from-primary/90 hover:to-manga-gold/90 rounded-xl text-sm xs:text-base h-8 xs:h-10">
                      <User className="h-3 w-3 xs:h-4 xs:w-4 mr-2" />
                      Sign In / Get Started
                    </Button>
                  </div>}
              </div>
            </div>
          </div>}
      </div>
      
      {/* Coin Store Popup */}
      <CoinStorePopup isOpen={showCoinStore} onClose={() => setShowCoinStore(false)} />
      
      {/* Interactive Search */}
      <InteractiveSearch isOpen={showInteractiveSearch} onClose={() => setShowInteractiveSearch(false)} />
      {currentSeriesId && (
        <MangaEditModal
          open={showQuickEdit}
          onOpenChange={setShowQuickEdit}
          seriesId={currentSeriesId}
        />
      )}
    </nav>;
};
export default CreativeNavBar;