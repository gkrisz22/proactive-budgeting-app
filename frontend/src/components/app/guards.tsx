import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--c-bg)">
      <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
    </div>
  );
}

export function RequireAuth() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <FullScreenSpinner />;
  if (!user) return <Navigate to="/auth/login" replace />;
  return <Outlet />;
}

export function RequireOnboarding() {
  const { isOnboarded, isLoading } = useOnboardingStatus();
  if (isLoading) return <FullScreenSpinner />;
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

export function RedirectIfOnboarded() {
  const { isOnboarded, isLoading } = useOnboardingStatus();
  if (isLoading) return <FullScreenSpinner />;
  if (isOnboarded) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function RedirectIfAuthed() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <FullScreenSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
