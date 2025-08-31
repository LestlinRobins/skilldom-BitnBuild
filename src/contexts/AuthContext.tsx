import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  getUserFromFirebaseUser,
  User,
} from "../services/authService";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    password: string,
    skills: string
  ) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  isLoading: boolean;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        try {
          const userData = await getUserFromFirebaseUser(firebaseUser);
          setUser(userData);

          // Debug logging for onboarding
          console.log("User loaded:", {
            id: userData?.id,
            onboarding_completed: userData?.onboarding_completed,
            verification_status: userData?.verification_status,
          });

          // Check if user needs onboarding
          if (userData && !userData.onboarding_completed) {
            console.log("Auth state change - showing onboarding modal");
            setShowOnboarding(true);
          } else if (userData && userData.onboarding_completed) {
            console.log("Onboarding already completed");
            setShowOnboarding(false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
        setShowOnboarding(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userData = await signInWithEmail(email, password);
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    skills: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      const userData = await signUpWithEmail(
        name,
        email,
        password,
        skillsArray
      );
      setUser(userData);

      // Check if new user needs onboarding immediately
      if (userData && !userData.onboarding_completed) {
        console.log("New user signup - showing onboarding modal");
        // Small delay to ensure state is properly set
        setTimeout(() => setShowOnboarding(true), 100);
      }

      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogleAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userData = await signInWithGoogle();
      setUser(userData);

      // Check if user needs onboarding (for both new and returning Google users)
      if (userData && !userData.onboarding_completed) {
        console.log("Google sign-in - showing onboarding modal");
        // Small delay to ensure state is properly set
        setTimeout(() => setShowOnboarding(true), 100);
      }

      return true;
    } catch (error) {
      console.error("Google sign in error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // If user completed onboarding, hide the modal
    if (updatedUser.onboarding_completed) {
      setShowOnboarding(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        signInWithGoogle: signInWithGoogleAuth,
        logout,
        updateUser,
        isLoading,
        showOnboarding,
        setShowOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
