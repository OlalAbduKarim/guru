import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Course, AppUser } from '../../types';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { ArrowLeft, FileText, Download, CheckCircle, Star, Video, PlayCircle } from 'lucide-react';
import { PaymentModal } from '../ui/PaymentModal';

const CourseHeader: React.FC<{ course: Course }> = ({ course }) => (
    <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg">
        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 text-white">
            <div className="flex items-center gap-3">
                <span className="bg-primary px-3 py-1 rounded-full text-sm font-semibold">{course.topic}</span>
                <span className="bg-highlight-slate px-3 py-1 rounded-full text-sm font-semibold">{course.level}</span>
            </div>
            <h1 className="text-4xl font-bold mt-4">{course.title}</h1>
        </div>
    </div>
);

const CoachInfo: React.FC<{ coach: Course['coach'] }> = ({ coach }) => {
    if (!coach) return null;
    return (
        <Card className="p-4">
            <h3 className="font-bold text-xl mb-4">About the Instructor</h3>
            <Link to={`/profile/${coach.id}`} className="flex items-center gap-4 group">
                <Avatar src={coach.avatarUrl} alt={coach.name} size="lg" />
                <div>
                    <p className="font-bold text-lg text-primary group-hover:underline">{coach.name}</p>
                    <div className="flex items-center text-highlight-amber mt-1">
                        <Star size={16} className="fill-current" />
                        <span className="ml-1 font-semibold text-sm">{coach.rating}</span>
                    </div>
                </div>
            </Link>
            <p className="mt-4 text-gray-600 text-sm">{coach.bio}</p>
        </Card>
    );
}

const CourseMaterials: React.FC<{ course: Course }> = ({ course }) => (
    <Card className="p-6">
        <h3 className="font-bold text-2xl mb-4">Course Materials</h3>
        <div className="space-y-3">
            {course.materials && course.materials.length > 0 ? (
                course.materials.map((material, index) => (
                    <a 
                        key={index}
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        {...(material.type === 'pdf' && { download: true })}
                        className="flex items-center justify-between p-3 bg-light-mint-green rounded-lg hover:bg-primary/10 transition-colors group"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            {material.type === 'video'
                                ? <Video className="text-primary flex-shrink-0" />
                                : <FileText className="text-primary flex-shrink-0" />
                            }
                            <span className="font-semibold truncate" title={material.name}>{material.name}</span>
                        </div>
                        {material.type === 'video' ? (
                             <div className="flex items-center gap-2 text-primary font-semibold">
                                Watch <PlayCircle size={20} className="text-primary group-hover:scale-110 transition-transform" />
                            </div>
                        ) : (
                             <div className="flex items-center gap-2 text-primary font-semibold">
                                Download <Download size={20} className="text-primary group-hover:scale-110 transition-transform" />
                            </div>
                        )}
                    </a>
                ))
            ) : (
                <p className="text-gray-500">No materials available for this course yet.</p>
            )}
        </div>
    </Card>
);

export const CourseDetailScreen: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { currentUser, enrollInCourse } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    
    useEffect(() => {
        if (!courseId) {
            navigate('/explore');
            return;
        }
        
        const fetchCourse = async () => {
            setLoading(true);
            try {
                const courseDocRef = doc(db, 'courses', courseId);
                const courseDoc = await getDoc(courseDocRef);

                if (courseDoc.exists()) {
                    const data = courseDoc.data();
                    let coachData: AppUser | null = null;
                     if (data.coachId) {
                        const coachDoc = await getDoc(doc(db, 'users', data.coachId));
                        if (coachDoc.exists()) {
                            coachData = { id: coachDoc.id, ...coachDoc.data() } as AppUser;
                        }
                    }
                    setCourse({
                        id: courseDoc.id,
                        ...data,
                        coach: coachData ? { id: coachData.id, name: coachData.name, avatarUrl: coachData.avatarUrl, rating: 4.9, bio: coachData.bio || '', country: coachData.country } : null,
                    } as Course);
                } else {
                    console.log("No such course!");
                    navigate('/home'); // Or a 404 page
                }
            } catch (error) {
                console.error("Error fetching course:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, navigate]);
    
    const handleEnroll = async () => {
        if (!currentUser || !courseId) {
            navigate('/login');
            return;
        }
        setIsEnrolling(true);
        try {
            await enrollInCourse(courseId);
        } catch (error) {
            console.error("Failed to enroll", error);
            alert('There was an issue enrolling in the course.');
        } finally {
            setIsEnrolling(false);
        }
    };

    const handlePaymentSuccess = () => {
        setShowPaymentModal(false);
        handleEnroll();
    };

    if (loading) {
        return <div className="text-center p-8">Loading course details...</div>;
    }

    if (!course) {
        return <div className="text-center p-8">Course not found.</div>;
    }
    
    const isEnrolled = currentUser?.enrolledCourses?.includes(course.id);
    const isFree = !course.price || course.price <= 0;
    const priceText = isFree ? "FREE" : `$${course.price?.toFixed(2)}`;

    return (
        <>
            {showPaymentModal && course && (
                <PaymentModal 
                    course={course}
                    onClose={() => setShowPaymentModal(false)}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
            <div className="space-y-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary font-semibold mb-2 hover:underline">
                    <ArrowLeft size={20} /> Back
                </button>
                
                <CourseHeader course={course} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6">
                            <h2 className="font-bold text-2xl">About this course</h2>
                            <p className="mt-4 text-gray-700 whitespace-pre-wrap">{course.description}</p>
                        </Card>
                        {isEnrolled && <CourseMaterials course={course} />}
                    </div>
                    <div className="space-y-6 lg:sticky lg:top-8">
                         <Card className="p-6 text-center">
                            <h2 className={`text-4xl font-bold mb-4 ${isFree ? 'text-soft-emerald' : 'text-text-charcoal'}`}>
                                {priceText}
                            </h2>
                            {isEnrolled ? (
                                 <div className="text-center bg-soft-emerald/10 text-soft-emerald p-4 rounded-lg">
                                    <CheckCircle size={32} className="mx-auto" />
                                    <p className="font-bold mt-2">You are enrolled!</p>
                                    <p className="text-sm">You can now access all course materials.</p>
                                 </div>
                            ) : isFree ? (
                                 <button onClick={handleEnroll} disabled={isEnrolling} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-opacity-90 transition disabled:opacity-50 text-lg">
                                    {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                                </button>
                            ) : (
                                <button onClick={() => setShowPaymentModal(true)} disabled={isEnrolling} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-opacity-90 transition disabled:opacity-50 text-lg">
                                    {isEnrolling ? 'Processing...' : 'Buy Now'}
                                </button>
                            )}
                        </Card>
                        {course.coach && <CoachInfo coach={course.coach} />}
                    </div>
                </div>
            </div>
        </>
    );
};