import { supabase, Database } from "../config/supabase";
import { User } from "./authService";

// Use the Database type from config instead of defining our own
type SupabaseUser = Database["public"]["Tables"]["users"]["Row"];

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
    // Explicitly set onboarding fields for new users
    linkedin_url: null,
    github_url: null,
    portfolio_url: null,
    other_links: [],
    skills_verified: false,
    verification_status: "not_started" as const,
    onboarding_completed: false, // This ensures onboarding modal will show
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
    // Map onboarding fields
    linkedin_url: supabaseUser.linkedin_url,
    github_url: supabaseUser.github_url,
    portfolio_url: supabaseUser.portfolio_url,
    other_links: supabaseUser.other_links,
    skills_verified: supabaseUser.skills_verified,
    verification_status: supabaseUser.verification_status,
    onboarding_completed: supabaseUser.onboarding_completed,
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

// Enroll user in a course
export const enrollUserInCourse = async (
  userId: string,
  courseId: string,
  svcCost: number
): Promise<SupabaseUser> => {
  // First get current user profile
  const currentUser = await getUserProfile(userId);
  if (!currentUser) {
    throw new Error("User not found");
  }

  // Check if user has enough SVC coins
  if (currentUser.skill_coins < svcCost) {
    throw new Error("Insufficient SVC coins");
  }

  // Check if already enrolled
  if (currentUser.ongoing_courses.includes(courseId)) {
    throw new Error("Already enrolled in this course");
  }

  // Update user profile with new course and deducted coins
  const updatedOngoingCourses = [...currentUser.ongoing_courses, courseId];
  const updatedSkillCoins = currentUser.skill_coins - svcCost;

  const { data, error } = await supabase
    .from("users")
    .update({
      ongoing_courses: updatedOngoingCourses,
      skill_coins: updatedSkillCoins,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to enroll in course: ${error.message}`);
  }

  return data;
};

// Complete a course and move it to completed courses
export const completeCourse = async (
  userId: string,
  courseId: string,
  svcReward: number = 0
): Promise<SupabaseUser> => {
  // First get current user profile
  const currentUser = await getUserProfile(userId);
  if (!currentUser) {
    throw new Error("User not found");
  }

  // Check if course is in ongoing courses
  if (!currentUser.ongoing_courses.includes(courseId)) {
    throw new Error("Course not found in ongoing courses");
  }

  // Remove from ongoing, add to completed
  const updatedOngoingCourses = currentUser.ongoing_courses.filter(
    (id) => id !== courseId
  );
  const updatedCompletedCourses = [...currentUser.completed_courses];

  if (!updatedCompletedCourses.includes(courseId)) {
    updatedCompletedCourses.push(courseId);
  }

  // Add SVC reward if any
  const updatedSkillCoins = currentUser.skill_coins + svcReward;

  const { data, error } = await supabase
    .from("users")
    .update({
      ongoing_courses: updatedOngoingCourses,
      completed_courses: updatedCompletedCourses,
      skill_coins: updatedSkillCoins,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to complete course: ${error.message}`);
  }

  return data;
};
