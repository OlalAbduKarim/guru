
import React, { useState } from 'react';
import { MOCK_COURSES, MOCK_COACHES, EXPLORE_FILTERS } from '../../constants';
import { CourseCard } from '../ui/CourseCard';
import { CoachCard } from '../ui/CoachCard';
import { Search, SlidersHorizontal, User, BookOpen } from 'lucide-react';

const SearchBar: React.FC = () => (
  <div className="relative mb-6">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
    <input 
      type="text" 
      placeholder="Search courses, coaches, or topics..." 
      className="w-full bg-white rounded-full py-3 pl-12 pr-4 shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

const FilterChip: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            isActive ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
    >
        {label}
    </button>
);

export const ExploreScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'coaches'>('courses');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const toggleFilter = (filter: string) => {
      setActiveFilters(prev => 
          prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
      );
  }

  const TABS = [
    { id: 'courses', label: 'Courses', icon: <BookOpen size={18} />},
    { id: 'coaches', label: 'Coaches', icon: <User size={18} />},
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-charcoal">Explore</h1>
      <SearchBar />
      
      <div className="flex justify-center bg-white p-1 rounded-full shadow-inner w-full md:w-auto">
          {TABS.map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'courses' | 'coaches')}
                  className={`flex items-center justify-center gap-2 w-1/2 px-6 py-2 rounded-full text-md font-semibold transition-all duration-300 ${
                      activeTab === tab.id ? 'bg-primary text-white shadow' : 'text-gray-500'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
              </button>
          ))}
      </div>
      
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white text-gray-700 hover:bg-gray-100">
          <SlidersHorizontal size={16} /> Filters
        </button>
        {EXPLORE_FILTERS.topics.map(topic => (
            <FilterChip 
              key={topic} 
              label={topic}
              isActive={activeFilters.includes(topic)}
              onClick={() => toggleFilter(topic)}
            />
        ))}
      </div>
      
      <div>
        {activeTab === 'courses' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_COURSES.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_COACHES.map(coach => <CoachCard key={coach.id} coach={coach} />)}
          </div>
        )}
      </div>
    </div>
  );
};
