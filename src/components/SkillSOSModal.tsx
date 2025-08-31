import React, { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

interface SkillSOSModalProps {
  onClose: () => void;
}

const SkillSOSModal: React.FC<SkillSOSModalProps> = ({ onClose }) => {
  const [request, setRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    onClose();
    
    // Show success toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-success-500 text-white px-4 py-2 rounded-lg z-50 animate-fade-in';
    toast.textContent = 'Skill SOS sent! Community members will respond soon.';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-800 rounded-xl w-full max-w-md p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
              <Sparkles className="text-white" size={16} />
            </div>
            <h2 className="text-xl font-bold text-white">Skill SOS</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What skill do you need help with?
            </label>
            <textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors resize-none"
              placeholder="Describe what you're struggling with or what you'd like to learn..."
              required
            />
          </div>

          <div className="mb-6">
            <p className="text-xs text-gray-400">
              Our AI will match you with community members who can help. Responses typically arrive within 15 minutes.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !request.trim()}
            className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-accent-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Sending SOS...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Send Skill SOS</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SkillSOSModal;