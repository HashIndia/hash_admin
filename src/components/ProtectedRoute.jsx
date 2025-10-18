import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}