import React, { useState } from "react";
import { X, Plus, Upload, Trash2 } from "lucide-react";
import { skillCategories } from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";
import { createProject, Project } from "../services/projectService";
import { uploadCourseMedia } from "../services/courseService";

interface CreateProjectModalProps {
  onClose: () => void;
  onProjectCreated?: (project: Project) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  onClose,
  onProjectCreated,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [projectLinks, setProjectLinks] = useState<string[]>([""]);
  const [projectGoals, setProjectGoals] = useState<string[]>([""]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    maxMembers: 2,
    category: "",
    estimatedDuration: "",
    difficultyLevel: "beginner" as const,
    contactInfo: "",
    deadline: "",
    requirements: "",
    tags: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error("No user found");
      alert("Please log in to create a project");
      return;
    }

    // Debug user information
    console.log("=== DEBUG: User Info ===");
    console.log("User object:", user);
    console.log("User ID:", user.id);
    console.log("User ID type:", typeof user.id);
    console.log("User ID length:", user.id?.length);
    console.log("========================");

    setIsLoading(true);
    try {
      // Upload media files
      const mediaUrls: string[] = [];
      const galleryImages: string[] = [];

      for (const file of mediaFiles) {
        const uploadedUrl = await uploadCourseMedia(file);
        mediaUrls.push(uploadedUrl);

        if (file.type.startsWith("image/")) {
          galleryImages.push(uploadedUrl);
        }
      }

      // Create project
      const projectData = {
        title: formData.title,
        description: formData.description,
        creator_id: user.id,
        required_skills: formData.requiredSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        max_members: formData.maxMembers,
        status: "open" as const,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        difficulty_level: formData.difficultyLevel,
        estimated_duration: formData.estimatedDuration,
        contact_info: formData.contactInfo,
        project_links: projectLinks.filter(Boolean),
        gallery_images: galleryImages,
        media_files: mediaUrls,
        created_at: new Date().toISOString(),
        deadline: formData.deadline || undefined,
        requirements: formData.requirements,
        project_goals: projectGoals.filter(Boolean),
      };

      console.log("=== DEBUG: Project Data ===");
      console.log("Project data being sent:", projectData);
      console.log("==========================");

      const newProject = await createProject(projectData);
      onProjectCreated?.(newProject);
      onClose();
      resetForm();

      // Show success toast
      const toast = document.createElement("div");
      toast.className =
        "fixed top-4 left-1/2 transform -translate-x-1/2 bg-success-500 text-white px-4 py-2 rounded-lg z-50 animate-fade-in";
      toast.textContent =
        "Project created successfully! Now visible to potential collaborators.";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      requiredSkills: "",
      maxMembers: 2,
      category: "",
      estimatedDuration: "",
      difficultyLevel: "beginner",
      contactInfo: "",
      deadline: "",
      requirements: "",
      tags: "",
    });
    setMediaFiles([]);
    setProjectLinks([""]);
    setProjectGoals([""]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addProjectLink = () => {
    setProjectLinks((prev) => [...prev, ""]);
  };

  const updateProjectLink = (index: number, value: string) => {
    setProjectLinks((prev) =>
      prev.map((link, i) => (i === index ? value : link))
    );
  };

  const removeProjectLink = (index: number) => {
    setProjectLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const addProjectGoal = () => {
    setProjectGoals((prev) => [...prev, ""]);
  };

  const updateProjectGoal = (index: number, value: string) => {
    setProjectGoals((prev) =>
      prev.map((goal, i) => (i === index ? value : goal))
    );
  };

  const removeProjectGoal = (index: number) => {
    setProjectGoals((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-800 rounded-xl w-full max-w-4xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Design">Design</option>
                  <option value="Game Development">Game Development</option>
                  <option value="Blockchain">Blockchain</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty Level
                </label>
                <select
                  name="difficultyLevel"
                  value={formData.difficultyLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Team Members
                </label>
                <input
                  type="number"
                  name="maxMembers"
                  value={formData.maxMembers}
                  onChange={handleInputChange}
                  min="2"
                  max="10"
                  className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estimated Duration
                </label>
                <input
                  type="text"
                  name="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
                  placeholder="e.g., 2 weeks, 1 month"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Project Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors resize-none"
                  placeholder="Describe your project and what you hope to achieve..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Required Skills
                </label>
                <input
                  type="text"
                  name="requiredSkills"
                  value={formData.requiredSkills}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
                  placeholder="e.g., React, UI Design, Python"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Separate skills with commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
                  placeholder="e.g., open-source, mobile-app, startup"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Separate tags with commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Requirements (Optional)
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors resize-none"
                  placeholder="Any specific requirements for collaborators..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Information (Optional)
                </label>
                <input
                  type="text"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
                  placeholder="Discord, email, etc."
                />
              </div>
            </div>
          </div>

          {/* Project Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Goals
            </label>
            {projectGoals.map((goal, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => updateProjectGoal(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
                  placeholder="Enter project goal..."
                />
                {projectGoals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProjectGoal(index)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addProjectGoal}
              className="text-accent-400 hover:text-accent-300 text-sm transition-colors"
            >
              + Add Goal
            </button>
          </div>

          {/* Project Links */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Related Links (Optional)
            </label>
            {projectLinks.map((link, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => updateProjectLink(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
                  placeholder="https://..."
                />
                {projectLinks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProjectLink(index)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addProjectLink}
              className="text-accent-400 hover:text-accent-300 text-sm transition-colors"
            >
              + Add Link
            </button>
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Media (Optional)
            </label>
            <div className="border-2 border-dashed border-primary-500 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleMediaUpload}
                className="hidden"
                id="media-upload"
              />
              <label
                htmlFor="media-upload"
                className="cursor-pointer flex flex-col items-center space-y-2 text-gray-400 hover:text-white transition-colors"
              >
                <Upload size={24} />
                <span>Click to upload images, videos, or documents</span>
                <span className="text-xs">Max 10MB per file</span>
              </label>
            </div>

            {mediaFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {mediaFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-primary-600 p-3 rounded-lg"
                  >
                    <span className="text-white text-sm">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Skills */}
          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">
              Popular Skills:
            </p>
            <div className="flex flex-wrap gap-2">
              {skillCategories.slice(0, 6).map((skill: string) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => {
                    const skills = formData.requiredSkills
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    if (!skills.includes(skill)) {
                      setFormData((prev) => ({
                        ...prev,
                        requiredSkills:
                          skills.length > 0
                            ? `${skills.join(", ")}, ${skill}`
                            : skill,
                      }));
                    }
                  }}
                  className="text-xs bg-primary-600 hover:bg-accent-500 text-gray-300 hover:text-white px-2 py-1 rounded transition-colors"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-accent-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Project...</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Create Project</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
