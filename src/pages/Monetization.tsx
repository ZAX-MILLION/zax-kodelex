import MonetizationDashboard from '@/components/MonetizationDashboard';
import { AuthenticatedRoute } from '@/components/auth/SecureRoute';

const Monetization = () => {
  return (
    <AuthenticatedRoute>
      <div className="container mx-auto px-4 py-8">
        <MonetizationDashboard />
      </div>
    </AuthenticatedRoute>
  );
};

export default Monetization;