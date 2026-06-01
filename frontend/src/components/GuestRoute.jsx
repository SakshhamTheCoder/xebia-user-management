import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui';

// Keeps already-authenticated users out of the login / register pages.
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (user) {
    return (
      <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
    );
  }
  return children;
}
