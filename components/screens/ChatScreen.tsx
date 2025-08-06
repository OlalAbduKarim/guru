import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc, setDoc, where, getDocs, writeBatch } from 'firebase/firestore';
import type { AppUser, Message } from '../../types';
import { Avatar } from '../ui/Avatar';
import { ArrowLeft, Send } from 'lucide-react';

const getChatId = (uid1: string, uid2: string) => {
    return uid1 > uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

export const ChatScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const { receiverId } = useParams<{ receiverId: string }>();
    const navigate = useNavigate();
    const [receiver, setReceiver] = useState<AppUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chatId = currentUser && receiverId ? getChatId(currentUser.id, receiverId) : null;

    useEffect(() => {
        if (!receiverId) return;
        const fetchReceiver = async () => {
            setLoading(true);
            const userDoc = await getDoc(doc(db, 'users', receiverId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setReceiver({
                    id: userDoc.id,
                    name: userData.fullName,
                    avatarUrl: userData.avatarUrl,
                    country: userData.country,
                    skillLevel: userData.skillLevel,
                    role: userData.role,
                });
            } else {
                // Handle user not found
                navigate('/messages');
            }
            setLoading(false);
        };
        fetchReceiver();
    }, [receiverId, navigate]);

    useEffect(() => {
        if (!chatId) return;

        const messagesCol = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesCol, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages: Message[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data() as Omit<Message, 'id'>
            }));
            setMessages(fetchedMessages);
        });

        return () => unsubscribe();
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatId || !currentUser || !receiverId) return;
        
        const messageText = newMessage;
        setNewMessage('');

        const chatDocRef = doc(db, 'chats', chatId);
        const messagesColRef = collection(chatDocRef, 'messages');

        await addDoc(messagesColRef, {
            text: messageText,
            senderId: currentUser.id,
            timestamp: serverTimestamp(),
        });
        
        // Update or create the chat document with last message info
        await setDoc(chatDocRef, {
            participants: [currentUser.id, receiverId],
            lastMessage: {
                text: messageText,
                timestamp: serverTimestamp(),
            }
        }, { merge: true });
    };

    if (loading || !receiver) {
        return <div className="flex h-full items-center justify-center">Loading chat...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-background-misty">
            {/* Chat Header */}
            <header className="flex items-center p-3 border-b bg-white sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} className="text-gray-700" />
                </button>
                <Link to={`/profile/${receiver.id}`} className="flex items-center ml-2">
                    <Avatar src={receiver.avatarUrl} alt={receiver.name} size="md" />
                    <div className="ml-3">
                        <h2 className="font-bold text-lg text-text-charcoal">{receiver.name}</h2>
                        <p className="text-sm text-gray-500">{receiver.role}</p>
                    </div>
                </Link>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                    const isSender = message.senderId === currentUser?.id;
                    return (
                        <div key={message.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                                isSender 
                                ? 'bg-primary text-white rounded-br-none' 
                                : 'bg-white text-text-charcoal shadow-sm rounded-bl-none'
                            }`}>
                                <p>{message.text}</p>
                                <p className={`text-xs mt-1 ${isSender ? 'text-white/70' : 'text-gray-400'} text-right`}>
                                   {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </main>

            {/* Message Input */}
            <footer className="p-3 border-t bg-white sticky bottom-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button type="submit" className="bg-primary text-white p-3 rounded-full hover:bg-opacity-90 disabled:opacity-50" disabled={!newMessage.trim()}>
                        <Send size={24} />
                    </button>
                </form>
            </footer>
        </div>
    );
};
