import React, { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import MessageModal from "./MessageModal";
import { VerificationIcon } from "./VerificationBadge";

interface User {
  id: string;
  name: string;
  avatarUrl: string;
  skills: string[];
  bio: string;
  rating: number;
  reviews: any[];
  skillCoins: number;
  verification_status?: "pending" | "verified" | "failed" | "not_started";
  skills_verified?: boolean;
}

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const [showMessageModal, setShowMessageModal] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="bg-primary-800 rounded-xl p-4 hover:bg-primary-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-accent-400"
            />
            <div className="absolute -top-1 -right-1">
              <VerificationIcon status={user.verification_status} />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-bold text-white">{user.name}</h3>
              <div className="flex items-center space-x-1">
                <Star className="text-yellow-400 fill-current" size={14} />
                <span className="text-sm text-gray-400">{user.rating}</span>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
              {user.bio}
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-1 mb-3">
              {user.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="bg-accent-500/20 text-accent-300 px-2 py-1 rounded text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {user.skills.length > 3 && (
                <span className="text-xs text-gray-400 px-2 py-1">
                  +{user.skills.length - 3} more
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button className="flex-1 bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm">
                View Profile
              </button>
              <button
                onClick={() => setShowMessageModal(true)}
                className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-3 rounded-lg transition-colors"
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <MessageModal
          onClose={() => setShowMessageModal(false)}
          recipient={user.name}
        />
      )}
    </>
  );
};

export default UserCard;
