import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function PrivateRoute() {
  const { isLoggedIn } = useAuthStore();
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}