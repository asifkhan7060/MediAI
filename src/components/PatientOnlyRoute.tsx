import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Wraps patient-only pages (Home, Find Doctor, Symptom Checker, AI Assistant, Book Appointment).
 * If logged in as Admin or Doctor, redirects to their dashboard.
 * Patients and unauthenticated users can access normally.
 */
export default function PatientOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isDoctor, isAdmin, user } = useAuth();

  if (isAuthenticated && (isDoctor || isAdmin)) {
    const dashboardPath = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/doctor';
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
}
