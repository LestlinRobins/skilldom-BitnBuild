import React, { useState } from "react";
import { Users, CheckCircle, Clock, Calendar, Star, Plus } from "lucide-react";
import { users } from "../data/mockData";
import { Project, joinProject, leaveProject } from "../services/projectService";
import { useAuth } from "../contexts/AuthContext";
import ProjectDetailsModal from "./ProjectDetailsModal";

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
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Get member details from users data (for display purposes)
  const members = users.filter((u: any) =>
    project.current_members.includes(u.id)
  );

  const isCreator = user?.id === project.creator_id;
  const isMember = user?.id ? project.current_members.includes(user.id) : false;
  const canJoin =
    !isMember &&
    project.current_members.length < project.max_members &&
    (project.status === "open" || project.status === "in-progress");

  // *** FIX STARTS HERE: These configurations were missing ***
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

  const diffConfig = difficultyConfig[project.difficulty_level];
  // *** FIX ENDS HERE ***

  const handleJoinProject = async () => {
    if (!user || !canJoin) return;

    setIsLoading(true);
    try {
      const updatedProject = await joinProject(project.id, user.id);
      onProjectUpdate?.(updatedProject);
    } catch (error) {
      console.error("Error joining project:", error);
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
    } catch (error) {
      console.error("Error leaving project:", error);
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
    <div className="group bg-primary-800/80 backdrop-blur-lg border border-primary-700 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-400/50 hover:shadow-2xl hover:shadow-accent-500/10">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <span className="text-xs font-semibold bg-primary-700 text-gray-300 px-2.5 py-1 rounded-full inline-block mb-2">
            {project.category}
          </span>
          <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
          <p className="text-gray-300 text-sm line-clamp-2 h-10 mb-3">
            {project.description}
          </p>

          {/* Project metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300">
            <div
              className={`flex items-center gap-1.5 ${diffConfig.bg} px-2 py-1 rounded-full`}
            >
              <Star size={14} className={diffConfig.color} />
              <span className={`${diffConfig.color} font-semibold capitalize`}>
                {project.difficulty_level}
              </span>
            </div>
            {project.estimated_duration && (
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>{project.estimated_duration}</span>
              </div>
            )}
            {project.deadline && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>Due {formatDate(project.deadline)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Required Skills */}
      <div className="mb-4 pt-4 border-t border-primary-700">
        <h4 className="text-sm font-semibold text-gray-200 mb-2">
          Required Skills
        </h4>
        <div className="flex flex-wrap gap-2">
          {project.required_skills.map((skill, index) => (
            <span
              key={index}
              className="bg-accent-500/20 text-accent-300 px-2.5 py-1 rounded-full text-xs font-semibold"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Members and Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-primary-700">
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-3">
            {members.slice(0, 3).map((member: any) => (
              <img
                key={member.id}
                src={member.avatarUrl}
                alt={member.name}
                className="w-9 h-9 rounded-full border-2 border-primary-700 object-cover"
                title={member.name}
              />
            ))}
            {project.current_members.length > 3 && (
              <div className="w-9 h-9 bg-primary-600 rounded-full border-2 border-primary-700 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-300">
                  +{project.current_members.length - 3}
                </span>
              </div>
            )}
          </div>
          <span className="text-sm font-semibold text-gray-300">
            {project.current_members.length} / {project.max_members}
            <span className="font-normal text-gray-400"> members</span>
          </span>
        </div>

        <div className="flex gap-2">
          {canJoin && (
            <>
              <button
                onClick={handleJoinProject}
                disabled={isLoading}
                className="bg-accent-500 hover:bg-accent-600 disabled:bg-accent-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm flex items-center gap-2 shadow-md shadow-accent-500/20"
              >
                <Plus size={16} />
                {isLoading ? "Joining..." : "Join"}
              </button>
              <button
                onClick={() => setShowDetailsModal(true)}
                className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Details
              </button>
            </>
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
            <button
              onClick={() => setShowDetailsModal(true)}
              className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              View Details
            </button>
          )}

          {!isMember && !canJoin && (
            <button
              onClick={() => setShowDetailsModal(true)}
              className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              View Details
            </button>
          )}
        </div>
      </div>

      {/* Project Details Modal */}
      {showDetailsModal && (
        <ProjectDetailsModal
          project={project}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

export default ProjectCard;
