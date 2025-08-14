import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Star, MessageCircle, UserPlus, ArrowRight, PlusCircle, Settings, LogOut, UserMinus, Edit, Clapperboard } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MOCK_ALL_USERS, MOCK_COACHES } from '../../constants';
import type { AppUser } from '../../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const ProfileHeader: React.FC<{ user: AppUser, isCurrentUser: boolean }> = ({ user, isCurrentUser }) => {
    const navigate = useNavigate();
    const { currentUser, toggleFollow } = useAuth();
    const roleBadgeColor = user.role === 'Coach' ? 'bg-primary text-white' : 'bg-highlight-slate text-white';

    const isFollowing = currentUser?.following?.includes(user.id);
    
    const handleFollowToggle = () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        toggleFollow(user.id);
    };

    const handleMessageClick = () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        navigate(`/chat/${user.id}`);
    }

    return (
        <Card className="bg-white p-6 w-full max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row items-center text-center md:text-left">
                <Avatar src={user.avatarUrl} alt={user.name} size="xl" className="border-4 border-primary" />
                <div className="md:ml-6 mt-4 md:mt-0">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                        <h1 className="text-3xl font-bold text-text-charcoal">{user.name}</h1>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${roleBadgeColor}`}>{user.role}</span>
                    </div>
                    <p className="mt-2 text-gray-600 max-w-md">{user.bio || 'Eager to learn and master the art of chess.'}</p>
                    <div className="mt-4 flex justify-center md:justify-start space-x-6">
                        <div className="text-center">
                            <p className="text-xl font-bold">{user.followers?.length || 0}</p>
                            <p className="text-sm text-gray-500">Followers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold">{user.following?.length || 0}</p>
                            <p className="text-sm text-gray-500">Following</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                 {isCurrentUser ? (
                     <button className="flex-1 flex items-center justify-center gap-2 bg-highlight-slate text-white font-semibold py-3 px-4 rounded-xl hover:bg-opacity-80 transition-colors">
                        <Edit size={20} /> Edit Profile
                    </button>
                 ) : (
                    <>
                        <button 
                            onClick={handleMessageClick}
                            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 px-4 rounded-xl hover:bg-opacity-90 transition-colors"
                        >
                            <MessageCircle size={20} /> Message
                        </button>
                        <button 
                            onClick={handleFollowToggle}
                            className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-xl transition-colors ${isFollowing ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-soft-emerald text-white hover:bg-opacity-90'}`}
                        >
                            {isFollowing ? <UserMinus size={20}/> : <UserPlus size={20} />}
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                    </>
                 )}
            </div>
        </Card>
    );
};


const CoachProfileView: React.FC<{ user: AppUser }> = ({ user }) => {
    const navigate = useNavigate();
    // In a real app, you would fetch followers from Firestore.
    const followers = MOCK_ALL_USERS.filter(u => user.followers?.includes(u.id));

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <h2 className="text-2xl font-bold text-text-charcoal mb-4">My Dashboard</h2>
            <Card className="p-4 bg-white mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={() => navigate('/create-course')}
                        className="flex-1 flex items-center justify-center gap-2 bg-soft-emerald text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-opacity-90 transition"
                    >
                        <PlusCircle size={18} /> Add Course
                    </button>
                    <button 
                        onClick={() => navigate('/create-live-session')}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-opacity-90 transition"
                    >
                        <Clapperboard size={18} /> Schedule Live Session
                    </button>
                </div>
            </Card>

            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-text-charcoal">My Students</h2>
            </div>
            <Card className="bg-white p-4">
                {followers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {followers.map(follower => (
                           <Link to={`/profile/${follower.id}`} key={follower.id} className="block hover:bg-gray-50 rounded-lg">
                             <div className="flex items-center bg-background-misty p-3 rounded-lg">
                                <Avatar src={follower.avatarUrl} alt={follower.name} size="md" />
                                <div className="ml-4 flex-grow">
                                    <p className="font-bold">{follower.name}</p>
                                    <p className="text-sm text-gray-500">{follower.skillLevel}</p>
                                </div>
                                <button onClick={(e) => { e.preventDefault(); navigate(`/chat/${follower.id}`)}} className="bg-primary/10 text-primary p-2 rounded-full hover:bg-primary/20">
                                    <MessageCircle size={20} />
                                </button>
                            </div>
                           </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">No students following yet.</p>
                )}
            </Card>
        </div>
    );
};

const StudentProfileView: React.FC<{ user: AppUser }> = ({ user }) => {
    const navigate = useNavigate();
    // In a real app, you would fetch followed coaches from Firestore.
    const followedCoaches = MOCK_COACHES.filter(c => user.following?.includes(c.id));

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-text-charcoal">My Coaches</h2>
                 <button 
                    onClick={() => navigate('/find-coaches')}
                    className="flex items-center gap-2 text-primary font-semibold py-2 px-4 rounded-lg hover:bg-primary/10 transition"
                 >
                     Find More Coaches <ArrowRight size={18} />
                 </button>
            </div>
            <Card className="bg-white p-4">
                {followedCoaches.length > 0 ? (
                    <div className="space-y-4">
                        {followedCoaches.map(coach => (
                             <Link to={`/profile/${coach.id}`} key={coach.id} className="block hover:bg-gray-50 rounded-lg">
                                 <div className="flex items-center bg-background-misty p-3 rounded-lg">
                                    <Avatar src={coach.avatarUrl} alt={coach.name} size="md" />
                                    <div className="ml-4 flex-grow">
                                        <p className="font-bold">{coach.name}</p>
                                        <div className="flex items-center text-highlight-amber">
                                            <Star size={16} className="fill-current" />
                                            <span className="ml-1 font-semibold text-sm">{coach.rating}</span>
                                        </div>
                                    </div>
                                    <button onClick={(e) => { e.preventDefault(); navigate(`/chat/${coach.id}`)}} className="bg-primary/10 text-primary p-2 rounded-full hover:bg-primary/20">
                                        <MessageCircle size={20} />
                                    </button>
                                </div>
                             </Link>
                        ))}
                    </div>
                ) : (
                     <p className="text-center text-gray-500 py-4">You are not following any coaches yet.</p>
                )}
            </Card>
        </div>
    );
};

