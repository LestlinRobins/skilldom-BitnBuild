// Example of how to use Supabase services in your components

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updateUserProfile } from "../services/supabaseService";

// Example hook for updating user profile
export const useUserProfile = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const updateProfile = async (updates: {
    name?: string;
    bio?: string;
    skills?: string[];
    avatar_url?: string;
  }) => {
    if (!user) throw new Error("User not authenticated");

    setIsUpdating(true);
    setError(null);

    try {
      await updateUserProfile(user.id, updates);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update profile";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  const addSkillCoins = async (amount: number) => {
    if (!user) throw new Error("User not authenticated");

    setIsUpdating(true);
    setError(null);

    try {
      await updateUserProfile(user.id, {
        skill_coins: user.skillCoins + amount,
      });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update skill coins";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  const addCompletedCourse = async (courseId: string) => {
    if (!user) throw new Error("User not authenticated");

    setIsUpdating(true);
    setError(null);

    try {
      const updatedCompleted = [...user.completedCourses];
      if (!updatedCompleted.includes(courseId)) {
        updatedCompleted.push(courseId);
      }

      const updatedOngoing = user.ongoingCourses.filter(
        (id) => id !== courseId
      );

      await updateUserProfile(user.id, {
        completed_courses: updatedCompleted,
        ongoing_courses: updatedOngoing,
      });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update course progress";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateProfile,
    addSkillCoins,
    addCompletedCourse,
    isUpdating,
    error,
  };
};

// Example of searching users
export const useUserSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async (query: string) => {
    setIsSearching(true);
    setError(null);

    try {
      const { searchUsers } = await import("../services/supabaseService");
      const results = await searchUsers(query);
      setSearchResults(results);
      return results;
    } catch (err: any) {
      const errorMessage = err.message || "Search failed";
      setError(errorMessage);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchUsers,
    searchResults,
    isSearching,
    error,
  };
};

// Example of real-time subscriptions (you can add this later)
export const useRealtimeUsers = () => {
  const [users] = useState([]);

  // This would be implemented with Supabase real-time subscriptions
  // supabase
  //   .from('users')
  //   .on('*', payload => {
  //     // Handle real-time updates
  //   })
  //   .subscribe()

  return { users };
};

// Hook for course enrollment
export const useCourseEnrollment = () => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const enrollInCourse = async (courseId: string, svcCost: number) => {
    if (!user) throw new Error("User not authenticated");

    setIsEnrolling(true);
    setError(null);

    try {
      const { enrollUserInCourse, convertSupabaseUserToUser } = await import(
        "../services/supabaseService"
      );
      const updatedSupabaseUser = await enrollUserInCourse(
        user.id,
        courseId,
        svcCost
      );
      const updatedUser = await convertSupabaseUserToUser(updatedSupabaseUser);

      return { success: true, user: updatedUser };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to enroll in course";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsEnrolling(false);
    }
  };

  const completeCourse = async (courseId: string, svcReward: number = 100) => {
    if (!user) throw new Error("User not authenticated");

    setIsEnrolling(true);
    setError(null);

    try {
      const { completeCourse, convertSupabaseUserToUser } = await import(
        "../services/supabaseService"
      );
      const updatedSupabaseUser = await completeCourse(
        user.id,
        courseId,
        svcReward
      );
      const updatedUser = await convertSupabaseUserToUser(updatedSupabaseUser);

      return { success: true, user: updatedUser };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to complete course";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsEnrolling(false);
    }
  };

  return {
    enrollInCourse,
    completeCourse,
    isEnrolling,
    error,
  };
};
