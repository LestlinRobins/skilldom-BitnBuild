import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Users,
  Calendar,
  Clock,
  Star,
  ExternalLink,
  Image,
  FileText,
} from "lucide-react";
import { Project } from "../services/projectService";
import { User } from "../services/authService";
import { getUserProfile } from "../services/supabaseService";

interface ProjectDetailsModalProps {
  project: Project;
  onClose: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  onClose,
}) => {
  const [members, setMembers] = useState<User[]>([]);
  const [creator, setCreator] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch creator data
        if (project.creator_id) {
          const creatorData = await getUserProfile(project.creator_id);
          if (creatorData) {
            setCreator({
              id: creatorData.id,
              name: creatorData.name || "Unknown User",
              email: creatorData.email,
              avatarUrl:
                creatorData.avatar_url || "https://via.placeholder.com/40",
              skills: creatorData.skills || [],
              bio: creatorData.bio || "",
              rating: 0,
              reviews: [],
              skillCoins: 0,
              ongoingCourses: [],
              completedCourses: [],
              collaborations: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }

        // Fetch member data
        const memberPromises = project.current_members.map(async (memberId) => {
          const userData = await getUserProfile(memberId);
          if (userData) {
            return {
              id: userData.id,
              name: userData.name || "Unknown User",
              email: userData.email,
              avatarUrl:
                userData.avatar_url || "https://via.placeholder.com/40",
              skills: userData.skills || [],
              bio: userData.bio || "",
              rating: 0,
              reviews: [],
              skillCoins: 0,
              ongoingCourses: [],
              completedCourses: [],
              collaborations: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }
          return null;
        });

        const memberResults = await Promise.all(memberPromises);
        const validMembers = memberResults.filter(
          (member) => member !== null
        ) as User[];
        setMembers(validMembers);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [project.creator_id, project.current_members]);

  const statusConfig = {
    open: { color: "text-blue-400", bg: "bg-blue-500/20", label: "Open" },
    "in-progress": {
      color: "text-warning-400",
      bg: "bg-warning-500/20",
      label: "In Progress",
    },
    completed: {
      color: "text-success-400",
      bg: "bg-success-500/20",
      label: "Completed",
    },
    paused: { color: "text-gray-400", bg: "bg-gray-500/20", label: "Paused" },
  };

  const difficultyConfig = {
    beginner: {
      color: "text-green-400",
      bg: "bg-green-500/20",
      label: "Beginner",
    },
    intermediate: {
      color: "text-yellow-400",
      bg: "bg-yellow-500/20",
      label: "Intermediate",
    },
    advanced: { color: "text-red-400", bg: "bg-red-500/20", label: "Advanced" },
  };

  const modalContent = (
    <div className="modal-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-[99999] p-4 backdrop-blur-sm">
      <div className="bg-primary-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-primary-600 relative z-[100000]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary-600 sticky top-0 bg-primary-800 z-[100001] backdrop-blur-md shadow-md">
          <h2 className="text-2xl font-bold text-white">{project.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-600 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Meta Info */}
          <div className="flex flex-wrap gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusConfig[project.status].bg
              } ${statusConfig[project.status].color}`}
            >
              {statusConfig[project.status].label}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                difficultyConfig[project.difficulty_level].bg
              } ${difficultyConfig[project.difficulty_level].color}`}
            >
              {difficultyConfig[project.difficulty_level].label}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-600 text-gray-300">
              {project.category}
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              About This Project
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Project Goals */}
          {project.project_goals && project.project_goals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Project Goals
              </h3>
              <ul className="space-y-2">
                {project.project_goals.map((goal, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-2 text-gray-300"
                  >
                    <Star
                      size={16}
                      className="text-accent-400 mt-0.5 flex-shrink-0"
                    />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {project.requirements && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Requirements
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {project.requirements}
              </p>
            </div>
          )}

          {/* Required Skills */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.required_skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-accent-500/20 text-accent-300 px-3 py-1 rounded-full text-sm font-medium border border-accent-500/30"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary-600 text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Project Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users size={20} className="text-accent-400" />
                <span className="font-medium text-white">Team Size</span>
              </div>
              <p className="text-gray-300">
                {project.current_members.length} / {project.max_members} members
              </p>
            </div>

            <div className="bg-primary-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock size={20} className="text-accent-400" />
                <span className="font-medium text-white">Duration</span>
              </div>
              <p className="text-gray-300">{project.estimated_duration}</p>
            </div>

            {project.deadline && (
              <div className="bg-primary-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar size={20} className="text-accent-400" />
                  <span className="font-medium text-white">Deadline</span>
                </div>
                <p className="text-gray-300">
                  {new Date(project.deadline).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Team Members */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Team Members
            </h3>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-400"></div>
                <span className="ml-2 text-gray-400">
                  Loading team members...
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Creator */}
                {creator && (
                  <div className="flex items-center space-x-3 p-3 bg-primary-700 rounded-lg">
                    <img
                      src={creator.avatarUrl}
                      alt={creator.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">
                          {creator.name}
                        </span>
                        <span className="text-xs bg-accent-500 text-white px-2 py-1 rounded-full">
                          Creator
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{creator.bio}</p>
                    </div>
                  </div>
                )}

                {/* Other Members */}
                {members
                  .filter((member) => member.id !== project.creator_id)
                  .map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center space-x-3 p-3 bg-primary-700 rounded-lg"
                    >
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-white">
                          {member.name}
                        </span>
                        <p className="text-gray-400 text-sm">{member.bio}</p>
                      </div>
                    </div>
                  ))}

                {/* Show message if no members yet */}
                {!loading && members.length === 0 && (
                  <div className="text-center p-4 text-gray-400">
                    No team members yet. Be the first to join!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Project Links */}
          {project.project_links && project.project_links.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Project Links
              </h3>
              <div className="space-y-2">
                {project.project_links.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-accent-400 hover:text-accent-300 transition-colors"
                  >
                    <ExternalLink size={16} />
                    <span>{link}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Images */}
          {project.gallery_images && project.gallery_images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {project.gallery_images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Project gallery ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                      <Image
                        size={24}
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {project.contact_info && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Contact Information
              </h3>
              <p className="text-gray-300">{project.contact_info}</p>
            </div>
          )}

          {/* Media Files */}
          {project.media_files && project.media_files.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Project Files
              </h3>
              <div className="space-y-2">
                {project.media_files.map((file, index) => (
                  <a
                    key={index}
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-accent-400 hover:text-accent-300 transition-colors p-2 bg-primary-700 rounded-lg"
                  >
                    <FileText size={16} />
                    <span>Project File {index + 1}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProjectDetailsModal;
