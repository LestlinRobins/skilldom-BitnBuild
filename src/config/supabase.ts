import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string; // Firebase UID (TEXT, not UUID)
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
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          skills?: string[];
          bio?: string | null;
          rating?: number;
          skill_coins?: number;
          ongoing_courses?: string[];
          completed_courses?: string[];
          collaborations?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar_url?: string | null;
          skills?: string[];
          bio?: string | null;
          rating?: number;
          skill_coins?: number;
          ongoing_courses?: string[];
          completed_courses?: string[];
          collaborations?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      user_reviews: {
        Row: {
          id: string;
          user_id: string;
          reviewer_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reviewer_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          reviewer_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
