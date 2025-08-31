import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Game, TimeControl } from '../../types';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Users, PlusCircle, Clock } from 'lucide-react';
import { Chess } from 'chess.js';

const TIME_CONTROLS: ({ label: string } & TimeControl)[] = [
    { label: '5 + 3', initial: 300, increment: 3 },
    { label: '10 + 0', initial: 600, increment: 0 },
    { label: '15 + 10', initial: 900, increment: 10 },
];

const CreateGameModal: React.FC<{ onClose: () => void; onCreate: (timeControl: TimeControl) => void }> = ({ onClose, onCreate }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-center mb-4">Choose Time Control</h2>
                <div className="space-y-3">
                    {TIME_CONTROLS.map(tc => (
                        <button
                            key={tc.label}
                            onClick={() => onCreate({ initial: tc.initial, increment: tc.increment })}
                            className="w-full text-lg font-semibold bg-primary/10 text-primary py-3 rounded-lg hover:bg-primary/20 transition"
                        >
                            {tc.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const PlayOnlineLobbyScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [openGames, setOpenGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'games'), where('status', '==', 'waiting'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const games: Game[] = [];
            snapshot.forEach(doc => {
                games.push({ id: doc.id, ...doc.data() } as Game);
            });
            setOpenGames(games);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCreateGame = async (timeControl: TimeControl) => {
        setIsModalOpen(false);
        if (!currentUser) return;
        
        const newGame = new Chess();

        const gameDoc = {
            pgn: newGame.pgn(),
            fen: newGame.fen(),
            status: 'waiting',
            whitePlayer: {
                id: currentUser.id,
                name: currentUser.name,
                avatarUrl: currentUser.avatarUrl
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            timeControl,
            whiteTime: timeControl.initial,
            blackTime: timeControl.initial,
        };

        const docRef = await addDoc(collection(db, 'games'), gameDoc);
        navigate(`/game/${docRef.id}`);
    };
    
    if (loading) {
        return <p>Loading open games...</p>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            {isModalOpen && <CreateGameModal onClose={() => setIsModalOpen(false)} onCreate={handleCreateGame} />}
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold text-text-charcoal flex items-center gap-3">
                    <Users /> Online Lobby
                </h1>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-soft-emerald text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-opacity-90 transition">
                    <PlusCircle size={20} /> Create Game
                </button>
            </div>
            
            <Card className="p-4">
                {openGames.length > 0 ? (
                    <div className="space-y-3">
                        {openGames.map(game => (
                            <div key={game.id} onClick={() => navigate(`/game/${game.id}`)} className="flex items-center justify-between p-4 bg-background-misty rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Avatar src={game.whitePlayer.avatarUrl} alt={game.whitePlayer.name} />
                                    <div>
                                        <p className="font-bold text-lg">{game.whitePlayer.name}'s Game</p>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            <Clock size={14}/> 
                                            {game.timeControl ? `${game.timeControl.initial / 60} | ${game.timeControl.increment}` : 'Untimed'}
                                        </p>
                                    </div>
                                </div>
                                <button className="font-semibold text-primary hover:underline">Join</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-600">No open games right now.</p>
                        <p className="text-gray-500">Why not create one?</p>
                    </div>
                )}
            </Card>
        </div>
    );
};