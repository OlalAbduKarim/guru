import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../auth/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Crown } from 'lucide-react';
import { GoogleSignInButton } from '../auth/GoogleSignInButton';

export const LoginScreen: React.FC = () => {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!emailRef.current?.value || !passwordRef.current?.value) {
            return setError("Please fill in all fields.");
        }

        try {
            setLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
            navigate('/home');
        } catch (err: any) {
            setError(err.message || 'Failed to log in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout backgroundColor="bg-light-mint-green">
             <div className="text-center mb-8">
                 <Link to="/welcome">
                    <Crown className="mx-auto text-primary" size={48} />
                 </Link>
                <h1 className="mt-4 text-3xl font-bold text-text-charcoal">Welcome Back!</h1>
                <p className="mt-2 text-gray-600">Log in to continue your journey.</p>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-center" role="alert">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="email"
                        ref={emailRef}
                        placeholder="Email"
                        required
                        className="w-full bg-white rounded-xl py-3 pl-12 pr-4 shadow-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        ref={passwordRef}
                        placeholder="Password"
                        required
                        className="w-full bg-white rounded-xl py-3 pl-12 pr-12 shadow-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <div className="text-right">
                    <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                        Forgot Password?
                    </Link>
                </div>
                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-opacity-90 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
             <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <GoogleSignInButton />
             <p className="mt-8 text-center text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold text-primary hover:underline">
                    Sign up
                </Link>
            </p>
        </AuthLayout>
    );
};
