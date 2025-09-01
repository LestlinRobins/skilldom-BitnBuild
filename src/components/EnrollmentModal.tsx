import React, { useState } from "react";
import { X, Play, Coins, Clock, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

import type { Course } from '../services/courseService';

interface EnrollmentModalProps {
  course: Course;
  onClose: () => void;
  onConfirm: () => void;
}

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  course,
  onClose,
  onConfirm,
}) => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { user } = useAuth();

  const hasEnoughCoins = user ? user.skillCoins >= course.svc_value : false;

  const handleEnroll = async () => {
    if (!hasEnoughCoins) return;

    setIsEnrolling(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Enrollment failed:", error);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-800 rounded-xl max-w-md w-full p-6 animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white">Enroll in Course</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Course Info */}
        <div className="mb-6">
          {course.image_url && (
            <img
              src={course.image_url}
              alt={course.title}
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
          )}

          <h3 className="text-lg font-semibold text-white mb-2">
            {course.title}
          </h3>
          <p className="text-gray-300 text-sm mb-4 line-clamp-3">
            {course.description}
          </p>

          {/* Course Details */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center space-x-2">
              <Clock size={16} />
              <span>{course.duration} minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users size={16} />
              <span>{course.learners.length} enrolled</span>
            </div>
          </div>
        </div>

        {/* Cost & Balance */}
        <div className="bg-primary-700 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Course Cost:</span>
            <div className="flex items-center space-x-1 text-accent-400 font-bold">
              <Coins size={16} />
              <span>{course.svc_value} SVC</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Your Balance:</span>
            <div className="flex items-center space-x-1 text-white font-medium">
              <Coins size={16} />
              <span>{user?.skillCoins || 0} SVC</span>
            </div>
          </div>

          <hr className="border-primary-600 my-2" />

          <div className="flex justify-between items-center">
            <span className="text-gray-300">After Enrollment:</span>
            <div
              className={`flex items-center space-x-1 font-bold ${
                hasEnoughCoins ? "text-success-400" : "text-red-400"
              }`}
            >
              <Coins size={16} />
              <span>{(user?.skillCoins || 0) - course.svc_value} SVC</span>
            </div>
          </div>
        </div>

        {/* Insufficient Funds Warning */}
        {!hasEnoughCoins && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">
              Insufficient SVC coins. You need{" "}
              {course.svc_value - (user?.skillCoins || 0)} more SVC to enroll in
              this course.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleEnroll}
            disabled={!hasEnoughCoins || isEnrolling}
            className={`flex-1 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              hasEnoughCoins && !isEnrolling
                ? "bg-accent-500 hover:bg-accent-600 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isEnrolling ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Enrolling...</span>
              </>
            ) : (
              <>
                <Play size={18} />
                <span>Confirm Enrollment</span>
              </>
            )}
          </button>
        </div>

        {/* Success Benefits */}
        {hasEnoughCoins && (
          <div className="mt-4 text-center">
            <p className="text-green-400 text-sm">
              ✨ Unlock new skills and earn more SVC upon completion!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentModal;
