import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getNavLinks } from '../../constants';
import { useAuth } from '../../context/AuthContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const NAV_LINKS = getNavLinks(!!currentUser, currentUser?.id);


  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around items-center md:hidden z-50">
      {NAV_LINKS.map((link) => {
        const isActive = location.pathname === link.href;
        return (
          <NavLink
            key={link.href}
            to={link.href}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
              isActive ? 'text-primary -translate-y-2' : 'text-gray-400'
            }`}
          >
            <div className={`p-3 rounded-full transition-all duration-300 ${isActive ? 'bg-primary/10' : ''}`}>
                {link.icon}
            </div>
            {isActive && <span className="text-xs font-bold mt-1">{link.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
};