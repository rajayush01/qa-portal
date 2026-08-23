import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ allow }: { allow: UserRole[] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-950">
        <Loader2 className="animate-spin text-accent-400" size={28} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!allow.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <Outlet />;
};
