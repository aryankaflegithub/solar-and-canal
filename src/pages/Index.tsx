import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from './Dashboard';
import { PendingAccessModal } from '@/components/dashboard/PendingAccessModal';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading, isPending, isAdmin, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show pending modal for non-admin users with pending status
  if (isPending && !isAdmin) {
    return (
      <>
        <Dashboard />
        <PendingAccessModal onSignOut={signOut} />
      </>
    );
  }

  return <Dashboard />;
};

export default Index;
