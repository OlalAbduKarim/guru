import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        // You might want to show a global spinner here
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!currentUser) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them along to that page after they
        // log in, which is a nicer user experience.
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
