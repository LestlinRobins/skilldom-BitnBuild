import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import CourseCard from "../components/CourseCard";
import SkillSOSModal from "../components/SkillSOSModal";
import { Plus, Sparkles, TrendingUp } from "lucide-react";
import { useCourseOperations } from "../hooks/useCourseOperations";
import type { Course } from "../services/courseService";

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { getAllCoursesWithMockData } = useCourseOperations();
  const [showSkillSOS, setShowSkillSOS] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      try {
        const courses = await getAllCoursesWithMockData();
        setAllCourses(courses);
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCourses();
  }, [getAllCoursesWithMockData]);

  const recommendedCourses = allCourses.slice(0, 3);
  const trendingCourses = allCourses.slice(2, 5);

  return (
    <div className="min-h-screen bg-primary-700 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 p-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-gray-300">Ready to learn something new?</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Skill Coins</p>
            <p className="text-2xl font-bold text-accent-400">
              {user?.skillCoins || 0}
            </p>
          </div>
        </div>

        {/* Personal Agentic Avatar */}
        <div className="bg-primary-700/50 rounded-xl p-4 flex items-center space-x-3">
          <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-300">AI Assistant</p>
            <p className="text-white">
              "Try 'Advanced React Hooks' - perfect for your skill level!"
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Recommended for You */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="text-accent-400" size={20} />
            <h2 className="text-xl font-bold">Recommended for You</h2>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {isLoading
              ? // Loading skeleton
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-80 h-64 bg-primary-600 rounded-xl animate-pulse"
                  ></div>
                ))
              : recommendedCourses.map((course) => (
                  <div key={course.id} className="flex-shrink-0 w-80">
                    <CourseCard course={course} />
                  </div>
                ))}
          </div>
        </section>

        {/* Trending Skills */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="text-accent-400" size={20} />
            <h2 className="text-xl font-bold">Trending Skills</h2>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {isLoading
              ? // Loading skeleton
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-80 h-64 bg-primary-600 rounded-xl animate-pulse"
                  ></div>
                ))
              : trendingCourses.map((course) => (
                  <div key={course.id} className="flex-shrink-0 w-80">
                    <CourseCard course={course} />
                  </div>
                ))}
          </div>
        </section>
      </div>

      {/* Skill SOS FAB */}
      <button
        onClick={() => setShowSkillSOS(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-accent-500 hover:bg-accent-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <Plus size={24} />
      </button>

      {/* Skill SOS Modal */}
      {showSkillSOS && <SkillSOSModal onClose={() => setShowSkillSOS(false)} />}
    </div>
  );
};

export default HomePage;
