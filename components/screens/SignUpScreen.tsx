import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../auth/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Crown, Users } from 'lucide-react';
import { GoogleSignInButton } from '../auth/GoogleSignInButton';


export const SignUpScreen: React.FC = () => {
    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);
    const [role, setRole] = useState<'Student' | 'Coach'>('Student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (passwordRef.current?.value !== confirmPasswordRef.current?.value) {
            return setError("Passwords do not match.");
        }
        if (!nameRef.current?.value || !emailRef.current?.value || !passwordRef.current?.value) {
            return setError("Please fill in all fields.");
        }

        try {
            setLoading(true);
            await signup(nameRef.current.value, emailRef.current.value, passwordRef.current.value, role);
            navigate('/home');
        } catch (err: any) {
            setError(err.message || 'Failed to create an account. Please try again.');
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
                <h1 className="mt-4 text-3xl font-bold text-text-charcoal">Create Your Account</h1>
                <p className="mt-2 text-gray-600">Join the academy and start learning!</p>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-center" role="alert">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" ref={nameRef} placeholder="Full Name" required className="w-full bg-white rounded-xl py-3 pl-12 pr-4 shadow-md focus:outline-none focus:ring-2 focus:ring-primary transition" />
                </div>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="email" ref={emailRef} placeholder="Email" required className="w-full bg-white rounded-xl py-3 pl-12 pr-4 shadow-md focus:outline-none focus:ring-2 focus:ring-primary transition" />
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="password" ref={passwordRef} placeholder="Password" required className="w-full bg-white rounded-xl py-3 pl-12 pr-4 shadow-md focus:outline-none focus:ring-2 focus:ring-primary transition" />
                </div>
                 <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="password" ref={confirmPasswordRef} placeholder="Confirm Password" required className="w-full bg-white rounded-xl py-3 pl-12 pr-4 shadow-md focus:outline-none focus:ring-2 focus:ring-primary transition" />
                </div>

                <div className="pt-2">
                    <label className="text-gray-600 font-semibold mb-2 flex items-center gap-2"><Users size={20} /> I am a:</label>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setRole('Student')} className={`w-full py-3 rounded-xl font-bold transition-colors ${role === 'Student' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-700'}`}>Student</button>
                        <button type="button" onClick={() => setRole('Coach')} className={`w-full py-3 rounded-xl font-bold transition-colors ${role === 'Coach' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-700'}`}>Coach</button>
                    </div>
                </div>

                <button disabled={loading} type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-opacity-90 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed !mt-6">
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>
             <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <GoogleSignInButton />
            <p className="mt-8 text-center text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-primary hover:underline">
                    Log in
                </Link>
            </p>
        </AuthLayout>
    );
};
