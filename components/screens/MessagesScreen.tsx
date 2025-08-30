import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, getDoc, doc, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import type { AppUser } from '../../types';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { MessageSquare } from 'lucide-react';

interface Chat {
    id: string;
    participants: string[];
    lastMessage?: { text: string; timestamp: any; };
    otherUser?: AppUser;
}

/**
 * Formats a Firestore timestamp for clear and consistent display in a chat list.
 * This function provides relative time formatting for recent messages and
 * specific date formats for older ones, enhancing user readability.
 *
 * - **Today:** Displays the time (e.g., "5:30 PM").
 * - **Yesterday:** Displays the literal string "Yesterday".
 * - **This Year:** Displays the month and day (e.g., "Oct 25").
 * - **Previous Years:** Displays the full date (e.g., "10/25/2023").
 *
 * The 'en-US' locale is specified to ensure consistent output across all user devices.
 *
 * @param timestamp - The Firestore timestamp object (or any object with a `toDate()` method).
 * @returns A formatted string representing the timestamp.
 */
const formatTimestamp = (timestamp: any): string => {
    if (!timestamp?.toDate) {
        return '';
    }

    const messageDate = timestamp.toDate();
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    if (messageDate >= startOfToday) {
        return messageDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });
    }
    
    if (messageDate >= startOfYesterday) {
        return 'Yesterday';
    }

    if (messageDate.getFullYear() === now.getFullYear()) {
        return messageDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    }

    return messageDate.toLocaleDateString('en-US');
};


export const MessagesScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) return;

        setLoading(true);
        const q = query(
            collection(db, 'chats'), 
            where('participants', 'array-contains', currentUser.id),
            orderBy('lastMessage.timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const chatsData: Chat[] = await Promise.all(
                querySnapshot.docs.map(async (chatDoc) => {
                    const data = chatDoc.data();
                    const otherUserId = data.participants.find((p: string) => p !== currentUser.id);
                    let otherUser: AppUser | undefined = undefined;

                    if (otherUserId) {
                        const userDoc = await getDoc(doc(db, 'users', otherUserId));
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            otherUser = {
                                id: userDoc.id,
                                name: userData.fullName,
                                email: userData.email,
                                role: userData.role,
                                avatarUrl: userData.avatarUrl,
                                country: userData.country,
                                skillLevel: userData.skillLevel,
                            };
                        }
                    }

                    return {
                        id: chatDoc.id,
                        participants: data.participants,
                        lastMessage: data.lastMessage,
                        otherUser,
                    };
                })
            );
            setChats(chatsData.filter(c => c.otherUser)); // Only show chats where other user exists
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleChatClick = (otherUserId?: string) => {
        if (otherUserId) {
            navigate(`/chat/${otherUserId}`);
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading chats...</div>;
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-charcoal">Messages</h1>
            {chats.length > 0 ? (
                <Card className="p-0 bg-white">
                    <ul className="divide-y divide-gray-200">
                        {chats.map((chat) => (
                            <li 
                                key={chat.id} 
                                onClick={() => handleChatClick(chat.otherUser?.id)} 
                                className="p-4 flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <Avatar src={chat.otherUser?.avatarUrl || ''} alt={chat.otherUser?.name || 'User'} size="md" />
                                <div className="ml-4 flex-grow overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-text-charcoal truncate">{chat.otherUser?.name}</p>
                                        <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                            {formatTimestamp(chat.lastMessage?.timestamp)}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage?.text || 'No messages yet'}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            ) : (
                <div className="text-center py-16">
                    <Card className="p-8 inline-block">
                        <MessageSquare size={48} className="mx-auto text-primary" />
                        <h2 className="text-2xl font-bold mt-4">No Messages</h2>
                        <p className="text-gray-600 mt-2">Start a conversation with a coach or student.</p>
                    </Card>
                </div>
            )}
        </div>
    );
};