import React, { createContext, useContext, useState, useEffect } from 'react';
import { users } from '../data/mockData';

interface User {
  id: string;
  name: string;
  avatarUrl: string;
  skills: string[];
  bio: string;
  rating: number;
  reviews: any[];
  skillCoins: number;
  ongoingCourses: string[];
  completedCourses: string[];
  collaborations: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, skills: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('skilldom_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock login - always use the first user for demo
    const mockUser = users[0];
    setUser(mockUser);
    localStorage.setItem('skilldom_user', JSON.stringify(mockUser));
    
    setIsLoading(false);
    return true;
  };

  const signup = async (name: string, email: string, password: string, skills: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      name,
      avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      skills: skills.split(',').map(s => s.trim()),
      bio: `New Skilldom member passionate about ${skills.split(',')[0]?.trim() || 'learning'}.`,
      rating: 0,
      reviews: [],
      skillCoins: 500, // Starting bonus
      ongoingCourses: [],
      completedCourses: [],
      collaborations: []
    };
    
    setUser(newUser);
    localStorage.setItem('skilldom_user', JSON.stringify(newUser));
    
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skilldom_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};