import { Link } from 'react-router-dom';
import { ArrowLeft, FlaskConical, Home, RotateCcw, Shield } from 'lucide-react';
import { useDemoRole } from '@/contexts/DemoRoleContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DemoAdminSidebar } from './DemoAdminSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DemoAdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Shell for the demo admin simulation — visually mirrors `AdminLayout`
 * (persistent sidebar + header) but runs entirely on `DemoRoleContext`
 * (session state only). No Supabase calls, no real auth, no shared code
 * with the production Admin bundle.
 */
export const DemoAdminLayout = ({ children }: DemoAdminLayoutProps) => {
  const { resetDemo } = useDemoRole();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <DemoAdminSidebar />

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
            <div className="flex h-full items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9 hover:bg-accent" aria-label="Toggle admin navigation" />
                <div className="flex items-center gap-3">
                  <Link
                    to="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-primary"
                    aria-label="View site (opens in a new tab)"
                  >
                    <Home className="h-5 w-5" />
                    <span className="hidden text-sm font-medium lg:inline">View site</span>
                  </Link>
                  <div>
                    <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
                    <p className="hidden text-xs text-muted-foreground sm:block">Zax Million management console</p>
                  </div>
                </div>
                <Badge variant="outline" className="hidden gap-1 border-amber-500/40 text-amber-500 sm:flex">
                  <FlaskConical className="h-3 w-3" aria-hidden />
                  Demo simulation
                </Badge>
              </div>

              <div className="flex items-center gap-2 lg:gap-3">
                <Button variant="outline" size="sm" asChild className="hidden gap-2 sm:flex">
                  <Link to="/demo">
                    <ArrowLeft className="h-4 w-4" />
                    Switch role
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" onClick={resetDemo}>
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Reset demo</span>
                </Button>

                <div className="flex items-center gap-2 border-l border-border pl-2 lg:pl-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-orange-500">
                    <Shield className="h-4 w-4 text-white" aria-hidden />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-foreground">Admin Preview</p>
                    <p className="text-xs text-muted-foreground">Simulated session</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="space-y-6 p-4 lg:p-6">
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-muted-foreground">
                <Shield className="mr-1.5 inline-block h-4 w-4 -translate-y-0.5 text-amber-500" aria-hidden />
                Lightweight simulation — nothing here can change real settings, users, or payments.
                The production Admin bundle is never loaded. Changes stay in this browser tab only.
              </p>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
