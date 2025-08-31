import React from 'react';
import { Users, Code, CheckCircle, Clock } from 'lucide-react';
import { users } from '../data/mockData';

interface Project {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  members: string[];
  status: 'open' | 'in-progress' | 'completed';
  gallery: string[];
}

interface ProjectCardProps {
  project: Project;
  showStatus?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, showStatus = false }) => {
  const members = users.filter(user => project.members.includes(user.id));
  
  const statusConfig = {
    open: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Users },
    'in-progress': { color: 'text-warning-400', bg: 'bg-warning-500/20', icon: Clock },
    completed: { color: 'text-success-400', bg: 'bg-success-500/20', icon: CheckCircle }
  };

  const config = statusConfig[project.status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-primary-800 rounded-xl p-6 hover:bg-primary-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">{project.title}</h3>
          <p className="text-gray-300 text-sm line-clamp-2">{project.description}</p>
        </div>
        {showStatus && (
          <div className={`flex items-center space-x-1 ${config.bg} px-2 py-1 rounded-full`}>
            <StatusIcon size={14} className={config.color} />
            <span className={`text-xs font-medium ${config.color} capitalize`}>
              {project.status.replace('-', ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Required Skills */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-2">Required Skills:</p>
        <div className="flex flex-wrap gap-2">
          {project.requiredSkills.map(skill => (
            <span
              key={skill}
              className="bg-accent-500/20 text-accent-300 px-2 py-1 rounded text-xs font-medium border border-accent-500/30"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Members */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {members.slice(0, 3).map(member => (
              <img
                key={member.id}
                src={member.avatarUrl}
                alt={member.name}
                className="w-8 h-8 rounded-full border-2 border-primary-800 object-cover"
              />
            ))}
            {members.length > 3 && (
              <div className="w-8 h-8 bg-primary-600 rounded-full border-2 border-primary-800 flex items-center justify-center">
                <span className="text-xs text-gray-300">+{members.length - 3}</span>
              </div>
            )}
          </div>
          <span className="text-sm text-gray-400">{members.length} members</span>
        </div>

        <button className="bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
          {project.status === 'open' ? 'Join Project' : 'View Details'}
        </button>
      </div>

      {/* Gallery Preview */}
      {project.gallery.length > 0 && (
        <div className="mt-4 pt-4 border-t border-primary-600">
          <p className="text-sm text-gray-400 mb-2">Project Gallery:</p>
          <div className="grid grid-cols-3 gap-2">
            {project.gallery.slice(0, 3).map((item, index) => (
              <div
                key={index}
                className="h-16 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg flex items-center justify-center"
              >
                <Code className="text-white" size={16} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;