import React from 'react';
import { Home, Search, Clapperboard, MessageSquare, User as UserIcon, Crown, ShieldCheck, Gamepad2, BookOpen, LogIn, Swords } from 'lucide-react';
import type { Coach, Course, LiveSession, AppUser } from './types';

export const getNavLinks = (isLoggedIn: boolean, userId?: string) => {
  const baseLinks = [
    { href: '/home', label: 'Home', icon: <Home size={24} /> },
    { href: '/explore', label: 'Explore', icon: <Search size={24} /> },
    { href: '/live', label: 'Live', icon: <Clapperboard size={24} /> },
    { href: '/play', label: 'Play', icon: <Swords size={24} /> },
  ];

  if (isLoggedIn) {
    return [
      ...baseLinks,
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
    }
];

export const MOCK_USER: AppUser = MOCK_ALL_USERS[0];


export const MOCK_COACHES: Coach[] = [
  { id: 'c1', name: 'GM Anya Sharma', avatarUrl: 'https://i.pravatar.cc/150?u=c1', rating: 4.9, bio: 'Grandmaster specializing in aggressive openings.', country: 'India' },
  { id: 'c2', name: 'IM Ben Carter', avatarUrl: 'https://i.pravatar.cc/150?u=c2', rating: 4.8, bio: 'International Master focused on positional play.', country: 'UK' },
  { id: 'c3', name: 'WGM Sofia Rossi', avatarUrl: 'https://i.pravatar.cc/150?u=c3', rating: 4.9, bio: 'Woman Grandmaster, expert in endgame theory.', country: 'Italy' },
];

export const MOCK_COURSES: Course[] = [
  { id: 'cr1', title: 'Mastering the Sicilian Defense', thumbnailUrl: 'https://picsum.photos/seed/course1/400/225', coach: MOCK_COACHES[0], rating: 4.9, level: 'Advanced', isFree: false, topic: 'Openings' },
  { id: 'cr2', title: 'Endgame Fundamentals', thumbnailUrl: 'https://picsum.photos/seed/course2/400/225', coach: MOCK_COACHES[2], rating: 4.8, level: 'Beginner', isFree: true, topic: 'Endgame' },
  { id: 'cr3', title: 'Strategic Pawn Structures', thumbnailUrl: 'https://picsum.photos/seed/course3/400/225', coach: MOCK_COACHES[1], rating: 4.7, level: 'Intermediate', isFree: false, topic: 'Strategy' },
  { id: 'cr4', title: 'The Art of Attack', thumbnailUrl: 'https://picsum.photos/seed/course4/400/225', coach: MOCK_COACHES[0], rating: 5.0, level: 'Masterclass', isFree: false, topic: 'Midgame' },
];

export const MOCK_LIVE_SESSIONS: LiveSession[] = [
  { id: 'ls1', title: 'Live Game Analysis', coach: MOCK_COACHES[0], startTime: new Date(), status: 'Live' },
  { id: 'ls2', title: 'Q&A on King\'s Indian', coach: MOCK_COACHES[1], startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), status: 'Upcoming' },
  { id: 'ls3', title: 'Rook Endgames Masterclass', coach: MOCK_COACHES[2], startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), status: 'Upcoming' },
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