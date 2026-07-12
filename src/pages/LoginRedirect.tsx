import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { openAuthModal } from '@/utils/authRedirect';
import { LoadingState } from '@/components/LoadingSpinner';

const LoginRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    openAuthModal();
    navigate('/', { replace: true });
  }, [navigate]);

  return <LoadingState message="Opening sign in..." />;
};

export default LoginRedirect;
