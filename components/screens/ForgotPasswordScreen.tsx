import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../auth/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowLeft } from 'lucide-react';

export const ForgotPasswordScreen: React.FC = () => {
    const emailRef = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!emailRef.current?.value) {
            return setError("Please enter your email address.");
        }

        try {
            setLoading(true);
            await resetPassword(emailRef.current.value);
            setMessage("Password reset email sent! Please check your inbox.");
        } catch (err: any) {
            setError(err.message || 'Failed to send password reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout backgroundColor="bg-light-mint-green">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-text-charcoal">Reset Password</h1>
                <p className="mt-2 text-gray-600">Enter your email to receive a reset link.</p>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-center" role="alert">{error}</div>}
            {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4 text-center" role="alert">{message}</div>}

            {!message && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="email"
                            ref={emailRef}
                            placeholder="Email Address"
                            required
                            className="w-full bg-white rounded-xl py-3 pl-12 pr-4 shadow-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                        />
                    </div>
                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-opacity-90 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            )}

            <div className="mt-8 text-center">
                <Link to="/login" className="font-medium text-primary hover:underline flex items-center justify-center gap-2">
                    <ArrowLeft size={16} /> Back to Login
                </Link>
            </div>
        </AuthLayout>
    );
};
