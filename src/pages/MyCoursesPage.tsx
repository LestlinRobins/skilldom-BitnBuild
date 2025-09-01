import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { badges } from "../data/mockData";
import CourseCard from "../components/CourseCard";
import CreateCourseModal from "../components/CreateCourseModal";
import {
  Trophy,
  Flame,
  Target,
  BookOpen,
  GraduationCap,
  Sparkles,
  Users,
  Plus,
} from "lucide-react";
import { useCourseOperations } from "../hooks/useCourseOperations";
import type { Course } from "../services/courseService";

const MyCoursesPage: React.FC = () => {
  const { user } = useAuth();
  const { getAllCourses, getUserCourses } = useCourseOperations();
  const [activeTab, setActiveTab] = useState<
    "progress" | "completed" | "teaching"
  >("progress");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [userTeachingCourses, setUserTeachingCourses] = useState<Course[]>([]);

  useEffect(() => {
    const loadCourses = async () => {
      const courses = await getAllCourses();
      setAllCourses(courses);

      if (user?.id) {
        const teachingCourses = await getUserCourses(user.id);
        setUserTeachingCourses(teachingCourses);
      }
    };
    loadCourses();
  }, [user?.id, getAllCourses, getUserCourses]);

  const ongoingCourses = allCourses.filter((course) =>
    user?.ongoingCourses.includes(course.id)
  );
  const completedCourses = allCourses.filter((course) =>
    user?.completedCourses.includes(course.id)
  );
  const teachingCourses = userTeachingCourses;

  const userBadges = badges.slice(0, 3); // Mock earned badges

  const iconMap = {
    Trophy,
    Flame,
    Users,
    BookOpen,
    Shield: Sparkles,
  };

  return (
    <div className="min-h-screen bg-primary-700 text-white">
      {/* Header with Gamification */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 p-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold mb-6">My Learning Journey</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-primary-700/50 rounded-xl p-4 text-center">
            <Target className="text-accent-400 mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold">7</p>
            <p className="text-xs text-gray-300">Day Streak</p>
          </div>
          <div className="bg-primary-700/50 rounded-xl p-4 text-center">
            <GraduationCap
              className="text-success-400 mx-auto mb-2"
              size={24}
            />
            <p className="text-2xl font-bold">
              {user?.completedCourses.length || 0}
            </p>
            <p className="text-xs text-gray-300">Completed</p>
          </div>
          <div className="bg-primary-700/50 rounded-xl p-4 text-center">
            <BookOpen className="text-warning-400 mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold">
              {user?.ongoingCourses.length || 0}
            </p>
            <p className="text-xs text-gray-300">In Progress</p>
          </div>
        </div>

        {/* Badges */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Recent Achievements
          </h3>
          <div className="flex space-x-3 overflow-x-auto">
            {userBadges.map((badge: any) => {
              const IconComponent =
                iconMap[badge.icon as keyof typeof iconMap] || Trophy;
              return (
                <div
                  key={badge.id}
                  className="flex-shrink-0 bg-primary-700/50 rounded-lg p-3 text-center min-w-[80px]"
                >
                  <IconComponent
                    className="text-accent-400 mx-auto mb-1"
                    size={20}
                  />
                  <p className="text-xs font-medium">{badge.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="p-6">
        <div className="flex space-x-1 bg-primary-600 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === "progress"
                ? "bg-accent-500 text-white"
                : "text-gray-300 hover:text-white hover:bg-primary-500"
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === "completed"
                ? "bg-accent-500 text-white"
                : "text-gray-300 hover:text-white hover:bg-primary-500"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab("teaching")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === "teaching"
                ? "bg-accent-500 text-white"
                : "text-gray-300 hover:text-white hover:bg-primary-500"
            }`}
          >
            Teaching
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === "progress" && (
            <>
              {ongoingCourses.length > 0 ? (
                ongoingCourses.map((course) => (
                  <CourseCard key={course.id} course={course} showProgress />
                ))
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="text-gray-500 mx-auto mb-4" size={48} />
                  <p className="text-gray-400">No courses in progress</p>
                </div>
              )}
            </>
          )}

          {activeTab === "completed" && (
            <>
              {completedCourses.length > 0 ? (
                completedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} completed />
                ))
              ) : (
                <div className="text-center py-12">
                  <GraduationCap
                    className="text-gray-500 mx-auto mb-4"
                    size={48}
                  />
                  <p className="text-gray-400">No completed courses yet</p>
                </div>
              )}
            </>
          )}

          {activeTab === "teaching" && (
            <>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    Your Courses
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Plus size={18} />
                    <span>Create Course</span>
                  </button>
                </div>

                {teachingCourses.length > 0 ? (
                  teachingCourses.map((course: Course) => (
                    <CourseCard key={course.id} course={course} isTeaching />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Sparkles
                      className="text-gray-500 mx-auto mb-4"
                      size={48}
                    />
                    <p className="text-gray-400">
                      You're not teaching any courses yet
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-4 bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus size={18} />
                      <span>Create Your First Course</span>
                    </button>
                  </div>
                )}

                {showCreateModal && (
                  <CreateCourseModal
                    onClose={async () => {
                      setShowCreateModal(false);
                      // Refresh the courses list after creating a new course
                      if (user?.id) {
                        const teachingCourses = await getUserCourses(user.id);
                        setUserTeachingCourses(teachingCourses);
                      }
                    }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCoursesPage;
