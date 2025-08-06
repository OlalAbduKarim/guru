
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export const MainLayout: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <div className="flex h-screen bg-background-misty">
      {isDesktop && <Sidebar />}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
        </div>
      </main>
      {!isDesktop && <BottomNav />}
    </div>
  );
};
