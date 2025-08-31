import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Edit, Shield, Star, MessageSquare, Settings, LogOut, Camera } from 'lucide-react';
import MessageModal from '../components/MessageModal';
import EditProfileModal from '../components/EditProfileModal';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-primary-700 text-white">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 p-6 rounded-b-3xl">
        <div className="flex items-start space-x-4 mb-6">
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-accent-400"
            />
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
              <Camera size={14} />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-xl font-bold">{user.name}</h1>
              <Shield className="text-accent-400" size={16} />
              <span className="text-xs text-accent-400 font-medium">AI Verified</span>
            </div>
            <div className="flex items-center space-x-1 mb-2">
              <Star className="text-yellow-400 fill-current" size={16} />
              <span className="text-sm font-medium">{user.rating}</span>
              <span className="text-sm text-gray-400">({user.reviews.length} reviews)</span>
            </div>
            <p className="text-gray-300 text-sm">{user.bio}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex-1 bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Edit size={18} />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => setShowMessageModal(true)}
            className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6 space-y-6">
        {/* Skill Coins */}
        <div className="bg-primary-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Skill Coins Balance</p>
              <p className="text-2xl font-bold text-accent-400">{user.skillCoins}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">This Month</p>
              <p className="text-lg font-semibold text-success-400">+350</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-lg font-bold mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills.map(skill => (
              <span
                key={skill}
                className="bg-accent-500/20 text-accent-300 px-3 py-1 rounded-full text-sm font-medium border border-accent-500/30"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Collaborations Gallery */}
        <div>
          <h3 className="text-lg font-bold mb-3">Collaboration Gallery</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary-800 rounded-lg p-4 text-center">
              <div className="w-full h-24 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-white font-bold">EcoTracker</span>
              </div>
              <p className="text-sm text-gray-300">Mobile App Project</p>
            </div>
            <div className="bg-primary-800 rounded-lg p-4 text-center">
              <div className="w-full h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-white font-bold">AI Recipe</span>
              </div>
              <p className="text-sm text-gray-300">ML Project</p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h3 className="text-lg font-bold mb-3">Recent Reviews</h3>
          <div className="space-y-3">
            {user.reviews.slice(0, 2).map(review => (
              <div key={review.id} className="bg-primary-800 rounded-xl p-4">
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-500'}
                    />
                  ))}
                </div>
                <p className="text-gray-300 text-sm mb-2">"{review.comment}"</p>
                <p className="text-gray-400 text-xs">- {review.reviewer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <button className="w-full bg-primary-800 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center space-x-3">
            <Settings size={20} />
            <span>Settings</span>
          </button>
          <button
            onClick={logout}
            className="w-full bg-error-500 hover:bg-error-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center space-x-3"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditProfileModal onClose={() => setShowEditModal(false)} />
      )}
      {showMessageModal && (
        <MessageModal onClose={() => setShowMessageModal(false)} />
      )}
    </div>
  );
};

export default ProfilePage;