import React from 'react';
import { Home, Search, Clapperboard, MessageSquare, User as UserIcon, Crown, ShieldCheck, Gamepad2, BookOpen, LogIn, Swords, Map, Target, Shield, BrainCircuit, Puzzle } from 'lucide-react';
import type { Coach, Course, LiveSession, AppUser, BaseStudyPlan } from './types';

export interface StudyPlan extends BaseStudyPlan {
  icon: React.ReactNode;
}

export const getNavLinks = (isLoggedIn: boolean, userId?: string) => {
  const baseLinks = [
    { href: '/home', label: 'Home', icon: <Home size={24} /> },
    { href: '/explore', label: 'Explore', icon: <Search size={24} /> },
    { href: '/live', label: 'Live', icon: <Clapperboard size={24} /> },
    { href: '/play', label: 'Play', icon: <Swords size={24} /> },
  ];

  if (isLoggedIn) {
    return [
      baseLinks[0], // Home
      { href: '/my-learning', label: 'My Learning', icon: <BookOpen size={24} /> },
      ...baseLinks.slice(1), // explore, live, play
      { href: '/messages', label: 'Messages', icon: <MessageSquare size={24} /> },
      { href: `/profile/${userId || ''}`, label: 'Profile', icon: <UserIcon size={24} /> },
    ];
  }
  
  return [
    ...baseLinks,
    { href: '/login', label: 'Log In', icon: <LogIn size={24} /> },
  ];
};


export const MOCK_ALL_USERS: AppUser[] = [
    {
        id: 'c1',
        name: 'GM Anya Sharma',
        avatarUrl: 'https://i.pravatar.cc/150?u=c1',
        country: 'India',
        skillLevel: 'Master',
        role: 'Coach',
        bio: 'Grandmaster specializing in aggressive openings. Let me show you the secrets of attack.',
        followers: ['s1', 's2'],
        following: ['c2'],
        enrolledCourses: [],
    },
    {
        id: 'c2',
        name: 'IM Ben Carter',
        avatarUrl: 'https://i.pravatar.cc/150?u=c2',
        country: 'UK',
        skillLevel: 'Master',
        role: 'Coach',
        bio: 'International Master focused on positional play and endgame theory.',
        followers: ['s2'],
        following: ['c1'],
        enrolledCourses: [],
    },
    {
        id: 's1',
        name: 'Alex Johnson',
        avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
        country: 'USA',
        skillLevel: 'Intermediate',
        role: 'Student',
        bio: 'Club player looking to improve my tactical vision.',
        followers: [],
        following: ['c1'],
        enrolledCourses: ['cr2', 'cr3'],
    },
    {
        id: 's2',
        name: 'Maria Garcia',
        avatarUrl: 'https://i.pravatar.cc/150?u=s2',
        country: 'Spain',
        skillLevel: 'Beginner',
        role: 'Student',
        bio: 'Just started playing chess and I love it!',
        followers: [],
        following: ['c1', 'c2'],
        enrolledCourses: ['cr2'],
    }
];

export const MOCK_USER: AppUser = MOCK_ALL_USERS[0];


export const MOCK_COACHES: Coach[] = [
  { id: 'c1', name: 'GM Anya Sharma', avatarUrl: 'https://i.pravatar.cc/150?u=c1', rating: 4.9, bio: 'Grandmaster specializing in aggressive openings.', country: 'India' },
  { id: 'c2', name: 'IM Ben Carter', avatarUrl: 'https://i.pravatar.cc/150?u=c2', rating: 4.8, bio: 'International Master focused on positional play.', country: 'UK' },
  { id: 'c3', name: 'WGM Sofia Rossi', avatarUrl: 'https://i.pravatar.cc/150?u=c3', rating: 4.9, bio: 'Woman Grandmaster, expert in endgame theory.', country: 'Italy' },
];

