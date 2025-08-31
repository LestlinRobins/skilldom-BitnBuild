import React from "react";
import { useAuth } from "../contexts/AuthContext";

const DebugUserInfo: React.FC = () => {
  const { user, showOnboarding } = useAuth();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>User ID: {user?.id || "None"}</div>
        <div>
          Onboarding Completed: {user?.onboarding_completed ? "Yes" : "No"}
        </div>
        <div>Verification Status: {user?.verification_status || "N/A"}</div>
        <div>Show Onboarding: {showOnboarding ? "Yes" : "No"}</div>
      </div>
    </div>
  );
};

export default DebugUserInfo;