export const ProfileScreen: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [profileUser, setProfileUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async (id: string) => {
            setLoading(true);
            const userDocRef = doc(db, 'users', id);
            const userDoc = await getDoc(userDocRef);
            if(userDoc.exists()) {
                const userData = userDoc.data();
                setProfileUser({
                    id: userDoc.id,
                    name: userData.fullName,
                    email: userData.email,
                    role: userData.role,
                    avatarUrl: userData.avatarUrl,
                    country: userData.country,
                    skillLevel: userData.skillLevel,
                    bio: userData.bio,
                    followers: userData.followers,
                    following: userData.following,
                });
            } else {
                console.error("User not found");
                navigate('/home'); // Or a 404 page
            }
            setLoading(false);
        };
        
        if (userId) {
            fetchUser(userId);
        } else if (currentUser) {
            // This case handles /profile route, which is protected and redirects
            // It might be better handled by the redirect logic directly setting the profile user
            fetchUser(currentUser.id);
        } else {
            // A guest is trying to view a profile, which is fine, but they shouldn't hit /profile directly
            // This is handled by router protection now.
        }

    }, [userId, currentUser, navigate]);

    const handleLogout = async () => {
      try {
        await logout();
        navigate('/welcome');
      } catch (error) {
        console.error("Failed to log out", error);
      }
    }
    
    if (loading || !profileUser) {
        return <div className="flex items-center justify-center h-full">Loading profile...</div>;
    }

    const isCurrentUser = currentUser?.id === profileUser.id;

    return (
        <div className="p-0 md:p-4 bg-light-mint-green min-h-full -m-4 sm:-m-6 lg:-m-8">
            <div className="p-4 sm:p-6 lg:p-8">
                <ProfileHeader user={profileUser} isCurrentUser={isCurrentUser} />

                {isCurrentUser && profileUser.role === 'Coach' ? (
                    <CoachProfileView user={profileUser} />
                ) : (isCurrentUser && profileUser.role === 'Student') ? (
                    <StudentProfileView user={profileUser} />
                ) : null}


                {isCurrentUser && (
                    <div className="w-full max-w-2xl mx-auto mt-8">
                         <h2 className="text-2xl font-bold text-text-charcoal mb-4">Account</h2>
                         <Card className="bg-white">
                            <ul className="divide-y divide-gray-200">
                                <li className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                                    <span>Account Settings</span>
                                    <Settings size={20} className="text-gray-500" />
                                </li>
                                 <li onClick={handleLogout} className="p-4 flex justify-between items-center cursor-pointer hover:bg-red-50 text-accent">
                                    <span>Log Out</span>
                                    <LogOut size={20} />
                                </li>
                            </ul>
                         </Card>
                    </div>
                )}
            </div>
        </div>
    );
};