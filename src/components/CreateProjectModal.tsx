import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { skillCategories } from '../data/mockData';

interface CreateProjectModalProps {
  onClose: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsCreating(false);
    onClose();
    
    // Show success toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-success-500 text-white px-4 py-2 rounded-lg z-50 animate-fade-in';
    toast.textContent = 'Project created successfully! Now visible to potential collaborators.';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-800 rounded-xl w-full max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
              placeholder="Enter project title"
              required
            />
          </div>

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
              placeholder="Describe your project and what you hope to achieve..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Required Skills
            </label>
            <input
              type="text"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
              placeholder="e.g., React, UI Design, Python"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Separate skills with commas
            </p>
          </div>

          {/* Suggested Skills */}
          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">Popular Skills:</p>
            <div className="flex flex-wrap gap-2">
              {skillCategories.slice(0, 6).map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => {
                    const skills = formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
                    if (!skills.includes(skill)) {
                      setFormData(prev => ({
                        ...prev,
                        requiredSkills: skills.length > 0 ? `${skills.join(', ')}, ${skill}` : skill
                      }));
                    }
                  }}
                  className="text-xs bg-primary-600 hover:bg-accent-500 text-gray-300 hover:text-white px-2 py-1 rounded transition-colors"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-accent-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Project...</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Create Project</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;