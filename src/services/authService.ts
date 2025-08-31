import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../config/firebase";
import {
  createUserProfile,
  getUserProfile,
  convertSupabaseUserToUser,
  updateUserProfile,
} from "./supabaseService";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  skills: string[];
  bio: string;
  rating: number;
  reviews: any[];
  skillCoins: number;
  ongoingCourses: string[];
  completedCourses: string[];
  collaborations: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Sign up with email and password
export const signUpWithEmail = async (
  name: string,
  email: string,
  password: string,
  skills: string[]
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Update the user's display name
    await updateProfile(firebaseUser, {
      displayName: name,
    });

    // Create user object
    const user: Omit<User, "reviews" | "createdAt" | "updatedAt"> = {
      id: firebaseUser.uid,
      name,
      email,
      avatarUrl:
        firebaseUser.photoURL ||
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
      skills,
      bio: `New Skilldom member passionate about ${skills[0] || "learning"}.`,
      rating: 0,
      skillCoins: 500,
      ongoingCourses: [],
      completedCourses: [],
      collaborations: [],
    };

    // Save user to Supabase
    const supabaseUser = await createUserProfile(user);
    return await convertSupabaseUserToUser(supabaseUser);
  } catch (error: any) {
    throw new Error(error.message || "Failed to create account");
  }
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Get user document from Supabase
    const supabaseUser = await getUserProfile(firebaseUser.uid);

    if (!supabaseUser) {
      throw new Error("User profile not found");
    }

    return await convertSupabaseUserToUser(supabaseUser);
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign in");
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Check if user document exists in Supabase
    const supabaseUser = await getUserProfile(firebaseUser.uid);

    let user: User;

    if (supabaseUser) {
      // User exists, update last login timestamp
      await updateUserProfile(firebaseUser.uid, {
        updated_at: new Date().toISOString(),
      });
      user = await convertSupabaseUserToUser(supabaseUser);
    } else {
      // New user, create their profile in Supabase
      const newUserData: Omit<User, "reviews" | "createdAt" | "updatedAt"> = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || "Google User",
        email: firebaseUser.email || "",
        avatarUrl:
          firebaseUser.photoURL ||
          "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
        skills: [],
        bio: "New Skilldom member.",
        rating: 0,
        skillCoins: 500,
        ongoingCourses: [],
        completedCourses: [],
        collaborations: [],
      };

      const createdUser = await createUserProfile(newUserData);
      user = await convertSupabaseUserToUser(createdUser);
    }

    return user;
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign in with Google");
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign out");
  }
};

// Get user from Firebase User object
export const getUserFromFirebaseUser = async (
  firebaseUser: FirebaseUser
): Promise<User | null> => {
  try {
    const supabaseUser = await getUserProfile(firebaseUser.uid);

    if (!supabaseUser) {
      return null;
    }

    return await convertSupabaseUserToUser(supabaseUser);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};
