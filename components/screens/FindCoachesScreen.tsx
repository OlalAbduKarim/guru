import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { AppUser } from '../../types';
import { CoachCard } from '../ui/CoachCard';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FindCoachesScreen: React.FC = () => {
    const [coaches, setCoaches] = useState<AppUser[]>([]);
    const [filteredCoaches, setFilteredCoaches] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCoaches = async () => {
            setLoading(true);
            const q = query(collection(db, 'users'), where('role', '==', 'Coach'));
            const querySnapshot = await getDocs(q);
            const coachesData: AppUser[] = querySnapshot.docs.map(doc => ({
                 id: doc.id,
                 ...doc.data(),
            } as AppUser));
            setCoaches(coachesData);
            setFilteredCoaches(coachesData);
            setLoading(false);
        };
        fetchCoaches();
    }, []);

    useEffect(() => {
        const results = coaches.filter(coach =>
            coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coach.bio?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCoaches(results);
    }, [searchTerm, coaches]);

    if (loading) {
        return <div className="text-center p-8">Loading coaches...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-charcoal">Find a Coach</h1>
            
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by name or specialty..." 
                  className="w-full bg-white rounded-full py-3 pl-12 pr-4 shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {filteredCoaches.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCoaches.map(coach => (
                         <div key={coach.id} onClick={() => navigate(`/profile/${coach.id}`)}>
                            <CoachCard 
                                coach={{
                                    id: coach.id,
                                    name: coach.name,
                                    avatarUrl: coach.avatarUrl,
                                    rating: 4.9, // Placeholder, you might want to calculate this
                                    bio: coach.bio || '',
                                    country: coach.country,
                                }} 
                            />
                         </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-10">No coaches found matching your criteria.</p>
            )}
        </div>
    );
};
