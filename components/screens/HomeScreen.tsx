import React from 'react';
import { MOCK_COURSES, MOCK_COACHES, MOCK_LIVE_SESSIONS, SKILL_ICONS } from '../../constants';
import { Avatar } from '../ui/Avatar';
import { Card } from '../ui/Card';
import { CourseCard } from '../ui/CourseCard';
import { Bell, ChevronRight, PlayCircle, Crown, BarChart } from 'lucide-react';
import type { LiveSession } from '../../types';
import { useAuth } from '../../context/AuthContext';

const WelcomeHeader: React.FC = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center">
        <Avatar src={currentUser.avatarUrl} alt={currentUser.name} size="md" />
        <div className="ml-4">
          <p className="text-gray-500 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold text-text-charcoal">{currentUser.name}</h1>
        </div>
      </div>
      <button className="relative p-2 rounded-full bg-white shadow-md">
        <Bell className="text-gray-600" />
        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-white"></span>
      </button>
    </div>
  );
};


const LiveSessionCard: React.FC<{ session: LiveSession }> = ({ session }) => (
  <Card className="bg-gradient-to-br from-primary to-highlight-slate text-white p-6 flex flex-col">
    <div className="flex justify-between items-start">
        <div>
            <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">LIVE NOW</span>
            <h3 className="text-xl font-bold mt-2">{session.title}</h3>
            <div className="flex items-center mt-2">
                <Avatar src={session.coach.avatarUrl} alt={session.coach.name} size="sm" className="border-2 border-highlight-amber" />
                <span className="ml-2 font-semibold">{session.coach.name}</span>
            </div>
        </div>
        <img src="https://picsum.photos/seed/chess-piece/80" alt="Chess Piece" className="w-20 h-20 rounded-full object-cover" />
    </div>
    <button className="mt-4 w-full bg-white text-primary font-bold py-3 px-4 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
      <PlayCircle size={20} className="mr-2" />
      Join Live Session
    </button>
  </Card>
);

const SectionHeader: React.FC<{ title: string; onSeeAll?: () => void }> = ({ title, onSeeAll }) => (
    <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-text-charcoal">{title}</h2>
        {onSeeAll && (
            <button onClick={onSeeAll} className="flex items-center text-sm font-semibold text-primary hover:underline">
                See All <ChevronRight size={16} />
            </button>
        )}
    </div>
);

export const HomeScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const liveSession = MOCK_LIVE_SESSIONS.find(s => s.status === 'Live');

  if (!currentUser) {
    return <div>Loading user data...</div>; // Or a spinner
  }
  
  return (
    <div className="space-y-8">
      <WelcomeHeader />
      
      {liveSession && <LiveSessionCard session={liveSession} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-4 flex items-center bg-highlight-amber/20">
            {SKILL_ICONS[currentUser.skillLevel]}
            <div className="ml-4">
                <p className="text-sm text-gray-600">Skill Level</p>
                <p className="font-bold text-lg text-highlight-amber-darker">{currentUser.skillLevel}</p>
            </div>
        </Card>
         <Card className="p-4 flex items-center bg-highlight-slate/20">
            <Crown className="text-highlight-slate" />
            <div className="ml-4">
                <p className="text-sm text-gray-600">Leaderboard</p>
                <p className="font-bold text-lg">Top 15%</p>
            </div>
        </Card>
         <Card className="p-4 flex items-center bg-accent/20">
            <BarChart className="text-accent" />
            <div className="ml-4">
                <p className="text-sm text-gray-600">Courses</p>
                <p className="font-bold text-lg">3 Enrolled</p>
            </div>
        </Card>
      </div>
      
      <section>
        <SectionHeader title="Continue Learning" onSeeAll={() => {}} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_COURSES.slice(0, 2).map(course => <CourseCard key={course.id} course={course} />)}
        </div>
      </section>
      
      <section>
        <SectionHeader title="Recommended Coaches" onSeeAll={() => {}} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {MOCK_COACHES.slice(0, 3).map(coach => (
             <Card key={coach.id} className="p-4 flex flex-col items-center text-center">
                 <Avatar src={coach.avatarUrl} alt={coach.name} />
                 <h4 className="font-semibold mt-2 text-sm">{coach.name}</h4>
             </Card>
          ))}
        </div>
      </section>
    </div>
  );
};