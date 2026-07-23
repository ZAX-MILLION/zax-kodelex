import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';
import { useDemoRole } from '@/contexts/DemoRoleContext';
import { DemoAdminLayout } from '@/components/admin/demo/DemoAdminLayout';
import { DemoAdminOverview } from '@/components/admin/demo/DemoAdminOverview';
import { DemoAdminSeriesDesignPage } from '@/components/admin/demo/DemoAdminSeriesDesignPage';
import { DemoAdminAppearancePage } from '@/components/admin/demo/DemoAdminAppearancePage';
import { DemoAdminBackgroundsPage } from '@/components/admin/demo/DemoAdminBackgroundsPage';

/**
 * Lightweight admin simulation shell, mounted at `/demo/admin/*`.
 * Mirrors the real admin shell (persistent sidebar + header) but runs
 * entirely on session state via `DemoRoleContext` — it must never import the
 * production Admin page bundle, and never makes a Supabase request.
 */
const DemoAdminSim = () => {
  const { setActiveRole, activeRole } = useDemoRole();

  useEffect(() => {
    if (activeRole !== 'admin') {
      setActiveRole('admin');
    }
  }, [activeRole, setActiveRole]);

  return (
    <>
      <EnhancedSEOHelmet title="Admin dashboard (simulation)" noindex />
      <DemoAdminLayout>
        <Routes>
          <Route index element={<DemoAdminOverview />} />
          <Route path="series-design" element={<DemoAdminSeriesDesignPage />} />
          <Route path="appearance" element={<DemoAdminAppearancePage />} />
          <Route path="backgrounds" element={<DemoAdminBackgroundsPage />} />
          <Route path="*" element={<DemoAdminOverview />} />
        </Routes>
      </DemoAdminLayout>
    </>
  );
};

export default DemoAdminSim;
