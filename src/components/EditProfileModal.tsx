import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/supabaseService';
import Toast from './Toast';

interface EditProfileModalProps {
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills.join(', ') || '',
    linkedin_url: user?.linkedin_url || '',
    github_url: user?.github_url || '',
    portfolio_url: user?.portfolio_url || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setError('');
    
    try {
      // Validate URLs before submitting
      validateUrls();
      
      // Parse skills from comma-separated string
      const skillsArray = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      // Update profile in Supabase
      await updateUserProfile(user.id, {
        name: formData.name,
        bio: formData.bio || null,
        skills: skillsArray,
        linkedin_url: formData.linkedin_url || null,
        github_url: formData.github_url || null,
        portfolio_url: formData.portfolio_url || null,
        updated_at: new Date().toISOString()
      });

      // Update user context with new data
      updateUser({
        ...user,
        name: formData.name,
        bio: formData.bio,
        skills: skillsArray,
        linkedin_url: formData.linkedin_url || null,
        github_url: formData.github_url || null,
        portfolio_url: formData.portfolio_url || null,
        updatedAt: new Date()
      });

      // Show success feedback
      setShowSuccessToast(true);
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateUrls = () => {
    const urlFields = ['linkedin_url', 'github_url', 'portfolio_url'] as const;
    
    for (const field of urlFields) {
      const value = formData[field];
      if (value && value.trim()) {
        try {
          new URL(value);
        } catch {
          const fieldNames = {
            linkedin_url: 'LinkedIn URL',
            github_url: 'GitHub URL', 
            portfolio_url: 'Portfolio URL'
          };
          throw new Error(`Please enter a valid ${fieldNames[field]}`);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
              required
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors resize-none"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Skills
            </label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors resize-none"
              placeholder="Separate skills with commas (e.g., React, Node.js, Python)"
              disabled={isSaving}
            />
          </div>

          {/* Professional Links Section */}
          <div className="border-t border-primary-600 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">Professional Links</h3>
              {user?.skills_verified && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  ✓ Verified
                </span>
              )}
            </div>
            
            {user?.skills_verified && (
              <p className="text-xs text-gray-400 mb-3">
                Updating your professional links may affect your verification status.
              </p>
            )}
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-primary-600 border border-primary-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors text-sm"
                  placeholder="https://linkedin.com/in/yourname"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-primary-600 border border-primary-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors text-sm"
                  placeholder="https://github.com/yourusername"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Portfolio Website
                </label>
                <input
                  type="url"
                  name="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-primary-600 border border-primary-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors text-sm"
                  placeholder="https://yourportfolio.com"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-accent-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </form>
        
        {/* Success Toast */}
        {showSuccessToast && (
          <Toast
            message="Profile updated successfully!"
            type="success"
            onClose={() => setShowSuccessToast(false)}
          />
        )}
      </div>
    </div>
  );
};

export default EditProfileModal;