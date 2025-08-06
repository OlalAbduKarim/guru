
import React from 'react';
import type { Course } from '../../types';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { Star, BarChart3 } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <Card>
      <div className="relative">
        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-40 object-cover" />
        <div className={`absolute top-2 right-2 px-3 py-1 text-xs font-bold text-white rounded-full ${course.isFree ? 'bg-highlight-slate' : 'bg-accent'}`}>
          {course.isFree ? 'FREE' : 'PRO'}
        </div>
      </div>
      <div className="p-4">
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
    </Card>
  );
};
