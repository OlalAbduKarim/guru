import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { ArrowLeft } from 'lucide-react';

export const CreateLiveSessionScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sessionTime, setSessionTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !sessionTime || !currentUser) {
            setError('Please fill in all fields.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const startTime = Timestamp.fromDate(new Date(sessionTime));

            await addDoc(collection(db, 'live_sessions'), {
                title,
                description,
                startTime,
                coachId: currentUser.id,
                status: 'Upcoming',
                participants: [],
                createdAt: serverTimestamp(),
            });
            
            navigate('/live');

        } catch (err: any) {
            setError(err.message || 'Failed to schedule session. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary font-semibold mb-6 hover:underline">
                <ArrowLeft size={20} /> Back
            </button>
            <h1 className="text-3xl font-bold text-text-charcoal mb-6">Schedule a Live Session</h1>
            
            <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}
                    
                    <div>
                        <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">Session Title</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    
                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"></textarea>
                    </div>
                    
                    <div>
                        <label htmlFor="session-time" className="block text-sm font-bold text-gray-700 mb-2">Date and Time</label>
                        <input 
                            type="datetime-local" 
                            id="session-time" 
                            value={sessionTime} 
                            onChange={e => setSessionTime(e.target.value)} 
                            required 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" 
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-opacity-90 transition-transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Scheduling...' : 'Schedule Session'}
                    </button>
                </form>
            </Card>
        </div>
    );
};
