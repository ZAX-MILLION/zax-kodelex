import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useDemoRole } from '@/contexts/DemoRoleContext';
import type { DemoRoleId } from '@/config/env';

const ALIASES: Record<string, DemoRoleId> = {
  member: 'member',
  'paid-member': 'paid',
  paid: 'paid',
  buyer: 'buyer',
  uploader: 'uploader',
  admin: 'admin',
  guest: 'guest',
};

/** Deep-link helpers: /demo/member → activate role + stay in Role Lab. */
const DemoRoleAlias = () => {
  const { roleAlias } = useParams<{ roleAlias: string }>();
  const { setActiveRole, enabled } = useDemoRole();
  const mapped = roleAlias ? ALIASES[roleAlias] : undefined;

  useEffect(() => {
    if (enabled && mapped) setActiveRole(mapped);
  }, [enabled, mapped, setActiveRole]);

  if (!enabled || !mapped) {
    return <Navigate to="/demo" replace />;
  }

  return <Navigate to="/demo" replace />;
};

export default DemoRoleAlias;
