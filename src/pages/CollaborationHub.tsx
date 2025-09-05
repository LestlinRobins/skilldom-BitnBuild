import React, { useState, useEffect } from "react";
import { Plus, Users, Code, Search, Filter, X, Target } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import CreateProjectModal from "../components/CreateProjectModal";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Project,
  getAllProjects,
  getUserProjects,
  searchProjects,
} from "../services/projectService";
import { useAuth } from "../contexts/AuthContext";

const CollaborationHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"find" | "start" | "my">("find");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "AI/ML",
    "Design",
    "Game Development",
    "Blockchain",
    "DevOps",
    "Other",
  ];

  const popularSkills = [
    "React",
    "Python",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "UI/UX Design",
    "Machine Learning",
    "AWS",
    "Docker",
    "GraphQL",
  ];

  const tabs = [
    { key: "find", label: "Find Projects", icon: Users },
    { key: "start", label: "Start Project", icon: Plus },
    { key: "my", label: "My Projects", icon: Code },
  ];

  useEffect(() => {
    if (activeTab === "find") {
      loadAllProjects();
    } else if (activeTab === "my" && user) {
      loadMyProjects();
    }
  }, [activeTab, user]);

  const loadAllProjects = async () => {
    setLoading(true);
    try {
      const allProjects = await getAllProjects(30);
      // Filter out user's own projects from find tab
      const filteredProjects = user
        ? allProjects.filter((p) => p.creator_id !== user.id)
        : allProjects;
      setProjects(filteredProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyProjects = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userProjects = await getUserProjects(user.id);
      setMyProjects(userProjects);
    } catch (error) {
      console.error("Error loading user projects:", error);
      setMyProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (
      !searchQuery.trim() &&
      !selectedCategory &&
      selectedSkills.length === 0
    ) {
      loadAllProjects();
      return;
    }

    setLoading(true);
    try {
      const results = await searchProjects(
        searchQuery,
        selectedCategory || undefined,
        selectedSkills.length > 0 ? selectedSkills : undefined
      );
      // Filter out user's own projects from search results
      const filteredResults = user
        ? results.filter((p) => p.creator_id !== user.id)
        : results;
      setProjects(filteredResults);
    } catch (error) {
      console.error("Error searching projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    setMyProjects((prev) => [newProject, ...prev]);
    setActiveTab("my");
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
    setMyProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
  };

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSkills([]);
    loadAllProjects();
  };

  // Get projects by status for My Projects tab
  const getProjectsByStatus = (status: string) => {
    return myProjects.filter((p) => p.status === status);
  };

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
                  ? "bg-accent-500 text-white"
                  : "text-gray-300 hover:text-white hover:bg-primary-500"
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
        {activeTab === "find" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-primary-800 rounded-lg p-4">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search projects by title, description, or tags..."
                    className="w-full pl-10 pr-4 py-2 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Search
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showFilters || selectedCategory || selectedSkills.length > 0
                      ? "bg-accent-500 text-white"
                      : "bg-primary-600 text-gray-300 hover:bg-primary-500"
                  }`}
                >
                  <Filter size={18} />
                  Filters
                </button>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="border-t border-primary-600 pt-4 space-y-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-primary-600 border border-primary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-400"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Skills Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {popularSkills.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => toggleSkillFilter(skill)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            selectedSkills.includes(skill)
                              ? "bg-accent-500 text-white"
                              : "bg-primary-600 text-gray-300 hover:bg-primary-500"
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSearch}
                      className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Apply Filters
                    </button>
                    <button
                      onClick={clearFilters}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}

              {/* Active Filters Display */}
              {(selectedCategory || selectedSkills.length > 0) && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-primary-600">
                  <span className="text-sm text-gray-400">Active filters:</span>
                  {selectedCategory && (
                    <span className="flex items-center gap-1 bg-accent-500/20 text-accent-300 px-2 py-1 rounded text-xs">
                      {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory("")}
                        className="hover:text-accent-100"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 bg-accent-500/20 text-accent-300 px-2 py-1 rounded text-xs"
                    >
                      {skill}
                      <button
                        onClick={() => toggleSkillFilter(skill)}
                        className="hover:text-accent-100"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Projects Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : projects.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-gray-300">
                    {projects.length} project{projects.length !== 1 ? "s" : ""}{" "}
                    found
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onProjectUpdate={handleProjectUpdate}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Target className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No Projects Found
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery || selectedCategory || selectedSkills.length > 0
                    ? "Try adjusting your search criteria or filters"
                    : "No projects are currently available for collaboration"}
                </p>
                {(searchQuery ||
                  selectedCategory ||
                  selectedSkills.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "start" && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-500 rounded-full mb-4">
              <Plus className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-bold mb-2">Start Your Project</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Share your idea and find skilled collaborators to bring your
              vision to life
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Create New Project
            </button>
          </div>
        )}

        {activeTab === "my" && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : myProjects.length > 0 ? (
              <>
                {/* Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    {
                      status: "open",
                      label: "Open",
                      color: "bg-blue-500",
                      count: getProjectsByStatus("open").length,
                    },
                    {
                      status: "in-progress",
                      label: "In Progress",
                      color: "bg-warning-500",
                      count: getProjectsByStatus("in-progress").length,
                    },
                    {
                      status: "completed",
                      label: "Completed",
                      color: "bg-success-500",
                      count: getProjectsByStatus("completed").length,
                    },
                    {
                      status: "paused",
                      label: "Paused",
                      color: "bg-gray-500",
                      count: getProjectsByStatus("paused").length,
                    },
                  ].map(({ status, label, color, count }) => (
                    <div key={status} className="bg-primary-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-3 h-3 ${color} rounded-full`}></div>
                        <span className="text-sm font-medium text-gray-300">
                          {label}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {count}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Projects Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Your Projects
                    </h3>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      <Plus size={16} />
                      New Project
                    </button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {myProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        showStatus
                        onProjectUpdate={handleProjectUpdate}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Code className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No Projects Yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Start your first collaborative project and find amazing
                  teammates
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Create Your First Project
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default CollaborationHub;
