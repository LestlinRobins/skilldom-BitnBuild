import React, { useState } from "react";
import { X, Star, MessageSquare, Send } from "lucide-react";
import type { Course } from "../services/courseService";

interface ReviewModalProps {
  course: Course;
  teacherName?: string;
  onClose: () => void;
  onReviewSubmit: (
    courseId: string,
    teacherId: string,
    rating: number,
    comment: string
  ) => void;
  existingReview?: {
    rating: number;
    comment: string;
  } | null;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  course,
  teacherName,
  onClose,
  onReviewSubmit,
  existingReview,
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await onReviewSubmit(course.id, course.teacher_id, rating, comment);
      onClose();
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-primary-800 rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary-800">
          <div>
            <h2 className="text-xl font-bold text-white">
              {existingReview ? "Update Review" : "Rate Your Experience"}
            </h2>
            <p className="text-primary-300 text-sm mt-1">
              How was "{course.title}"?
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-primary-400 hover:text-primary-200 p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Teacher Info */}
          {teacherName && (
            <div className="text-center">
              <p className="text-primary-300 text-sm">
                Taught by{" "}
                <span className="text-white font-medium">{teacherName}</span>
              </p>
            </div>
          )}

          {/* Rating Stars */}
          <div className="text-center">
            <p className="text-white font-medium mb-3">Rate this course:</p>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-colors"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoveredRating || rating)
                        ? "text-warning-400 fill-current"
                        : "text-primary-600"
                    } hover:text-warning-300`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-primary-300 mt-2">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-primary-300 mb-2">
              <MessageSquare className="w-4 h-4" />
              Share your feedback (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like about this course? Any suggestions for improvement?"
              className="w-full px-3 py-3 bg-primary-900 border border-primary-700 rounded-md text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent h-24 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-primary-400 mt-1">
              {comment.length}/500 characters
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-primary-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-primary-400 hover:text-primary-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="px-6 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} />
                {existingReview ? "Update Review" : "Submit Review"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
