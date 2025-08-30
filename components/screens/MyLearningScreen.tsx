import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import type { Course, AppUser } from '../../types';
import { CourseCard } from '../ui/CourseCard';
import { Card } from '../ui/Card';
import { BookOpen, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyLearningScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            if (!currentUser || !currentUser.enrolledCourses || currentUser.enrolledCourses.length === 0) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Firestore 'in' queries are limited to 10 items. For more, you'd need multiple queries.
                // For this app's scale, 10 is likely sufficient.
                const coursesRef = collection(db, 'courses');
                const q = query(coursesRef, where('__name__', 'in', currentUser.enrolledCourses));
                const querySnapshot = await getDocs(q);
                
                const coursesData = await Promise.all(querySnapshot.docs.map(async (d) => {
                    const data = d.data();
                    let coachData: AppUser | null = null;
                    if (data.coachId) {
                        const coachDoc = await getDoc(doc(db, 'users', data.coachId));
                        if (coachDoc.exists()) {
                            coachData = { id: coachDoc.id, ...coachDoc.data() } as AppUser;
                        }
                    }
                    return {
                        id: d.id,
                        ...data,
                        coach: coachData ? { id: coachData.id, name: coachData.name, avatarUrl: coachData.avatarUrl, rating: 4.8, bio: coachData.bio || '', country: coachData.country } : null,
                    } as Course;
                }));
                
                setEnrolledCourses(coursesData);
            } catch (error) {
                console.error("Error fetching enrolled courses: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrolledCourses();
    }, [currentUser]);

    if (loading) {
        return <div className="text-center p-8">Loading your courses...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-charcoal flex items-center gap-3">
                <BookOpen size={32} /> My Learning
            </h1>
            {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <Card className="p-8 text-center">
                    <h2 className="text-2xl font-bold">Your learning journey awaits!</h2>
                    <p className="text-gray-600 mt-2">You haven't enrolled in any courses yet.</p>
                    <Link to="/explore">
                        <button className="mt-6 flex items-center justify-center gap-2 mx-auto bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-opacity-90 transition">
                            <Search size={20} /> Explore Courses
                        </button>
                    </Link>
                </Card>
            )}
        </div>
    );
};