import { useState, useCallback, useEffect } from 'react';
import { getUserProfile, searchUsers } from '../services/supabaseService';
import type { Database } from '../config/supabase';

type SupabaseUser = Database['public']['Tables']['users']['Row'];

export const useUserOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedUsers, setCachedUsers] = useState<Map<string, SupabaseUser>>(new Map());

  const getUser = useCallback(async (userId: string): Promise<SupabaseUser | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      if (cachedUsers.has(userId)) {
        return cachedUsers.get(userId) || null;
      }

      const user = await getUserProfile(userId);
      if (user) {
        setCachedUsers(prev => new Map(prev.set(userId, user)));
      }
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cachedUsers]);

  const searchForUsers = useCallback(async (query: string): Promise<SupabaseUser[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const users = await searchUsers(query);
      // Update cache with found users
      users.forEach(user => {
        setCachedUsers(prev => new Map(prev.set(user.id, user)));
      });
      return users;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search users';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getUser,
    searchForUsers,
    isLoading,
    error
  };
};
