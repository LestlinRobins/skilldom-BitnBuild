import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { skillCategories } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useCourseOperations } from '../hooks/useCourseOperations';

interface CreateCourseModalProps {
  onClose: () => void;
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { createCourse } = useCourseOperations();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillCategory: '',
    svcValue: 0,
    duration: 0,
    imageUrl: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      const courseData = {
        ...formData,
        teacherId: user?.id || '',
        learners: [],
        availability: ['online'], // Default to online
        created_at: new Date().toISOString(),
      };
      
      const result = await createCourse(courseData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-success-500 text-white px-4 py-2 rounded-lg z-50 animate-fade-in';
      toast.textContent = 'Course created successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
      
      onClose();
    } catch (error) {
      console.error('Failed to create course:', error);
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-error-500 text-white px-4 py-2 rounded-lg z-50 animate-fade-in';
      toast.textContent = 'Failed to create course. Please try again.';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'svcValue' || name === 'duration' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-800 rounded-xl w-full max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create New Course</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Course Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
              placeholder="Enter course title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors resize-none"
              placeholder="Describe your course and what students will learn..."
              required
            />
          </div>

          {/* Skill Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Skill Category
            </label>
            <select
              name="skillCategory"
              value={formData.skillCategory}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
              required
            >
              <option value="">Select a category</option>
              {skillCategories.map((category: string) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* SVC Value */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              SVC Value
            </label>
            <input
              type="number"
              name="svcValue"
              value={formData.svcValue}
              onChange={handleInputChange}
              min={0}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
              placeholder="Enter SVC value"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              The cost in SVC for students to enroll
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              min={1}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
              placeholder="Enter course duration in minutes"
              required
            />
          </div>

          {/* Course Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Course Image URL (optional)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
              placeholder="Enter image URL"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-accent-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Course...</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Create Course</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;
