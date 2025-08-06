import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface CoachRouteProps {
    children: React.ReactNode;
}

export const CoachRoute: React.FC<CoachRouteProps> = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!currentUser || currentUser.role !== 'Coach') {
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
};
