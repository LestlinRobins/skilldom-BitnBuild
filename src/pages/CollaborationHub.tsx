import React, { useState } from 'react';
import { Plus, Users, Code, CheckCircle } from 'lucide-react';
import { projects } from '../data/mockData';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';

const CollaborationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'find' | 'start' | 'my'>('find');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const openProjects = projects.filter(p => p.status === 'open');
  const myProjects = projects; // In real app, filter by user ID

  const tabs = [
    { key: 'find', label: 'Find a Project', icon: Users },
    { key: 'start', label: 'Start a Project', icon: Plus },
    { key: 'my', label: 'My Projects', icon: Code }
  ];

  return (
    <div className="min-h-screen bg-primary-700 text-white">
      {/* Header */}
      <div className="bg-primary-800 p-6">
        <h1 className="text-2xl font-bold mb-6">Creative Collaboration Hub</h1>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-primary-600 rounded-lg p-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-colors ${
                activeTab === key
                  ? 'bg-accent-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-primary-500'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'find' && (
          <div className="space-y-4">
            <p className="text-gray-300">Discover exciting projects looking for collaborators</p>
            <div className="grid grid-cols-1 gap-4">
              {openProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'start' && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-500 rounded-full mb-4">
              <Plus className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-bold mb-2">Start Your Project</h2>
            <p className="text-gray-400 mb-6">Share your idea and find skilled collaborators</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Create New Project
            </button>
          </div>
        )}

        {activeTab === 'my' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-300">Your collaborative projects</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                  <span className="text-sm text-gray-400">In Progress</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                  <span className="text-sm text-gray-400">Completed</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {myProjects.map(project => (
                <ProjectCard key={project.id} project={project} showStatus />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default CollaborationHub;