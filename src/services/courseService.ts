import { supabase } from "../config/supabase";

export interface Course {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  skill_category: string;
  svc_value: number;
  duration: number;
  availability: string[];
  learners: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export const createCourse = async (
  courseData: Omit<Course, "id" | "updated_at">
): Promise<Course> => {
  const { data, error } = await supabase
    .from("courses")
    .insert({
      ...courseData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create course: ${error.message}`);
  }

  return data;
};

export const getCourse = async (courseId: string): Promise<Course | null> => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to get course: ${error.message}`);
  }

  return data;
};

export const updateCourse = async (
  courseId: string,
  updates: Partial<Omit<Course, "id" | "created_at">>
): Promise<Course> => {
  const { data, error } = await supabase
    .from("courses")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", courseId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update course: ${error.message}`);
  }

  return data;
};

export const deleteCourse = async (courseId: string): Promise<void> => {
  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) {
    throw new Error(`Failed to delete course: ${error.message}`);
  }
};

export const getAllCourses = async (limit: number = 50): Promise<Course[]> => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get courses: ${error.message}`);
  }

  return data || [];
};

export const getUserCourses = async (userId: string): Promise<Course[]> => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("teacher_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get user courses: ${error.message}`);
  }

  return data || [];
};

export const searchCourses = async (query: string): Promise<Course[]> => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .or(
      `title.ilike.%${query}%,description.ilike.%${query}%,skill_category.ilike.%${query}%`
    )
    .limit(20);

  if (error) {
    throw new Error(`Failed to search courses: ${error.message}`);
  }

  return data || [];
};
