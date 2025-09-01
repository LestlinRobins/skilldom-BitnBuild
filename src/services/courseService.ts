import { supabase } from "../config/supabase";
import { courses as mockCourses } from "../data/mockData";

// Transform mock course to match our Course interface
const transformMockCourse = (mockCourse: any): Course => ({
  id: mockCourse.id,
  title: mockCourse.title,
  description: mockCourse.description,
  teacher_id: mockCourse.teacherId,
  skill_category: mockCourse.skillCategory,
  svc_value: mockCourse.svcValue,
  duration: mockCourse.duration,
  availability: mockCourse.availability,
  learners: mockCourse.learners || [],
  image_url: mockCourse.imageUrl,
  created_at: new Date().toISOString(), // Mock timestamp
  updated_at: new Date().toISOString(),
});

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
  // Split the query into keywords
  const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
  
  if (keywords.length === 0) {
    return [];
  }

  let searchQuery = supabase.from("courses").select("*");

  // Build the search filter
  const searchFilters = keywords.map(keyword => 
    `or(title.ilike.%${keyword}%,description.ilike.%${keyword}%,skill_category.ilike.%${keyword}%)`
  ).join(',');

  const { data, error } = await searchQuery
    .or(searchFilters)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Failed to search courses: ${error.message}`);
  }

  return data || [];
};

// Get all courses including both real and mock data
export const getAllCoursesWithMockData = async (
  limit: number = 50
): Promise<Course[]> => {
  try {
    // Get real courses from Supabase
    const realCourses = await getAllCourses(limit);

    // Transform mock courses to match our interface
    const transformedMockCourses = mockCourses.map(transformMockCourse);

    // Combine and return (real courses first, then mock)
    return [...realCourses, ...transformedMockCourses];
  } catch (error) {
    console.error("Error fetching courses:", error);
    // Fallback to mock data if Supabase fails
    return mockCourses.map(transformMockCourse);
  }
};

// Search both real and mock courses
export const searchAllCourses = async (query: string): Promise<Course[]> => {
  try {
    // Search real courses
    const realCourses = await searchCourses(query);

    // Search mock courses
    const mockCoursesFiltered = mockCourses
      .filter(
        (course: any) =>
          course.title.toLowerCase().includes(query.toLowerCase()) ||
          course.description.toLowerCase().includes(query.toLowerCase()) ||
          course.skillCategory.toLowerCase().includes(query.toLowerCase())
      )
      .map(transformMockCourse);

    // Combine results
    return [...realCourses, ...mockCoursesFiltered];
  } catch (error) {
    console.error("Error searching courses:", error);
    // Fallback to filtering mock data
    return mockCourses
      .filter(
        (course: any) =>
          course.title.toLowerCase().includes(query.toLowerCase()) ||
          course.description.toLowerCase().includes(query.toLowerCase()) ||
          course.skillCategory.toLowerCase().includes(query.toLowerCase())
      )
      .map(transformMockCourse);
  }
};
