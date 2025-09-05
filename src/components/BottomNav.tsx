import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Search, Users, BookOpen, User } from "lucide-react";

const BottomNav: React.FC = () => {
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/collaborate", icon: Users, label: "Collab" },
    { path: "/courses", icon: BookOpen, label: "Courses" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary-800/80 backdrop-blur-lg border-t border-primary-600/70 z-40">
      <div className="flex justify-around items-center max-w-md mx-auto p-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-all duration-300 transform
               ${
                 isActive
                   ? "text-accent-300"
                   : "text-gray-400 hover:text-white hover:-translate-y-1"
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22} // Icon size reduced
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-all duration-300 ${
                    isActive ? "-translate-y-1" : ""
                  }`}
                />
                <span
                  className={`text-xs mt-1.5 transition-all duration-300 ${
                    isActive ? "font-semibold" : "font-medium" // Font weight adjusted
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;