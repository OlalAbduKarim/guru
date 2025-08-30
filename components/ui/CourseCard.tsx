import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Course } from '../../types';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { Star, BarChart3, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CourseCardProps {
  course: Course;
}

const formatPrice = (price?: number) => {
    if (price === undefined || price === null || price <= 0) {
        return { text: 'Free', color: 'bg-soft-emerald' };
    }
    return { text: `$${price.toFixed(2)}`, color: 'bg-highlight-slate' };
};


export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const isEnrolled = currentUser?.enrolledCourses?.includes(course.id);
  const priceInfo = formatPrice(course.price);

  const handleCardClick = () => {
      navigate(`/course/${course.id}`);
  }
  
  return (
    <Card 
        className="flex flex-col"
        onClick={handleCardClick}
    >
      <div className="relative">
        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-40 object-cover" />
        <div className={`absolute top-3 right-3 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg ${priceInfo.color}`}>
            {priceInfo.text}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex items-center text-sm text-gray-500 mb-2">
              <BarChart3 size={16} className="text-highlight-slate" />
              <span className="ml-1">{course.level}</span>
          </div>
          <h3 className="font-bold text-md text-text-charcoal h-12 line-clamp-2">{course.title}</h3>
          <div className="flex items-center mt-3">
            <Avatar src={course.coach.avatarUrl} alt={course.coach.name} size="sm" />
            <span className="ml-2 text-sm font-medium text-gray-700">{course.coach.name}</span>
            <div className="flex items-center ml-auto text-highlight-amber">
              <Star size={16} className="fill-current" />
              <span className="ml-1 font-semibold">{course.rating}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          {isEnrolled ? (
              <button 
                  onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                  className="w-full bg-soft-emerald/20 text-soft-emerald font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 cursor-pointer hover:bg-soft-emerald/30 transition-colors"
              >
                  <CheckCircle size={18} /> View Course
              </button>
          ) : (
              <button onClick={(e) => { e.stopPropagation(); handleCardClick(); }} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition">
                  View Details
              </button>
          )}
        </div>
      </div>
    </Card>
  );
};