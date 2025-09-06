import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useUserOperations } from "../hooks/useUserOperations";
import { getUserReviews } from "../services/supabaseService";
import { Star, MessageSquare, ArrowLeft, Camera } from "lucide-react";
import MessageModal from "../components/MessageModal";
import VerificationBadge from "../components/VerificationBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { users as mockUsers } from "../data/mockData";

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { getUser, isLoading } = useUserOperations();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) return;

      try {
        // First try to get from Supabase
        const supabaseUser = await getUser(userId);

        if (supabaseUser) {
          // Fetch user reviews
          const reviews = await getUserReviews(userId);

          // Calculate average rating from reviews
          const averageRating =
            reviews.length > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                reviews.length
              : null;

          // Transform Supabase user to match our interface
          const transformedUser = {
            id: supabaseUser.id,
            name: supabaseUser.name || "Unknown User",
            avatarUrl:
              supabaseUser.avatar_url ||
              "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
            bio: supabaseUser.bio || "No bio available",
            skills: supabaseUser.skills || [],
            rating: averageRating ? parseFloat(averageRating.toFixed(1)) : null,
            reviews: reviews,
            skillCoins: supabaseUser.skill_coins || 0,
            verification_status: supabaseUser.verification_status,
            professionalLinks: {
              linkedin: supabaseUser.linkedin_url,
              github: supabaseUser.github_url,
              portfolio: supabaseUser.portfolio_url,
            },
          };
          setProfileUser(transformedUser);
        } else {
          // Fallback to mock data
          const mockUser = mockUsers.find((u: any) => u.id === userId);
          if (mockUser) {
            setProfileUser(mockUser);
          } else {
            setError("User not found");
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        // Fallback to mock data
        const mockUser = mockUsers.find((u: any) => u.id === userId);
        if (mockUser) {
          setProfileUser(mockUser);
        } else {
          setError("Failed to load user profile");
        }
      }
    };

    loadUser();
  }, [userId, getUser]);

  const isCurrentUser = currentUser?.id === userId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-700 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-primary-700 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">User Not Found</h2>
          <p className="text-gray-400 mb-4">
            {error || "The user you are looking for does not exist."}
          </p>
          <button
            onClick={() => navigate("/search")}
            className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-700 text-white">
      {/* Header with Back Button */}
      <div className="bg-primary-800 p-4 flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-primary-600 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">
          {isCurrentUser ? "Your Profile" : `${profileUser.name}'s Profile`}
        </h1>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 p-6 rounded-b-3xl">
        <div className="flex items-start space-x-4 mb-6">
          <div className="relative">
            <img
              src={profileUser.avatarUrl}
              alt={profileUser.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-accent-400"
            />
            {isCurrentUser && (
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
                <Camera size={14} />
              </button>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-xl font-bold">{profileUser.name}</h1>
              <VerificationBadge
                status={profileUser.verification_status}
                className="text-xs"
              />
            </div>
            <div className="flex items-center space-x-1 mb-2">
              <Star className="text-yellow-400 fill-current" size={16} />
              <span className="text-sm font-medium">
                {profileUser.rating ? profileUser.rating : "No rating yet"}
              </span>
              <span className="text-sm text-gray-400">
                ({profileUser.reviews?.length || 0} reviews)
              </span>
            </div>
            <p className="text-gray-300 text-sm">{profileUser.bio}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {isCurrentUser ? (
            <button
              onClick={() => navigate("/profile")}
              className="flex-1 bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>Go to Full Profile</span>
            </button>
          ) : (
            <button
              onClick={() => setShowMessageModal(true)}
              className="flex-1 bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <MessageSquare size={18} />
              <span>Send Message</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6 space-y-6">
        {/* Skill Coins */}
        <div className="bg-primary-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Skill Coins Balance</p>
              <p className="text-2xl font-bold text-accent-400">
                {profileUser.skillCoins || 0}
              </p>
            </div>
            {!isCurrentUser && (
              <div className="text-right">
                <p className="text-gray-400 text-sm">Public Profile</p>
                <p className="text-lg font-semibold text-success-400">Active</p>
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-lg font-bold mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profileUser.skills?.map((skill: string) => (
              <span
                key={skill}
                className="bg-accent-500/20 text-accent-300 px-3 py-1 rounded-full text-sm font-medium border border-accent-500/30"
              >
                {skill}
              </span>
            ))}
            {(!profileUser.skills || profileUser.skills.length === 0) && (
              <p className="text-gray-400">No skills listed</p>
            )}
          </div>
        </div>

        {/* Professional Links */}
        {profileUser.professionalLinks &&
          Object.values(profileUser.professionalLinks).some(
            (link: any) => link
          ) && (
            <div>
              <h3 className="text-lg font-bold mb-3">Professional Links</h3>
              <div className="space-y-2">
                {profileUser.professionalLinks.linkedin && (
                  <a
                    href={profileUser.professionalLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-primary-800 p-3 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <span className="text-accent-400 font-medium">
                      LinkedIn
                    </span>
                  </a>
                )}
                {profileUser.professionalLinks.github && (
                  <a
                    href={profileUser.professionalLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-primary-800 p-3 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <span className="text-accent-400 font-medium">GitHub</span>
                  </a>
                )}
                {profileUser.professionalLinks.portfolio && (
                  <a
                    href={profileUser.professionalLinks.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-primary-800 p-3 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <span className="text-accent-400 font-medium">
                      Portfolio
                    </span>
                  </a>
                )}
              </div>
            </div>
          )}

        {/* Reviews */}
        <div>
          <h3 className="text-lg font-bold mb-3">Recent Reviews</h3>
          <div className="space-y-3">
            {profileUser.reviews?.slice(0, 2).map((review: any) => (
              <div key={review.id} className="bg-primary-800 rounded-xl p-4">
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < review.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-500"
                      }
                    />
                  ))}
                </div>
                <p className="text-gray-300 text-sm mb-2">"{review.comment}"</p>
                <p className="text-gray-400 text-xs">
                  - {review.reviewer?.name || review.reviewer}
                </p>
              </div>
            ))}
            {(!profileUser.reviews || profileUser.reviews.length === 0) && (
              <p className="text-gray-400">No reviews yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <MessageModal
          onClose={() => setShowMessageModal(false)}
          recipient={profileUser.name}
        />
      )}
    </div>
  );
};

export default UserProfilePage;
