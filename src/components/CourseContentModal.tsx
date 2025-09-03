import React, { useState } from "react";
import {
  X,
  FileText,
  Video,
  Download,
  Play,
  Eye,
  CheckCircle,
} from "lucide-react";
import type { Course } from "../services/courseService";

interface CourseContentModalProps {
  course: Course;
  onClose: () => void;
}

const CourseContentModal: React.FC<CourseContentModalProps> = ({
  course,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "videos" | "documents"
  >("overview");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set());
  const [viewedDocuments, setViewedDocuments] = useState<Set<number>>(
    new Set()
  );

  const hasVideos = course.video_urls && course.video_urls.length > 0;
  const hasDocuments = course.document_urls && course.document_urls.length > 0;

  // Calculate progress
  const totalContent =
    (course.video_urls?.length || 0) + (course.document_urls?.length || 0);
  const completedContent = watchedVideos.size + viewedDocuments.size;
  const progressPercentage =
    totalContent > 0 ? Math.round((completedContent / totalContent) * 100) : 0;

  const getFileNameFromUrl = (url: string): string => {
    try {
      const urlParts = url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      // Remove query parameters if any
      const cleanFileName = fileName.split("?")[0];
      // If it's a generated filename, create a more readable name
      if (cleanFileName.match(/^\d+-[a-f0-9]+\./)) {
        const extension = cleanFileName.split(".").pop();
        return `Course Material.${extension}`;
      }
      return cleanFileName || `File ${Math.floor(Math.random() * 1000)}`;
    } catch {
      return `File ${Math.floor(Math.random() * 1000)}`;
    }
  };

  const getFileType = (url: string): string => {
    const extension = url.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "PDF Document";
      case "doc":
      case "docx":
        return "Word Document";
      case "txt":
        return "Text File";
      case "mp4":
        return "Video File";
      case "avi":
        return "Video File";
      case "mov":
        return "Video File";
      default:
        return "File";
    }
  };

  const handleVideoPlay = (videoUrl: string, index: number) => {
    setSelectedMedia(videoUrl);
    // Mark video as watched
    setWatchedVideos((prev) => new Set([...prev, index]));
  };

  const handleDocumentView = (docUrl: string, index: number) => {
    // Mark document as viewed
    setViewedDocuments((prev) => new Set([...prev, index]));
    window.open(docUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-800 rounded-xl w-full max-w-4xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{course.title}</h2>
            <p className="text-gray-400 mt-1">Course Content</p>
          </div>
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
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "text-accent-400 border-b-2 border-accent-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          {hasVideos && (
            <button
              onClick={() => setActiveTab("videos")}
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "videos"
                  ? "text-accent-400 border-b-2 border-accent-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Videos ({course.video_urls?.length})
            </button>
          )}
          {hasDocuments && (
            <button
              onClick={() => setActiveTab("documents")}
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "documents"
                  ? "text-accent-400 border-b-2 border-accent-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Documents ({course.document_urls?.length})
            </button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Progress Summary */}
              {totalContent > 0 && (
                <div className="bg-primary-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      Course Progress
                    </h3>
                    <span className="text-accent-400 font-bold">
                      {progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-primary-600 rounded-full h-3 mb-2">
                    <div
                      className="bg-accent-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {completedContent} of {totalContent} items completed
                  </p>
                </div>
              )}

              {/* Course Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Description
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Course Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Duration
                  </h4>
                  <p className="text-white font-semibold">
                    {course.duration} minutes
                  </p>
                </div>
                <div className="bg-primary-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Category
                  </h4>
                  <p className="text-white font-semibold">
                    {course.skill_category}
                  </p>
                </div>
                <div className="bg-primary-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    SVC Value
                  </h4>
                  <p className="text-white font-semibold">
                    {course.svc_value} SVC
                  </p>
                </div>
              </div>

              {/* Quick Access to Media */}
              <div className="space-y-4">
                {hasVideos && (
                  <div>
                    <h4 className="text-md font-semibold text-white mb-2">
                      Video Content
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {course.video_urls?.slice(0, 2).map((videoUrl, index) => (
                        <div
                          key={index}
                          className="bg-primary-700 rounded-lg p-4 cursor-pointer hover:bg-primary-600 transition-colors"
                          onClick={() => handleVideoPlay(videoUrl, index)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-red-500/20 p-2 rounded-lg">
                              <Video className="text-red-400" size={20} />
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                Video {index + 1}
                              </p>
                              <p className="text-gray-400 text-sm">
                                Click to play
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {(course.video_urls?.length || 0) > 2 && (
                      <button
                        onClick={() => setActiveTab("videos")}
                        className="mt-2 text-accent-400 hover:text-accent-300 text-sm"
                      >
                        View all {course.video_urls?.length} videos →
                      </button>
                    )}
                  </div>
                )}

                {hasDocuments && (
                  <div>
                    <h4 className="text-md font-semibold text-white mb-2">
                      Documents
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {course.document_urls
                        ?.slice(0, 2)
                        .map((docUrl, index) => (
                          <div
                            key={index}
                            className="bg-primary-700 rounded-lg p-4 cursor-pointer hover:bg-primary-600 transition-colors"
                            onClick={() => handleDocumentView(docUrl, index)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-500/20 p-2 rounded-lg">
                                <FileText className="text-blue-400" size={20} />
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {getFileNameFromUrl(docUrl)}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  {getFileType(docUrl)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    {(course.document_urls?.length || 0) > 2 && (
                      <button
                        onClick={() => setActiveTab("documents")}
                        className="mt-2 text-accent-400 hover:text-accent-300 text-sm"
                      >
                        View all {course.document_urls?.length} documents →
                      </button>
                    )}
                  </div>
                )}

                {!hasVideos && !hasDocuments && (
                  <div className="bg-primary-700/30 rounded-lg p-6 text-center">
                    <FileText
                      className="text-gray-500 mx-auto mb-2"
                      size={32}
                    />
                    <p className="text-gray-400">
                      No additional course materials available
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      The instructor hasn't uploaded any videos or documents
                      yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === "videos" && hasVideos && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Video Content
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {course.video_urls?.map((videoUrl, index) => (
                  <div key={index} className="bg-primary-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="bg-red-500/20 p-3 rounded-lg">
                            <Video className="text-red-400" size={24} />
                          </div>
                          {watchedVideos.has(index) && (
                            <div className="absolute -top-1 -right-1 bg-success-500 rounded-full p-1">
                              <CheckCircle size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">
                            Video {index + 1}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {getFileNameFromUrl(videoUrl)}
                          </p>
                          {watchedVideos.has(index) && (
                            <p className="text-success-400 text-xs">
                              ✓ Watched
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVideoPlay(videoUrl, index)}
                          className="bg-accent-500 hover:bg-accent-600 text-white p-2 rounded-lg transition-colors"
                          title="Play video"
                        >
                          <Play size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleDownload(
                              videoUrl,
                              getFileNameFromUrl(videoUrl)
                            )
                          }
                          className="bg-primary-600 hover:bg-primary-500 text-white p-2 rounded-lg transition-colors"
                          title="Download video"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && hasDocuments && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Documents</h3>
              <div className="grid grid-cols-1 gap-4">
                {course.document_urls?.map((docUrl, index) => (
                  <div key={index} className="bg-primary-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="bg-blue-500/20 p-3 rounded-lg">
                            <FileText className="text-blue-400" size={24} />
                          </div>
                          {viewedDocuments.has(index) && (
                            <div className="absolute -top-1 -right-1 bg-success-500 rounded-full p-1">
                              <CheckCircle size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">
                            {getFileNameFromUrl(docUrl)}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {getFileType(docUrl)}
                          </p>
                          {viewedDocuments.has(index) && (
                            <p className="text-success-400 text-xs">✓ Viewed</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDocumentView(docUrl, index)}
                          className="bg-accent-500 hover:bg-accent-600 text-white p-2 rounded-lg transition-colors"
                          title="View document"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleDownload(docUrl, getFileNameFromUrl(docUrl))
                          }
                          className="bg-primary-600 hover:bg-primary-500 text-white p-2 rounded-lg transition-colors"
                          title="Download document"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Video Player Modal */}
        {selectedMedia && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
            style={{ zIndex: 60 }}
          >
            <div className="relative w-full max-w-4xl">
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
              <video
                src={selectedMedia}
                controls
                autoPlay
                className="w-full h-auto max-h-[80vh] rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContentModal;
