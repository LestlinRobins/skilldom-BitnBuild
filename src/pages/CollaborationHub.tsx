import React, { useState, useEffect } from "react";
import {
  Plus,
  Users,
  Code,
  Search,
  Filter,
  X,
  Target,
  Briefcase,
  CheckCircle,
  PauseCircle,
  Star,
} from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import CreateProjectModal from "../components/CreateProjectModal";
import SectionLoader from "../components/SectionLoader";
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
    { key: "start", label: "Start a Project", icon: Plus },
    { key: "my", label: "My Projects", icon: Briefcase },
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

  const getProjectsByStatus = (status: string) =>
    myProjects.filter((p) => p.status === status);

  return (
    <div className="min-h-screen bg-primary-900 text-white pb-20">
      {/* Header */}
      <header className="bg-gradient-to-b from-primary-800 to-primary-900 p-6 shadow-xl border-b border-primary-700/50 sticky top-0 z-30">
        <h1 className="text-3xl font-bold mb-1 text-white">
          Collaboration Hub
        </h1>
        <p className="text-gray-400 mb-6">
          Discover, create, and manage your collaborative projects.
        </p>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-primary-700/50 rounded-xl p-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center justify-center space-x-2.5 py-3 px-2 rounded-lg font-semibold transition-all duration-300 transform hover:bg-white/5 ${
                activeTab === key
                  ? "bg-accent-500 text-white shadow-lg shadow-accent-500/20"
                  : "text-gray-300"
              }`}
            >
              <Icon size={18} strokeWidth={activeTab === key ? 2.5 : 2} />
              <span className="text-sm hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="p-4 sm:p-6 animate-fade-in">
        {activeTab === "find" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-primary-800/80 backdrop-blur-lg border border-primary-700 rounded-xl p-4 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search projects by skill, name, or keyword..."
                    className="w-full pl-4 pr-12 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
                  />
                  {/* --- FIX IS HERE --- */}
                  <button
                    onClick={handleSearch}
                    className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-accent-400 transition-colors"
                    title="Search"
                  >
                    <Search size={20} />
                  </button>
                  {/* --- END FIX --- */}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center justify-center p-3 rounded-lg transition-colors border ${
                    showFilters || selectedCategory || selectedSkills.length > 0
                      ? "bg-accent-500/20 border-accent-500/50 text-accent-300"
                      : "bg-primary-700/50 border-primary-600 text-gray-300 hover:border-primary-500"
                  }`}
                  title="Toggle Filters"
                >
                  <Filter size={20} />
                </button>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="border-t border-primary-700 pt-4 mt-4 space-y-4 animate-fade-in">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {popularSkills.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => toggleSkillFilter(skill)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
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
                <div className="flex items-center flex-wrap gap-2 mt-4 pt-4 border-t border-primary-700">
                  <span className="text-sm text-gray-400">Active filters:</span>
                  {selectedCategory && (
                    <span className="flex items-center gap-1.5 bg-accent-500/20 text-accent-300 px-2 py-1 rounded-full text-xs">
                      {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory("")}
                        className="hover:text-accent-100"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 bg-accent-500/20 text-accent-300 px-2 py-1 rounded-full text-xs"
                    >
                      {skill}
                      <button
                        onClick={() => toggleSkillFilter(skill)}
                        className="hover:text-accent-100"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Projects Grid */}
            {loading ? (
              <SectionLoader message="Loading projects..." />
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onProjectUpdate={handleProjectUpdate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-primary-800 rounded-lg">
                <Target className="mx-auto mb-4 text-gray-500" size={48} />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Projects Found
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery || selectedCategory || selectedSkills.length > 0
                    ? "Try adjusting your search criteria or filters."
                    : "No projects are currently available for collaboration."}
                </p>
                {(searchQuery ||
                  selectedCategory ||
                  selectedSkills.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="bg-accent-500 hover:bg-accent-600 text-white px-5 py-2.5 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "start" && (
          <div className="bg-gradient-to-br from-primary-800 to-primary-700/50 rounded-2xl p-8 text-center flex flex-col items-center border border-primary-700 shadow-2xl shadow-primary-900/50">
            <div className="relative mb-5">
              <div className="absolute -inset-2 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full blur-lg opacity-60"></div>
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full shadow-lg shadow-accent-500/20">
                <Plus className="text-white" size={40} strokeWidth={3} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Have an Idea? Let's Build It.
            </h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Share your vision, define the skills you need, and connect with
              talented collaborators from around the community.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-accent-500/20"
            >
              Create New Project
            </button>
          </div>
        )}

        {activeTab === "my" && (
          <div className="space-y-8">
            {loading ? (
              <SectionLoader message="Loading your projects..." />
            ) : myProjects.length > 0 ? (
              <>
                {/* Status Overview - RESPONSIVE GRID (NO SCROLLING) */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 px-2">
                    Projects Overview
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        status: "open",
                        label: "Open",
                        color: "border-blue-500",
                        icon: Star,
                      },
                      {
                        status: "in-progress",
                        label: "In Progress",
                        color: "border-yellow-500",
                        icon: Code,
                      },
                      {
                        status: "completed",
                        label: "Completed",
                        color: "border-green-500",
                        icon: CheckCircle,
                      },
                      {
                        status: "paused",
                        label: "Paused",
                        color: "border-gray-500",
                        icon: PauseCircle,
                      },
                    ].map(({ status, label, color, icon: Icon }) => (
                      <div
                        key={status}
                        className={`bg-primary-800/80 backdrop-blur-lg border-l-4 ${color} rounded-lg p-4 transition-all duration-300 hover:bg-primary-700 hover:-translate-y-1`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-300">
                            {label}
                          </span>
                          <Icon className="text-gray-500" size={20} />
                        </div>
                        <div className="text-4xl font-bold text-white">
                          {getProjectsByStatus(status).length}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-xl font-bold text-white">
                      Your Project Listings
                    </h3>
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
              <div className="text-center py-20 bg-primary-800 rounded-lg">
                <Briefcase className="mx-auto mb-4 text-gray-500" size={48} />
                <h3 className="text-xl font-semibold text-white mb-2">
                  You Haven't Started Any Projects Yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Click the button below to share your first project idea.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Create Your First Project
                </button>
              </div>
            )}
          </div>
        )}
      </main>

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
