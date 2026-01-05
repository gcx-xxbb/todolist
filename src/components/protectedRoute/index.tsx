import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import useAuth from '../../hooks/useAuth';

interface ProtectedRouteProps {
	permission?: string;
	children: ReactNode;
}

const ProtectedRoute = ({ permission, children }: ProtectedRouteProps) => {
	const { hasPermission } = useAuth();
	if (!permission || permission === 'all') return children;
	if (hasPermission(permission)) return children
	return <Navigate to="/login" />
};

export default ProtectedRoute; 