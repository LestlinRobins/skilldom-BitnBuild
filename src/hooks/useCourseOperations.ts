import { useState, useCallback } from "react";
import { Course } from "../services/courseService";
import {
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  getAllCourses,
  getUserCourses,
  searchCourses,
  getAllCoursesWithMockData,
  searchAllCourses,
} from "../services/courseService";

interface CourseOperationResult {
  success: boolean;
  course?: Course;
  error?: string;
}

export const useCourseOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateCourse = useCallback(
    async (
      courseData: Omit<Course, "id" | "updated_at">
    ): Promise<CourseOperationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const newCourse = await createCourse(courseData);
        return { success: true, course: newCourse };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create course";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleUpdateCourse = useCallback(
    async (
      courseId: string,
      updates: Partial<Omit<Course, "id" | "created_at">>
    ): Promise<CourseOperationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedCourse = await updateCourse(courseId, updates);
        return { success: true, course: updatedCourse };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update course";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleDeleteCourse = useCallback(
    async (courseId: string): Promise<CourseOperationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        await deleteCourse(courseId);
        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete course";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleGetCourse = useCallback(
    async (courseId: string): Promise<Course | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const course = await getCourse(courseId);
        return course;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to get course";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleGetAllCourses = useCallback(
    async (limit?: number): Promise<Course[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const courses = await getAllCourses(limit);
        return courses;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to get courses";
        setError(errorMessage);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleGetUserCourses = useCallback(
    async (userId: string): Promise<Course[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const courses = await getUserCourses(userId);
        return courses;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to get user courses";
        setError(errorMessage);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSearchCourses = useCallback(
    async (query: string): Promise<Course[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const courses = await searchCourses(query);
        return courses;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to search courses";
        setError(errorMessage);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSearchAllCourses = useCallback(
    async (query: string): Promise<Course[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const courses = await searchAllCourses(query);
        return courses;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to search courses";
        setError(errorMessage);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleGetAllCoursesWithMockData = useCallback(
    async (limit?: number): Promise<Course[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const courses = await getAllCoursesWithMockData(limit);
        return courses;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to get courses";
        setError(errorMessage);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    createCourse: handleCreateCourse,
    updateCourse: handleUpdateCourse,
    deleteCourse: handleDeleteCourse,
    getCourse: handleGetCourse,
    getAllCourses: handleGetAllCourses,
    getUserCourses: handleGetUserCourses,
    searchCourses: handleSearchCourses,
    getAllCoursesWithMockData: handleGetAllCoursesWithMockData,
    searchAllCourses: handleSearchAllCourses,
    isLoading,
    error,
  };
};
