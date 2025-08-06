import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const GoogleSignInButton: React.FC = () => {
    const { googleSignIn } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await googleSignIn();
            navigate('/home');
        } catch (err: any) {
            setError(err.message || "Failed to sign in with Google.");
            setLoading(false);
        }
    };

    return (
        <>
            <button
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50"
            >
                <svg className="w-6 h-6" viewBox="0 0 48 48">
                    <path fill="#4285F4" d="M24 9.5c3.21 0 6.13.98 8.49 2.91l6.3-6.3C34.69 2.52 29.6 0 24 0 14.86 0 7.09 5.66 4.23 13.59l7.35 5.71C13.11 13.47 18.08 9.5 24 9.5z"></path>
                    <path fill="#34A853" d="M46.23 25.18c0-1.72-.15-3.37-.43-4.99H24v9.42h12.45c-.54 3.04-2.1 5.64-4.59 7.42l7.35 5.71C43.34 38.37 46.23 32.33 46.23 25.18z"></path>
                    <path fill="#FBBC05" d="M11.58 28.29c-.5-1.52-.78-3.13-.78-4.79s.28-3.27.78-4.79l-7.35-5.71C2.52 16.31 0 20.02 0 24.5s2.52 8.19 4.23 11.71l7.35-5.71z"></path>
                    <path fill="#EA4335" d="M24 48c5.6 0 10.69-1.85 14.23-4.99l-7.35-5.71c-1.93 1.3-4.38 2.08-7.15 2.08-5.92 0-10.89-3.97-12.42-9.29L4.23 35.41C7.09 43.34 14.86 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </>
    );
};
