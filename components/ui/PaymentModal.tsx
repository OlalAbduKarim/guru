import React, { useState } from 'react';
import type { Course } from '../../types';
import { X, CreditCard, Calendar, Lock, RefreshCw } from 'lucide-react';

interface PaymentModalProps {
    course: Course;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ course, onClose, onPaymentSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            // Simulate a random failure for demonstration
            if (Math.random() < 0.1) { // 10% chance of failure
                setError('Payment failed. Please check your card details and try again.');
                setIsProcessing(false);
            } else {
                onPaymentSuccess();
            }
        }, 2000); // 2 second delay
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative transform transition-all duration-300 scale-95 animate-modal-pop-in"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-text-charcoal text-center">Complete Your Purchase</h2>
                
                <div className="my-6 p-4 bg-primary/5 rounded-lg">
                    <p className="text-gray-600">You are purchasing:</p>
                    <p className="font-bold text-lg text-primary">{course.title}</p>
                    <p className="text-2xl font-bold text-right mt-2">{`$${course.price?.toFixed(2)}`}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                     {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
                    
                    <div className="relative">
                        <label htmlFor="cardNumber" className="text-sm font-semibold text-gray-600">Card Number</label>
                        <CreditCard className="absolute left-3 top-10 text-gray-400" size={20} />
                        <input
                            type="text"
                            id="cardNumber"
                            placeholder="0000 0000 0000 0000"
                            required
                            className="w-full mt-1 bg-white rounded-lg py-3 pl-12 pr-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <label htmlFor="expiry" className="text-sm font-semibold text-gray-600">Expiry Date</label>
                            <Calendar className="absolute left-3 top-10 text-gray-400" size={20} />
                            <input
                                type="text"
                                id="expiry"
                                placeholder="MM / YY"
                                required
                                className="w-full mt-1 bg-white rounded-lg py-3 pl-12 pr-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition"
                            />
                        </div>
                        <div className="relative flex-1">
                            <label htmlFor="cvc" className="text-sm font-semibold text-gray-600">CVC</label>
                            <Lock className="absolute left-3 top-10 text-gray-400" size={20} />
                            <input
                                type="text"
                                id="cvc"
                                placeholder="123"
                                required
                                className="w-full mt-1 bg-white rounded-lg py-3 pl-12 pr-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-2 mt-6 bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-opacity-90 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? <RefreshCw size={20} className="animate-spin" /> : null}
                        {isProcessing ? 'Processing...' : `Pay $${course.price?.toFixed(2)}`}
                    </button>
                </form>

                 <p className="text-xs text-gray-400 text-center mt-4">
                    This is a simulated payment. No real transaction will occur.
                </p>
            </div>
             <style>{`
                @keyframes modal-pop-in {
                    from { opacity: 0; transform: scale(0.95) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-modal-pop-in { animation: modal-pop-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
}
