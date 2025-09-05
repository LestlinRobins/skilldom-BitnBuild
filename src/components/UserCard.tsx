import React, { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="group bg-primary-800/80 backdrop-blur-lg border border-primary-700 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-400/50 hover:shadow-2xl hover:shadow-accent-500/10">
        <div className="flex items-start space-x-4">
          <div className="relative flex-shrink-0">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-primary-600 group-hover:border-accent-400 transition-colors duration-300"
            />
            <div className="absolute -top-1 -right-1">
              <VerificationIcon status={user.verification_status} />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-white">{user.name}</h3>
              <div className="flex items-center space-x-1 bg-primary-700/50 px-2 py-1 rounded-full">
                <Star className="text-yellow-400 fill-current" size={14} />
                <span className="text-sm font-bold text-white">{user.rating}</span>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-3 line-clamp-2 h-10">
              {user.bio}
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {user.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="bg-accent-500/20 text-accent-300 px-2.5 py-1 rounded-full text-xs font-semibold"
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
              <button
                onClick={() => navigate(`/user/${user.id}`)}
                className="flex-1 bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2.5 px-3 rounded-lg transition-all duration-300 shadow-md shadow-accent-500/20 transform hover:scale-105"
              >
                View Profile
              </button>
              <button
                onClick={() => setShowMessageModal(true)}
                className="bg-primary-600 hover:bg-primary-500 text-white font-medium p-2.5 rounded-lg transition-colors"
                title="Send Message"
              >
                <MessageSquare size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

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