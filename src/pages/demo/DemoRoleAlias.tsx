import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useDemoRole } from '@/contexts/DemoRoleContext';
import {
  getDemoRoleDestination,
  resolveDemoRoleAlias,
} from '@/features/demo/demoAuthPolicy';

/**
 * Deep-link helpers: /demo/:roleAlias → activate role + open that simulation.
 * Prefer explicit routes (/demo/member, /demo/admin, …) when available.
 */
const DemoRoleAlias = () => {
  const { roleAlias } = useParams<{ roleAlias: string }>();
  const { setActiveRole, enabled } = useDemoRole();
  const mapped = resolveDemoRoleAlias(roleAlias);

  useEffect(() => {
    if (enabled && mapped) setActiveRole(mapped);
  }, [enabled, mapped, setActiveRole]);

  if (!enabled || !mapped) {
    return <Navigate to="/demo" replace />;
  }

  return <Navigate to={getDemoRoleDestination(mapped)} replace />;
};

export default DemoRoleAlias;
