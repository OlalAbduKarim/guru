import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    backgroundColor?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, backgroundColor = 'bg-mint-cream' }) => {
    return (
        <div className={`flex flex-col items-center justify-center min-h-screen w-full ${backgroundColor} p-4`}>
            <div className="w-full max-w-md mx-auto">
                {children}
            </div>
        </div>
    );
};
