import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../auth/AuthLayout';
import { Crown } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <AuthLayout backgroundColor="bg-mint-cream">
            <div className="text-center">
                <Crown className="mx-auto text-dark-olive" size={60} />
                <h1 className="mt-6 text-4xl font-bold text-dark-olive">Welcome to ChessMaster Academy</h1>
                <p className="mt-3 text-lg text-dark-olive/80">The ultimate platform for chess enthusiasts.</p>
            </div>
            <div className="mt-12 space-y-4">
                <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-soft-emerald text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-opacity-90 transition-all duration-300 transform hover:-translate-y-1"
                >
                    Login
                </button>
                <button
                    onClick={() => navigate('/signup')}
                    className="w-full bg-white text-soft-emerald font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1"
                >
                    Create Account
                </button>
            </div>
        </AuthLayout>
    );
};
