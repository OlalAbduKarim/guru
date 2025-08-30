import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import type { AppUser, Message } from '../../types';
import { Avatar } from '../ui/Avatar';
import { ArrowLeft, Send, RefreshCw } from 'lucide-react';

const getChatId = (uid1: string, uid2: string) => {
    return uid1 > uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

const formatDateSeparator = (dateKey: string) => {
    const messageDate = new Date(dateKey);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    if (messageDate.getTime() === today.getTime()) {
        return 'Today';
    }
    if (messageDate.getTime() === yesterday.getTime()) {
        return 'Yesterday';
    }
    return messageDate.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
};


export const ChatScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const { receiverId } = useParams<{ receiverId: string }>();
    const navigate = useNavigate();
    const [receiver, setReceiver] = useState<AppUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
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

    /**
     * Sets up a real-time listener for messages in the current chat.
     * This effect subscribes to the 'messages' subcollection in Firestore
     * using `onSnapshot`. Messages are ordered by their timestamp in ascending
     * order to ensure they are displayed chronologically.
     * The component's state is updated instantly whenever a new message
     * is added, removed, or modified in the backend.
     * The listener is automatically unsubscribed when the component unmounts
     * to prevent memory leaks.
     */
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

    /**
     * Handles sending a new message.
     * Uses a Firestore `writeBatch` to perform two operations atomically:
     * 1. Creates the new message document in the `messages` subcollection.
     * 2. Updates the `lastMessage` field on the parent chat document.
     * This ensures data consistency, preventing a state where a message is sent
     * but the chat list preview isn't updated, or vice-versa.
     * If the batch write fails, an alert is shown and the user's typed message is restored.
     */
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatId || !currentUser || !receiverId || isSending) return;
        
        const messageText = newMessage;
        setNewMessage('');
        setIsSending(true);

        try {
            const batch = writeBatch(db);

            const chatDocRef = doc(db, 'chats', chatId);
            const newMessageRef = doc(collection(chatDocRef, 'messages'));

            // Operation 1: Create the new message
            batch.set(newMessageRef, {
                text: messageText,
                senderId: currentUser.id,
                timestamp: serverTimestamp(),
            });
            
            // Operation 2: Update the parent chat document
            batch.set(chatDocRef, {
                participants: [currentUser.id, receiverId],
                lastMessage: {
                    text: messageText,
                    timestamp: serverTimestamp(),
                }
            }, { merge: true });

            await batch.commit();
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message. Please try again.");
            setNewMessage(messageText);
        } finally {
            setIsSending(false);
        }
    };

    const messageGroups = messages.reduce((groups, message) => {
        if (!message.timestamp?.toDate) {
            return groups;
        }
        const dateKey = message.timestamp.toDate().toDateString();
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(message);
        return groups;
    }, {} as { [key: string]: Message[] });

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
            <main className="flex-1 overflow-y-auto p-4">
                {Object.entries(messageGroups).map(([dateKey, messagesInGroup]) => (
                    <React.Fragment key={dateKey}>
                        <div className="text-center my-4">
                            <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">{formatDateSeparator(dateKey)}</span>
                        </div>
                        <div className="space-y-4">
                            {messagesInGroup.map((message) => {
                                const isSender = message.senderId === currentUser?.id;
                                return (
                                    <div key={message.id} className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
                                        {!isSender && <Avatar src={receiver.avatarUrl} alt={receiver.name} size="sm" />}
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
                        </div>
                    </React.Fragment>
                ))}
                <div ref={messagesEndRef} />
            </main>

            {/* Message Input */}
            <footer className="p-3 border-t bg-white sticky bottom-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={isSending ? "Sending..." : "Type a message..."}
                        className="flex-1 bg-gray-100 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-75"
                        disabled={isSending}
                    />
                    <button type="submit" className="bg-primary text-white p-3 rounded-full hover:bg-opacity-90 disabled:opacity-50 flex items-center justify-center w-12 h-12" disabled={!newMessage.trim() || isSending}>
                        {isSending ? <RefreshCw size={24} className="animate-spin" /> : <Send size={24} />}
                    </button>
                </form>
            </footer>
        </div>
    );
};