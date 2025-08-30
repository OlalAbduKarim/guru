import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { MessageCircle, UserPlus, PlusCircle, Settings, LogOut, UserMinus, Edit, Clapperboard } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { AppUser, Course } from '../../types';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { CourseCard } from '../ui/CourseCard';

const ProfileHeader: React.FC<{ user: AppUser, isCurrentUser: boolean }> = ({ user, isCurrentUser }) => {
    const navigate = useNavigate();
    const { currentUser, toggleFollow } = useAuth();
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
    const roleBadgeColor = user.role === 'Coach' ? 'bg-primary text-white' : 'bg-highlight-slate text-white';

    const isFollowing = currentUser?.following?.includes(user.id);
    
    const handleFollowToggle = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setIsUpdatingFollow(true);
        try {
            await toggleFollow(user.id);
        } catch (error) {
            console.error("Failed to toggle follow", error);
        } finally {
            setIsUpdatingFollow(false);
        }
    };

    const handleMessageClick = () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        navigate(`/chat/${user.id}`);
    }

    return (
        <Card className="bg-white p-6 w-full max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center text-center md:text-left">
                <Avatar src={user.avatarUrl} alt={user.name} size="xl" className="border-4 border-primary" />
                <div className="md:ml-6 mt-4 md:mt-0 flex-grow">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                        <h1 className="text-3xl font-bold text-text-charcoal">{user.name}</h1>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${roleBadgeColor}`}>{user.role}</span>
                    </div>
                    <p className="mt-2 text-gray-600 max-w-md mx-auto md:mx-0">{user.bio || 'Eager to learn and master the art of chess.'}</p>
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
                 <div className="mt-6 md:mt-0 flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
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
                            disabled={isUpdatingFollow}
                            className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 ${isFollowing ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-soft-emerald text-white hover:bg-opacity-90'}`}
                        >
                            {isFollowing ? <UserMinus size={20}/> : <UserPlus size={20} />}
                            {isUpdatingFollow ? 'Updating...' : (isFollowing ? 'Unfollow' : 'Follow')}
                        </button>
                    </>
                 )}
                </div>
            </div>
        </Card>
    );
};

const UserList: React.FC<{ title: string, userIds: string[] }> = ({ title, userIds }) => {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userIds || userIds.length === 0) {
            setUsers([]);
            setLoading(false);
            return;
        }
        
        const fetchUsers = async () => {
            setLoading(true);
            try {
                // To keep the UI clean and performant, we only fetch the first 5 users.
                // Firestore 'in' queries can handle up to 30 items.
                const usersToFetch = userIds.slice(0, 5);
                if (usersToFetch.length === 0) {
                    setUsers([]);
                    setLoading(false);
                    return;
                }
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('__name__', 'in', usersToFetch));
                const querySnapshot = await getDocs(q);
                const usersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().fullName,
                    ...doc.data()
                } as AppUser));
                // We need to re-order based on the original userIds array, as Firestore doesn't guarantee order for 'in' queries
                const userMap = new Map(usersData.map(u => [u.id, u]));
                const sortedUsers = usersToFetch.map(id => userMap.get(id)).filter((u): u is AppUser => !!u);
                setUsers(sortedUsers);
            } catch (error) {
                console.error(`Error fetching ${title}:`, error);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [userIds, title]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-text-charcoal mb-4">{title}</h2>
            <Card className="p-4">
                {loading ? <p>Loading...</p> : (
                    users.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {users.map(user => (
                                <Link to={`/profile/${user.id}`} key={user.id} className="block hover:bg-gray-50 rounded-lg p-3 bg-background-misty">
                                    <div className="flex items-center gap-4">
                                        <Avatar src={user.avatarUrl} alt={user.name} size="md" />
                                        <div className="flex-grow">
                                            <p className="font-bold">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.role}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : <p className="text-center text-gray-500 py-4">Nothing to show here yet.</p>
                )}
            </Card>
        </div>
    );
};


const CourseList: React.FC<{ title: string, fetchQuery: any, profileUser: AppUser }> = ({ title, fetchQuery }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(fetchQuery);
                const coursesData = await Promise.all(querySnapshot.docs.map(async (d) => {
                    const data = d.data();
                    let coach: Course['coach'] = null;
                    // Fetch coach data for each course
                    if (data.coachId) {
                        const coachDoc = await getDoc(doc(db, 'users', data.coachId));
                        if (coachDoc.exists()) {
                            const coachUser = {id: coachDoc.id, ...coachDoc.data()} as AppUser;
                            coach = { id: coachDoc.id, name: coachUser.name, avatarUrl: coachUser.avatarUrl, rating: 4.9, bio: coachUser.bio || '', country: coachUser.country };
                        }
                    }
                    return { id: d.id, ...data, coach } as Course;
                }));
                setCourses(coursesData);
            } catch (error) {
                console.error(`Error fetching ${title}:`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [fetchQuery, title]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-text-charcoal mb-4">{title}</h2>
            {loading ? <p>Loading courses...</p> : (
                courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {courses.map(course => <CourseCard key={course.id} course={course} />)}
                    </div>
                ) : <Card className="p-8 text-center text-gray-500">No courses to display yet.</Card>
            )}
        </div>
    )
}

const CoachDashboard: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div>
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
        </div>
    );
};

export const ProfileScreen: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [profileUser, setProfileUser] = useState<AppUser | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        const fetchUser = async (id: string) => {
            if (!id) return;
            setLoadingProfile(true);
            const userDocRef = doc(db, 'users', id);
            const userDoc = await getDoc(userDocRef);
            if(userDoc.exists()) {
                const userData = userDoc.data();
                setProfileUser({
                    id: userDoc.id,
                    name: userData.fullName,
                    ...userData,
                } as AppUser);
            } else {
                console.error("User not found");
                navigate('/home');
            }
            setLoadingProfile(false);
        };
        
        const effectiveUserId = userId || currentUser?.id;
        if (effectiveUserId) {
            fetchUser(effectiveUserId);
        } else {
             // If no userId in url and no currentUser, they need to log in.
             navigate('/login');
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
    
    if (loadingProfile || !profileUser) {
        return <div className="flex items-center justify-center h-full">Loading profile...</div>;
    }

    const isCurrentUser = currentUser?.id === profileUser.id;
    const coursesRef = collection(db, 'courses');

    return (
        <div className="p-0 md:p-4 bg-light-mint-green min-h-full -m-4 sm:-m-6 lg:-m-8">
            <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
                <ProfileHeader user={profileUser} isCurrentUser={isCurrentUser} />

                {isCurrentUser && profileUser.role === 'Coach' && <CoachDashboard />}
                
                {profileUser.role === 'Coach' ? (
                    <CourseList 
                        title="Courses"
                        fetchQuery={query(coursesRef, where('coachId', '==', profileUser.id), limit(6))}
                        profileUser={profileUser}
                    />
                ) : (
                    profileUser.enrolledCourses && profileUser.enrolledCourses.length > 0 && (
                        <CourseList 
                            title="Enrolled Courses"
                            fetchQuery={query(coursesRef, where('__name__', 'in', profileUser.enrolledCourses.slice(0,10)))}
                            profileUser={profileUser}
                        />
                    )
                )}

                <UserList title={profileUser.role === 'Coach' ? 'Students' : 'Followers'} userIds={profileUser.followers || []} />
                <UserList title="Following" userIds={profileUser.following || []} />


                {isCurrentUser && (
                    <div>
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