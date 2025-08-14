import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, onSnapshot, doc, updateDoc, getDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import type { LiveSession, AppUser } from '../../types';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Clapperboard, PlayCircle, StopCircle, Calendar, Video, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SessionCard: React.FC<{ session: LiveSession, onAction: (id: string, newStatus: 'Live' | 'Past') => void, isCoachOwner: boolean }> = ({ session, onAction, isCoachOwner }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleJoin = () => {
        if (!currentUser) {
            navigate('/login');
        } else {
            // In a real app, this would navigate to a specific session page e.g. /live/session.id
            console.log(`User ${currentUser.id} attempting to join session ${session.id}`);
        }
    };
    
    const getActionButtons = () => {
        if (isCoachOwner) {
            if (session.status === 'Upcoming') {
                return <button onClick={() => onAction(session.id, 'Live')} className="w-full bg-soft-emerald text-white font-bold py-3 px-4 rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors"><PlayCircle size={20} className="mr-2" /> Start Session</button>;
            }
            if (session.status === 'Live') {
                return <button onClick={() => onAction(session.id, 'Past')} className="w-full bg-accent text-white font-bold py-3 px-4 rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors"><StopCircle size={20} className="mr-2" /> End Session</button>;
            }
        } else {
             if (session.status === 'Live') {
                return <button onClick={handleJoin} className="w-full bg-soft-emerald text-white font-bold py-3 px-4 rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors"><PlayCircle size={20} className="mr-2" /> Join Live</button>;
            }
        }
        return null;
    }

    const getStatusBadge = () => {
        switch(session.status) {
            case 'Live': return <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">LIVE NOW</span>;
            case 'Upcoming': return <span className="bg-highlight-amber text-white text-xs font-bold px-3 py-1 rounded-full">UPCOMING</span>;
            case 'Past': return <span className="bg-gray-400 text-white text-xs font-bold px-3 py-1 rounded-full">PAST</span>;
        }
    }
    
    return (
        <Card className="bg-white p-6 flex flex-col justify-between">
            <div>
                {getStatusBadge()}
                <h3 className="text-xl font-bold mt-3 text-text-charcoal">{session.title}</h3>
                <p className="text-gray-500 mt-2 text-sm line-clamp-2 h-10">{session.description}</p>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} /> <span>{session.startTime?.toDate().toLocaleDateString()}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Clock size={16} /> <span>{session.startTime?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {session.coach && (
                        <Link to={`/profile/${session.coach.id}`} className="flex items-center gap-2 pt-2 group">
                           <Avatar src={session.coach.avatarUrl} alt={session.coach.name} size="sm" />
                           <span className="font-semibold text-primary group-hover:underline">{session.coach.name}</span>
                        </Link>
                    )}
                </div>
            </div>
            <div className="mt-6">
                {getActionButtons()}
            </div>
        </Card>
    )
}

const Section: React.FC<{ title: string, children: React.ReactNode, count: number }> = ({ title, children, count }) => {
    if (count === 0) return null;
    return (
        <section>
            <h2 className="text-2xl font-bold text-text-charcoal mb-4">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children}
            </div>
        </section>
    );
}

export const LiveScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'live_sessions'), orderBy('startTime', 'desc'));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const sessionsData = await Promise.all(snapshot.docs.map(async (d) => {
                const data = d.data();
                let coachData: AppUser | null = null;
                if(data.coachId) {
                    const coachDoc = await getDoc(doc(db, 'users', data.coachId));
                    if(coachDoc.exists()) {
                        coachData = { id: coachDoc.id, ...coachDoc.data() } as AppUser;
                    }
                }
                return {
                    id: d.id,
                    ...data,
                    coach: coachData ? { id: coachData.id, name: coachData.name, avatarUrl: coachData.avatarUrl, rating: 4.8, bio: coachData.bio || '', country: coachData.country } : null,
                } as LiveSession;
            }));
            setSessions(sessionsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    const handleSessionAction = async (id: string, newStatus: 'Live' | 'Past') => {
        if (!currentUser || currentUser.role !== 'Coach') return;
        const sessionRef = doc(db, "live_sessions", id);
        await updateDoc(sessionRef, {
            status: newStatus
        });
    };

    if (loading) {
        return <div className="text-center p-8">Loading live sessions...</div>;
    }

    const liveSessions = sessions.filter(s => s.status === 'Live');
    const upcomingSessions = sessions.filter(s => s.status === 'Upcoming');
    const pastSessions = sessions.filter(s => s.status === 'Past');

    return (
        <div className="space-y-10">
             <h1 className="text-3xl font-bold text-text-charcoal flex items-center gap-3"><Video size={32} /> Live Sessions</h1>

            {sessions.length === 0 ? (
                 <Card className="p-8 text-center">
                    <Clapperboard size={48} className="mx-auto text-primary" />
                    <h2 className="text-2xl font-bold mt-4">No Sessions Yet</h2>
                    <p className="text-gray-600 mt-2">
                        {currentUser?.role === 'Coach' ? 'Schedule your first live session to engage with students.' : 'No live sessions scheduled right now. Check back later!'}
                    </p>
                </Card>
            ) : (
                <>
                    <Section title="Live Now" count={liveSessions.length}>
                       {liveSessions.map(s => <SessionCard key={s.id} session={s} onAction={handleSessionAction} isCoachOwner={currentUser?.id === s.coachId} />)}
                    </Section>
                    <Section title="Upcoming" count={upcomingSessions.length}>
                       {upcomingSessions.map(s => <SessionCard key={s.id} session={s} onAction={handleSessionAction} isCoachOwner={currentUser?.id === s.coachId} />)}
                    </Section>
                    <Section title="Past Recordings" count={pastSessions.length}>
                       {pastSessions.map(s => <SessionCard key={s.id} session={s} onAction={handleSessionAction} isCoachOwner={currentUser?.id === s.coachId} />)}
                    </Section>
                </>
            )}
        </div>
    );
};