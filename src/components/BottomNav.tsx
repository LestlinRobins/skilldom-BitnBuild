import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Users, BookOpen, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/collaborate', icon: Users, label: 'Collaborate' },
    { path: '/courses', icon: BookOpen, label: 'My Courses' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary-800 border-t border-primary-600 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'text-accent-400 bg-accent-400/10'
                  : 'text-gray-400 hover:text-accent-400 hover:bg-accent-400/5'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;