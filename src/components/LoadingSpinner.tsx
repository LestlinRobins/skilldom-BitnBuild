import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-700 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-400"></div>
        <p className="text-gray-300 font-medium">Loading Skilldom...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;