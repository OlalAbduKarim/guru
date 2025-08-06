
import React from 'react';
import type { Coach } from '../../types';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { Star, MapPin } from 'lucide-react';

interface CoachCardProps {
  coach: Coach;
}

export const CoachCard: React.FC<CoachCardProps> = ({ coach }) => {
  return (
    <Card className="flex flex-col items-center p-6 text-center">
      <Avatar src={coach.avatarUrl} alt={coach.name} size="lg" className="border-4 border-highlight-amber" />
      <h3 className="mt-4 font-bold text-lg text-text-charcoal">{coach.name}</h3>
      <div className="flex items-center text-highlight-amber mt-1">
        <Star size={16} className="fill-current" />
        <span className="ml-1 font-semibold">{coach.rating}</span>
      </div>
      <div className="flex items-center text-gray-500 mt-1 text-sm">
        <MapPin size={14} />
        <span className="ml-1">{coach.country}</span>
      </div>
      <p className="mt-3 text-sm text-gray-600 line-clamp-2 h-10">{coach.bio}</p>
      <button className="mt-4 w-full bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-opacity-90 transition-colors">
        View Profile
      </button>
    </Card>
  );
};