export const MOCK_COURSES: Course[] = [
  { id: 'cr1', title: 'Mastering the Sicilian Defense', thumbnailUrl: 'https://picsum.photos/seed/course1/400/225', coach: MOCK_COACHES[0], rating: 4.9, level: 'Advanced', price: 49.99, topic: 'Openings' },
  { id: 'cr2', title: 'Endgame Fundamentals', thumbnailUrl: 'https://picsum.photos/seed/course2/400/225', coach: MOCK_COACHES[2], rating: 4.8, level: 'Beginner', price: 0, topic: 'Endgame' },
  { id: 'cr3', title: 'Strategic Pawn Structures', thumbnailUrl: 'https://picsum.photos/seed/course3/400/225', coach: MOCK_COACHES[1], rating: 4.7, level: 'Intermediate', price: 29.99, topic: 'Strategy' },
  { id: 'cr4', title: 'The Art of Attack', thumbnailUrl: 'https://picsum.photos/seed/course4/400/225', coach: MOCK_COACHES[0], rating: 5.0, level: 'Masterclass', price: 99.99, topic: 'Midgame' },
];

export const MOCK_LIVE_SESSIONS: LiveSession[] = [
  { id: 'ls1', title: 'Live Game Analysis', coach: MOCK_COACHES[0], startTime: new Date(), status: 'Live' },
  { id: 'ls2', title: 'Q&A on King\'s Indian', coach: MOCK_COACHES[1], startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), status: 'Upcoming' },
  { id: 'ls3', title: 'Rook Endgames Masterclass', coach: MOCK_COACHES[2], startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), status: 'Upcoming' },
];

export const MOCK_STUDY_PLANS: StudyPlan[] = [
  {
    id: 'sp1',
    title: 'Beginner\'s Journey',
    description: 'Learn the fundamental rules, basic tactics, and essential checkmating patterns.',
    level: 'Beginner',
    icon: <Map size={28} className="text-highlight-slate" />,
  },
  {
    id: 'sp2',
    title: 'The Italian Game',
    description: 'Master the common lines and strategic ideas in one of the oldest openings.',
    level: 'Intermediate',
    icon: <Target size={28} className="text-primary" />,
  },
  {
    id: 'sp3',
    title: 'Solid Defenses',
    description: 'A study plan focusing on the Caro-Kann and Slav defenses for Black.',
    level: 'Intermediate',
    icon: <Shield size={28} className="text-dark-olive" />,
  },
  {
    id: 'sp4',
    title: 'Advanced Tactics & Calculation',
    description: 'Dive deep into complex tactical motifs, combinations, and calculation techniques.',
    level: 'Advanced',
    icon: <BrainCircuit size={28} className="text-accent" />,
  },
  {
    id: 'sp5',
    title: 'Opening Repertoire Builder',
    description: 'Develop a solid opening system for both White and Black to confidently start your games.',
    level: 'Intermediate',
    icon: <BookOpen size={28} className="text-gray-700" />,
  },
  {
    id: 'sp6',
    title: 'Middlegame Strategy',
    description: 'Learn key strategic concepts like piece activity, pawn structures, and planning.',
    level: 'Intermediate',
    icon: <Puzzle size={28} className="text-soft-emerald" />,
  },
  {
    id: 'sp7',
    title: 'Endgame Mastery',
    description: 'Master the most common endgame scenarios, including rook and pawn endgames.',
    level: 'Advanced',
    icon: <Crown size={28} className="text-highlight-amber" />,
  },
];

export const EXPLORE_FILTERS = {
    levels: ['Beginner', 'Intermediate', 'Advanced', 'Masterclass'],
    topics: ['Openings', 'Midgame', 'Endgame', 'Strategy', 'Tactics'],
    price: ['Free', 'Paid'],
};

export const SKILL_ICONS = {
  Beginner: <Gamepad2 className="text-highlight-slate" />,
  Intermediate: <ShieldCheck className="text-primary" />,
  Advanced: <BookOpen className="text-highlight-amber" />,
  Master: <Crown className="text-accent" />
}