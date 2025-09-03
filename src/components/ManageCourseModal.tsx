import React, { useState } from "react";
import { X, Save, FileText, Video, Image, Trash2, Edit3 } from "lucide-react";
import { skillCategories } from "../data/mockData";
import { useCourseOperations } from "../hooks/useCourseOperations";
import { uploadCourseMedia, deleteFile } from "../services/supabaseService";
import type { Course } from "../services/courseService";

interface ManageCourseModalProps {
  course: Course;
  onClose: () => void;
  onUpdate?: (updatedCourse: Course) => void;
}

const ManageCourseModal: React.FC<ManageCourseModalProps> = ({
  course,
  onClose,
  onUpdate,
}) => {
  const { updateCourse } = useCourseOperations();
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "media">("details");

  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description,
    skill_category: course.skill_category,
    svc_value: course.svc_value,
    duration: course.duration,
    image_url: course.image_url || "",
  });

  const [mediaData, setMediaData] = useState({
    video_urls: course.video_urls || [],
    document_urls: course.document_urls || [],
    media_files: course.media_files || [],
  });

  const [selectedFiles, setSelectedFiles] = useState<{
    images: File[];
    videos: File[];
    documents: File[];
  }>({
    images: [],
    videos: [],
    documents: [],
  });

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

  const removeExistingMedia = async (
    url: string,
    type: "video_urls" | "document_urls"
  ) => {
    // Find corresponding file path and delete from storage
    const mediaIndex = mediaData[type].indexOf(url);
    if (mediaIndex !== -1 && course.media_files) {
      const filePath = course.media_files[mediaIndex];
      if (filePath) {
        try {
          await deleteFile("course-media", filePath);
        } catch (error) {
          console.error("Failed to delete file from storage:", error);
        }
      }
    }

    // Update local state
    setMediaData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== mediaIndex),
      media_files: prev.media_files.filter((_, i) => i !== mediaIndex),
    }));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <Image size={16} />;
    if (file.type.startsWith("video/")) return <Video size={16} />;
    return <FileText size={16} />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Upload new media files if any
      const newMediaUploads = {
        image_urls: [...(formData.image_url ? [formData.image_url] : [])],
        video_urls: [...mediaData.video_urls],
        document_urls: [...mediaData.document_urls],
        media_files: [...mediaData.media_files],
      };

      // Upload selected files
      for (const imageFile of selectedFiles.images) {
        const uploadResult = await uploadCourseMedia(
          imageFile,
          course.id,
          "image"
        );
        newMediaUploads.image_urls.push(uploadResult.url);
        newMediaUploads.media_files.push(uploadResult.path);
      }

      for (const videoFile of selectedFiles.videos) {
        const uploadResult = await uploadCourseMedia(
          videoFile,
          course.id,
          "video"
        );
        newMediaUploads.video_urls.push(uploadResult.url);
        newMediaUploads.media_files.push(uploadResult.path);
      }

      for (const docFile of selectedFiles.documents) {
        const uploadResult = await uploadCourseMedia(
          docFile,
          course.id,
          "document"
        );
        newMediaUploads.document_urls.push(uploadResult.url);
        newMediaUploads.media_files.push(uploadResult.path);
      }

      // Update course with new data
      const updateData = {
        ...formData,
        image_url: newMediaUploads.image_urls[0] || formData.image_url,
        video_urls: newMediaUploads.video_urls,
        document_urls: newMediaUploads.document_urls,
        media_files: newMediaUploads.media_files,
      };

      const result = await updateCourse(course.id, updateData);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Show success toast
      const toast = document.createElement("div");
      toast.className =
        "fixed top-4 left-1/2 transform -translate-x-1/2 bg-success-500 text-white px-4 py-2 rounded-lg z-50 animate-fade-in";
      toast.textContent = "Course updated successfully!";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);

      if (onUpdate && result.course) {
        onUpdate(result.course);
      }

      onClose();
    } catch (error) {
      console.error("Failed to update course:", error);
      // Show error toast
      const toast = document.createElement("div");
      toast.className =
        "fixed top-4 left-1/2 transform -translate-x-1/2 bg-error-500 text-white px-4 py-2 rounded-lg z-50 animate-fade-in";
      toast.textContent = "Failed to update course. Please try again.";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-800 rounded-xl w-full max-w-4xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Edit3 size={24} />
            <span>Manage Course</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-primary-600">
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === "details"
                ? "text-accent-400 border-b-2 border-accent-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Course Details
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === "media"
                ? "text-accent-400 border-b-2 border-accent-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Media Management
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Skill Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Skill Category
                  </label>
                  <select
                    name="skill_category"
                    value={formData.skill_category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-primary-600 border border-primary-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors"
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

                {/* Course Image URL */}
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
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === "media" && (
            <div className="space-y-6">
              {/* Existing Media */}
              {(mediaData.video_urls.length > 0 ||
                mediaData.document_urls.length > 0) && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Existing Media
                  </h3>

                  {/* Existing Videos */}
                  {mediaData.video_urls.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">
                        Videos
                      </h4>
                      <div className="space-y-2">
                        {mediaData.video_urls.map((url, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-primary-700 px-3 py-2 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <Video size={16} />
                              <span className="text-sm text-white truncate">
                                Video {index + 1}
                              </span>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-accent-400 hover:text-accent-300"
                              >
                                View
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                removeExistingMedia(url, "video_urls")
                              }
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Documents */}
                  {mediaData.document_urls.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">
                        Documents
                      </h4>
                      <div className="space-y-2">
                        {mediaData.document_urls.map((url, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-primary-700 px-3 py-2 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <FileText size={16} />
                              <span className="text-sm text-white truncate">
                                Document {index + 1}
                              </span>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-accent-400 hover:text-accent-300"
                              >
                                View
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                removeExistingMedia(url, "document_urls")
                              }
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upload New Media */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Upload New Media
                </h3>

                {/* Images Upload */}
                <div className="mb-6">
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
                <div className="mb-6">
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
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-4 pt-6 border-t border-primary-600 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 bg-accent-500 hover:bg-accent-600 disabled:bg-accent-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageCourseModal;
