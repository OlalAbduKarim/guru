import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getNavLinks } from '../../constants';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const NAV_LINKS = getNavLinks(!!currentUser, currentUser?.id);


  const handleLogout = async () => {
    try {
      await logout();
      navigate('/welcome');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  return (
    <aside className={`bg-white shadow-xl h-full flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center p-4 h-20 border-b relative">
        {!isCollapsed && <span className="font-bold text-xl text-primary">ChessMaster</span>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-4 top-1/2 -translate-y-1/2 bg-primary text-white rounded-full p-1.5 z-10">
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      <nav className="flex-grow pt-4">
        <ul>
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <li key={link.href} className="px-4 mb-2">
                <NavLink
                  to={link.href}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    isActive ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {link.icon}
                  {!isCollapsed && <span className="ml-4 font-semibold">{link.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      {currentUser && (
        <div className="p-4 border-t">
          <button onClick={handleLogout} className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 text-gray-600 hover:bg-red-500/10 hover:text-accent`}>
              <LogOut size={24} />
              {!isCollapsed && <span className="ml-4 font-semibold">Log Out</span>}
          </button>
        </div>
      )}
    </aside>
  );
};