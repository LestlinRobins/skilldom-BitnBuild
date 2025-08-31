import React, { useState } from "react";
import { Clock, Users, Star, Play, CheckCircle, Languages } from "lucide-react";
import { users } from "../data/mockData";
// @ts-ignore - Mock data file is JavaScript
import { useAuth } from "../contexts/AuthContext";
import { useCourseEnrollment } from "../hooks/useSupabase";
import BlockchainModal from "./BlockchainModal";
import EnrollmentModal from "./EnrollmentModal";

interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  skillCategory: string;
  svcValue: number;
  duration: number;
  availability: string[];
  learners: string[];
  imageUrl?: string;
}

interface CourseCardProps {
  course: Course;
  showProgress?: boolean;
  completed?: boolean;
  isTeaching?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  showProgress = false,
  completed = false,
  isTeaching = false,
}) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [showBlockchain, setShowBlockchain] = useState(false);
  const [showEnrollment, setShowEnrollment] = useState(false);

  const { user, updateUser } = useAuth();
  const { enrollInCourse, completeCourse } = useCourseEnrollment();

  const teacher = users.find((u: any) => u.id === course.teacherId);
  const progress = showProgress ? Math.floor(Math.random() * 80) + 20 : 0;

  const handleCompleteSession = async () => {
    if (!user) return;

    try {
      const result = await completeCourse(course.id, 100); // 100 SVC reward
      if (result.success && result.user) {
        updateUser(result.user);
        setShowBlockchain(true);
      }
    } catch (error) {
      console.error("Failed to complete course:", error);
    }
  };

  const handleEnrollClick = () => {
    setShowEnrollment(true);
  };

  const handleEnrollConfirm = async () => {
    if (!user) return;

    try {
      const result = await enrollInCourse(course.id, course.svcValue);
      if (result.success && result.user) {
        updateUser(result.user);

        // Show success notification
        const toast = document.createElement("div");
        toast.className =
          "fixed top-4 left-1/2 transform -translate-x-1/2 bg-success-500 text-white px-6 py-3 rounded-lg z-50 animate-fade-in";
        toast.textContent = `Successfully enrolled in ${course.title}!`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      }
    } catch (error) {
      console.error("Enrollment failed:", error);
      // Error handling is done in the hook
    }
  };

  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
    // Show toast notification
    const toast = document.createElement("div");
    toast.className =
      "fixed top-4 left-1/2 transform -translate-x-1/2 bg-accent-500 text-white px-4 py-2 rounded-lg z-50 animate-fade-in";
    toast.textContent = showTranslation
      ? "Live translation disabled"
      : "Live translation enabled (simulation)";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <>
      <div className="bg-primary-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {course.imageUrl && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={course.imageUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 flex space-x-2">
              <button
                onClick={toggleTranslation}
                className={`p-2 rounded-full transition-colors ${
                  showTranslation
                    ? "bg-accent-500 text-white"
                    : "bg-black/50 text-white hover:bg-accent-500"
                }`}
              >
                <Languages size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                {course.title}
              </h3>
              <p className="text-sm text-gray-400">{course.skillCategory}</p>
            </div>
            <div className="text-right ml-4">
              <p className="text-accent-400 font-bold">{course.svcValue} SVC</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>

          {/* Progress Bar (if applicable) */}
          {showProgress && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-primary-600 rounded-full h-2">
                <div
                  className="bg-accent-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Teacher Info */}
          {teacher && (
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={teacher.avatarUrl}
                alt={teacher.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium text-white">{teacher.name}</p>
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-400 fill-current" size={12} />
                  <span className="text-xs text-gray-400">
                    {teacher.rating}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{course.duration} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users size={14} />
              <span>{course.learners.length} learners</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex space-x-2">
            {completed ? (
              <button className="flex-1 bg-success-500 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
                <CheckCircle size={18} />
                <span>Completed</span>
              </button>
            ) : showProgress ? (
              <>
                <button className="flex-1 bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <Play size={18} />
                  <span>Continue</span>
                </button>
                <button
                  onClick={handleCompleteSession}
                  className="bg-success-500 hover:bg-success-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Complete
                </button>
              </>
            ) : isTeaching ? (
              <button className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                <Users size={18} />
                <span>Manage Course</span>
              </button>
            ) : (
              <button
                onClick={handleEnrollClick}
                className="flex-1 bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Play size={18} />
                <span>Enroll</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Blockchain Modal */}
      {showBlockchain && (
        <BlockchainModal onClose={() => setShowBlockchain(false)} />
      )}

      {/* Enrollment Modal */}
      {showEnrollment && (
        <EnrollmentModal
          course={course}
          onClose={() => setShowEnrollment(false)}
          onConfirm={handleEnrollConfirm}
        />
      )}
    </>
  );
};

export default CourseCard;
