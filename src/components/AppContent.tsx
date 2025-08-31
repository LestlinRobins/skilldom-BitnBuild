import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import OnboardingModal from "./OnboardingModal";
import DebugUserInfo from "./DebugUserInfo";

interface AppContentProps {
  router: any;
}

const AppContent: React.FC<AppContentProps> = ({ router }) => {
  const { showOnboarding, setShowOnboarding, user } = useAuth();

  // Debug effect to track onboarding state changes
  useEffect(() => {
    console.log("AppContent - Onboarding state changed:", {
      showOnboarding,
      user_id: user?.id,
      onboarding_completed: user?.onboarding_completed,
    });
  }, [showOnboarding, user?.onboarding_completed]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
  };

  return (
    <>
      <RouterProvider router={router} />
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
};

export default AppContent;
