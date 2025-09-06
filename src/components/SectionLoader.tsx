import React from "react";
import { Sparkles } from "lucide-react";

interface SectionLoaderProps {
  message?: string;
  className?: string;
}

const SectionLoader: React.FC<SectionLoaderProps> = ({
  message = "Loading...",
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 space-y-4 ${className}`}
    >
      <div className="flex items-center space-x-2">
        <Sparkles className="text-accent-400 animate-pulse" size={24} />
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-400"></div>
      </div>
      <p className="text-gray-300 font-medium">{message}</p>
    </div>
  );
};

export default SectionLoader;
