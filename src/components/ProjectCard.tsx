import React, { useState } from "react";
import { Users, CheckCircle, Clock, Calendar, Star } from "lucide-react";
import { users } from "../data/mockData";
import { Project, joinProject, leaveProject } from "../services/projectService";
import { useAuth } from "../contexts/AuthContext";

interface ProjectCardProps {
  project: Project;
  showStatus?: boolean;
  onProjectUpdate?: (updatedProject: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  showStatus = false,
  onProjectUpdate,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Get member details from users data (for display purposes)
  const members = users.filter((u: any) =>
    project.current_members.includes(u.id)
  );

  const isCreator = user?.id === project.creator_id;
  const isMember = user?.id ? project.current_members.includes(user.id) : false;
  const canJoin =
    !isMember &&
    project.current_members.length < project.max_members &&
    project.status === "open";

  const statusConfig = {
    open: { color: "text-blue-400", bg: "bg-blue-500/20", icon: Users },
    "in-progress": {
      color: "text-warning-400",
      bg: "bg-warning-500/20",
      icon: Clock,
    },
    completed: {
      color: "text-success-400",
      bg: "bg-success-500/20",
      icon: CheckCircle,
    },
    paused: { color: "text-gray-400", bg: "bg-gray-500/20", icon: Clock },
  };

  const difficultyConfig = {
    beginner: { color: "text-green-400", bg: "bg-green-500/20" },
    intermediate: { color: "text-yellow-400", bg: "bg-yellow-500/20" },
    advanced: { color: "text-red-400", bg: "bg-red-500/20" },
  };

  const config = statusConfig[project.status];
  const diffConfig = difficultyConfig[project.difficulty_level];
  const StatusIcon = config.icon;

  const handleJoinProject = async () => {
    if (!user || !canJoin) return;

    setIsLoading(true);
    try {
      const updatedProject = await joinProject(project.id, user.id);
      onProjectUpdate?.(updatedProject);

      // Show success toast
      const toast = document.createElement("div");
      toast.className =
        "fixed top-4 left-1/2 transform -translate-x-1/2 bg-success-500 text-white px-4 py-2 rounded-lg z-50 animate-fade-in";
      toast.textContent = "Successfully joined the project!";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error("Error joining project:", error);
      alert("Failed to join project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveProject = async () => {
    if (!user || !isMember || isCreator) return;

    if (!confirm("Are you sure you want to leave this project?")) return;

    setIsLoading(true);
    try {
      const updatedProject = await leaveProject(project.id, user.id);
      onProjectUpdate?.(updatedProject);

      // Show success toast
      const toast = document.createElement("div");
      toast.className =
        "fixed top-4 left-1/2 transform -translate-x-1/2 bg-warning-500 text-white px-4 py-2 rounded-lg z-50 animate-fade-in";
      toast.textContent = "Left the project successfully.";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error("Error leaving project:", error);
      alert("Failed to leave project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-primary-800 rounded-xl p-6 hover:bg-primary-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white">{project.title}</h3>
            {project.category && (
              <span className="text-xs bg-primary-600 text-gray-300 px-2 py-1 rounded">
                {project.category}
              </span>
            )}
          </div>
          <p className="text-gray-300 text-sm line-clamp-2 mb-2">
            {project.description}
          </p>

          {/* Project metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            {project.estimated_duration && (
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{project.estimated_duration}</span>
              </div>
            )}
            {project.deadline && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>Due {formatDate(project.deadline)}</span>
              </div>
            )}
            <div
              className={`flex items-center gap-1 ${diffConfig.bg} px-2 py-1 rounded`}
            >
              <Star size={12} className={diffConfig.color} />
              <span className={`${diffConfig.color} capitalize`}>
                {project.difficulty_level}
              </span>
            </div>
          </div>
        </div>

        {showStatus && (
          <div
            className={`flex items-center space-x-1 ${config.bg} px-2 py-1 rounded-full`}
          >
            <StatusIcon size={14} className={config.color} />
            <span className={`text-xs font-medium ${config.color} capitalize`}>
              {project.status.replace("-", " ")}
            </span>
          </div>
        )}
      </div>

      {/* Required Skills */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-2">Required Skills:</p>
        <div className="flex flex-wrap gap-2">
          {project.required_skills.map((skill, index) => (
            <span
              key={index}
              className="bg-accent-500/20 text-accent-300 px-2 py-1 rounded text-xs font-medium border border-accent-500/30"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Tags:</p>
          <div className="flex flex-wrap gap-1">
            {project.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-primary-600 text-gray-300 px-2 py-1 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Members and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {members.slice(0, 3).map((member: any) => (
              <img
                key={member.id}
                src={member.avatarUrl}
                alt={member.name}
                className="w-8 h-8 rounded-full border-2 border-primary-800 object-cover"
                title={member.name}
              />
            ))}
            {project.current_members.length > 3 && (
              <div className="w-8 h-8 bg-primary-600 rounded-full border-2 border-primary-800 flex items-center justify-center">
                <span className="text-xs text-gray-300">
                  +{project.current_members.length - 3}
                </span>
              </div>
            )}
          </div>
          <span className="text-sm text-gray-400">
            {project.current_members.length}/{project.max_members} members
          </span>
        </div>

        <div className="flex gap-2">
          {canJoin && (
            <button
              onClick={handleJoinProject}
              disabled={isLoading}
              className="bg-accent-500 hover:bg-accent-600 disabled:bg-accent-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-1"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Join Project"
              )}
            </button>
          )}

          {isMember && !isCreator && (
            <button
              onClick={handleLeaveProject}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 disabled:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Leave
            </button>
          )}

          {isMember && (
            <button className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
              View Details
            </button>
          )}

          {!isMember && !canJoin && (
            <button
              disabled
              className="bg-gray-600 text-gray-400 font-medium py-2 px-4 rounded-lg text-sm cursor-not-allowed"
            >
              {project.status === "open" ? "Team Full" : "View Details"}
            </button>
          )}
        </div>
      </div>

      {/* Gallery Preview */}
      {project.gallery_images && project.gallery_images.length > 0 && (
        <div className="mt-4 pt-4 border-t border-primary-600">
          <p className="text-sm text-gray-400 mb-2">Project Gallery:</p>
          <div className="grid grid-cols-3 gap-2">
            {project.gallery_images.slice(0, 3).map((imageUrl, index) => (
              <div key={index} className="h-16 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                />
              </div>
            ))}
            {project.gallery_images.length > 3 && (
              <div className="h-16 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-300">
                  +{project.gallery_images.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Goals Preview */}
      {project.project_goals && project.project_goals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-primary-600">
          <p className="text-sm text-gray-400 mb-2">Goals:</p>
          <ul className="text-xs text-gray-300 space-y-1">
            {project.project_goals.slice(0, 2).map((goal, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1 h-1 bg-accent-400 rounded-full mt-2 flex-shrink-0" />
                <span className="line-clamp-1">{goal}</span>
              </li>
            ))}
            {project.project_goals.length > 2 && (
              <li className="text-gray-400">
                +{project.project_goals.length - 2} more goals...
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
