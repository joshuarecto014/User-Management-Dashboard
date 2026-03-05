import { Navigate, Outlet } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profile_picture?: string | null;
}

interface ProtectedRouteProps {
  allowedRoles: ('user' | 'admin')[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}') as User | null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;