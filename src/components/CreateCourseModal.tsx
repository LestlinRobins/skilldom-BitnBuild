import React, { useState } from "react";
import { X, Plus, FileText, Video, Image } from "lucide-react";
import { skillCategories } from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";
import { useCourseOperations } from "../hooks/useCourseOperations";
import { uploadCourseMedia } from "../services/supabaseService";

interface CreateCourseModalProps {
  onClose: () => void;
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { createCourse, updateCourse } = useCourseOperations();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skill_category: "",
    svc_value: 0,
    duration: 0,
    image_url: "",
    video_urls: [] as string[],
    document_urls: [] as string[],
    media_files: [] as string[],
  });
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{
    images: File[];
    videos: File[];
    documents: File[];
  }>({
    images: [],
    videos: [],
    documents: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // First create the course to get an ID
      const tempCourseData = {
        ...formData,
        teacher_id: user?.id || "",
        learners: [],
        availability: ["online"], // Default to online
        created_at: new Date().toISOString(),
      };

      const result = await createCourse(tempCourseData);

      if (!result.success || !result.course) {
        throw new Error(result.error);
      }

      const courseId = result.course.id;

      // Upload media files if any
      const mediaUploads = {
        image_urls: [...(formData.image_url ? [formData.image_url] : [])],
        video_urls: [...formData.video_urls],
        document_urls: [...formData.document_urls],
        media_files: [...formData.media_files],
      };

      // Upload selected files
      for (const imageFile of selectedFiles.images) {
        const uploadResult = await uploadCourseMedia(
          imageFile,
          courseId,
          "image"
        );
        mediaUploads.image_urls.push(uploadResult.url);
        mediaUploads.media_files.push(uploadResult.path);
      }

      for (const videoFile of selectedFiles.videos) {
        const uploadResult = await uploadCourseMedia(
          videoFile,
          courseId,
          "video"
        );
        mediaUploads.video_urls.push(uploadResult.url);
        mediaUploads.media_files.push(uploadResult.path);
      }

      for (const docFile of selectedFiles.documents) {
        const uploadResult = await uploadCourseMedia(
          docFile,
          courseId,
          "document"
        );
        mediaUploads.document_urls.push(uploadResult.url);
        mediaUploads.media_files.push(uploadResult.path);
      }

      // Update course with media URLs if files were uploaded
      if (mediaUploads.media_files.length > 0) {
        const updateResult = await updateCourse(courseId, {
          image_url: mediaUploads.image_urls[0] || formData.image_url,
          video_urls: mediaUploads.video_urls,
          document_urls: mediaUploads.document_urls,
          media_files: mediaUploads.media_files,
        });

        if (!updateResult.success) {
          console.warn(
            "Course created but media update failed:",
            updateResult.error
          );
        }
      }

      // Show success toast
      const toast = document.createElement("div");
      toast.className =
        "fixed top-4 left-1/2 transform -translate-x-1/2 bg-success-500 text-white px-4 py-2 rounded-lg z-50 animate-fade-in";
      toast.textContent = "Course created successfully!";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);

      onClose();
    } catch (error) {
      console.error("Failed to create course:", error);
      // Show error toast
      const toast = document.createElement("div");
      toast.className =
        "fixed top-4 left-1/2 transform -translate-x-1/2 bg-error-500 text-white px-4 py-2 rounded-lg z-50 animate-fade-in";
      toast.textContent = "Failed to create course. Please try again.";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "svc_value" || name === "duration"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "images" | "videos" | "documents"
  ) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => ({
      ...prev,
      [type]: [...prev[type], ...files],
    }));
  };

  const removeFile = (
    type: "images" | "videos" | "documents",
    index: number
  ) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <Image size={16} />;
    if (file.type.startsWith("video/")) return <Video size={16} />;
    return <FileText size={16} />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-800 rounded-xl w-full max-w-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create New Course</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Course Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
              placeholder="Enter course title"
              required
            />
          </div>

          {/* Description */}
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
              placeholder="Describe your course and what students will learn..."
              required
            />
          </div>

          {/* Skill Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Skill Category
            </label>
            <select
              name="skill_category"
              value={formData.skill_category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
              required
            >
              <option value="">Select a category</option>
              {skillCategories.map((category: string) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* SVC Value */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              SVC Value
            </label>
            <input
              type="number"
              name="svc_value"
              value={formData.svc_value}
              onChange={handleInputChange}
              min={0}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
              placeholder="Enter SVC value"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              The cost in SVC for students to enroll
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              min={1}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
              placeholder="Enter course duration in minutes"
              required
            />
          </div>

          {/* Course Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Course Image URL (optional)
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
              placeholder="Enter image URL"
            />
          </div>

          {/* Media Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Course Media</h3>

            {/* Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Images
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-primary-600 hover:bg-primary-500 hover:border-gray-500 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Image className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">
                        Click to upload images
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG or GIF (MAX. 5MB each)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, "images")}
                  />
                </label>
              </div>
              {selectedFiles.images.length > 0 && (
                <div className="mt-2 space-y-2">
                  {selectedFiles.images.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-primary-700 px-3 py-2 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        {getFileIcon(file)}
                        <span className="text-sm text-white truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile("images", index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Videos
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-primary-600 hover:bg-primary-500 hover:border-gray-500 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Video className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">
                        Click to upload videos
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      MP4, AVI or MOV (MAX. 50MB each)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="video/*"
                    onChange={(e) => handleFileSelect(e, "videos")}
                  />
                </label>
              </div>
              {selectedFiles.videos.length > 0 && (
                <div className="mt-2 space-y-2">
                  {selectedFiles.videos.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-primary-700 px-3 py-2 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        {getFileIcon(file)}
                        <span className="text-sm text-white truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile("videos", index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Documents
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-primary-600 hover:bg-primary-500 hover:border-gray-500 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">
                        Click to upload documents
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF, DOC, DOCX or TXT (MAX. 10MB each)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => handleFileSelect(e, "documents")}
                  />
                </label>
              </div>
              {selectedFiles.documents.length > 0 && (
                <div className="mt-2 space-y-2">
                  {selectedFiles.documents.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-primary-700 px-3 py-2 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        {getFileIcon(file)}
                        <span className="text-sm text-white truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile("documents", index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-accent-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Course...</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Create Course</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;
