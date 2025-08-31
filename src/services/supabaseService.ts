import { supabase } from "../config/supabase";
import { User } from "./authService";

export interface SupabaseUser {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  skills: string[];
  bio: string | null;
  rating: number;
  skill_coins: number;
  ongoing_courses: string[];
  completed_courses: string[];
  collaborations: string[];
  created_at: string;
  updated_at: string;
}

// Create a new user profile in Supabase
export const createUserProfile = async (
  user: Omit<User, "reviews" | "createdAt" | "updatedAt">
): Promise<SupabaseUser> => {
  const userProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatarUrl,
    skills: user.skills,
    bio: user.bio,
    rating: user.rating,
    skill_coins: user.skillCoins,
    ongoing_courses: user.ongoingCourses,
    completed_courses: user.completedCourses,
    collaborations: user.collaborations,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("users")
    .insert(userProfile)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user profile: ${error.message}`);
  }

  return data;
};

// Get user profile from Supabase
export const getUserProfile = async (
  userId: string
): Promise<SupabaseUser | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to get user profile: ${error.message}`);
  }

  return data;
};

// Update user profile in Supabase
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<SupabaseUser, "id" | "created_at">>
): Promise<SupabaseUser> => {
  const { data, error } = await supabase
    .from("users")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }

  return data;
};

// Get user reviews from Supabase
export const getUserReviews = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_reviews")
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      reviewer:reviewer_id (
        name,
        avatar_url
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get user reviews: ${error.message}`);
  }

  return data || [];
};

// Add a review for a user
export const addUserReview = async (
  userId: string,
  reviewerId: string,
  rating: number,
  comment?: string
) => {
  const { data, error } = await supabase
    .from("user_reviews")
    .insert({
      user_id: userId,
      reviewer_id: reviewerId,
      rating,
      comment: comment || null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add review: ${error.message}`);
  }

  return data;
};

// Convert SupabaseUser to User interface
export const convertSupabaseUserToUser = async (
  supabaseUser: SupabaseUser
): Promise<User> => {
  const reviews = await getUserReviews(supabaseUser.id);

  return {
    id: supabaseUser.id,
    name: supabaseUser.name,
    email: supabaseUser.email,
    avatarUrl:
      supabaseUser.avatar_url ||
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
    skills: supabaseUser.skills,
    bio: supabaseUser.bio || "",
    rating: supabaseUser.rating,
    reviews: reviews,
    skillCoins: supabaseUser.skill_coins,
    ongoingCourses: supabaseUser.ongoing_courses,
    completedCourses: supabaseUser.completed_courses,
    collaborations: supabaseUser.collaborations,
    createdAt: new Date(supabaseUser.created_at),
    updatedAt: new Date(supabaseUser.updated_at),
  };
};

// Search users by skills or name
export const searchUsers = async (query: string): Promise<SupabaseUser[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .or(`name.ilike.%${query}%,skills.cs.{${query}}`)
    .limit(20);

  if (error) {
    throw new Error(`Failed to search users: ${error.message}`);
  }

  return data || [];
};

// Get all users (for collaboration hub, etc.)
export const getAllUsers = async (
  limit: number = 50
): Promise<SupabaseUser[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get users: ${error.message}`);
  }

  return data || [];
};
