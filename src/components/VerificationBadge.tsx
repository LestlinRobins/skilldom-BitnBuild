import React from "react";
import { CheckCircle, AlertTriangle, Clock, X } from "lucide-react";

interface VerificationBadgeProps {
  status?: "verified" | "pending" | "failed" | "not_started";
  className?: string;
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status = "not_started",
  className = "",
  showTooltip = true,
  size = "md",
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "verified":
        return {
          icon: CheckCircle,
          color: "text-green-600 bg-green-100",
          text: "Skills Verified",
          description:
            "Skills have been verified by AI against professional profiles",
        };
      case "pending":
        return {
          icon: Clock,
          color: "text-yellow-600 bg-yellow-100",
          text: "Verification Pending",
          description: "Skill verification in progress",
        };
      case "failed":
        return {
          icon: X,
          color: "text-red-600 bg-red-100",
          text: "Verification Failed",
          description: "Verification process encountered an error",
        };
      case "not_started":
        return {
          icon: AlertTriangle,
          color: "text-gray-600 bg-gray-100",
          text: "Not Verified",
          description: "Skills have not been verified yet",
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const { icon: Icon, color, text, description } = config;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const iconSize = sizeClasses[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      title={showTooltip ? description : undefined}
    >
      <div className={`rounded-full p-1 ${color}`}>
        <Icon className={iconSize} />
      </div>
      {size !== "sm" && (
        <span className={`font-medium text-sm ${color.split(" ")[0]}`}>
          {text}
        </span>
      )}
    </div>
  );
};

// Simplified version for inline display
export const VerificationIcon: React.FC<{
  status?: VerificationBadgeProps["status"];
  className?: string;
}> = ({ status = "not_started", className = "" }) => {
  return (
    <VerificationBadge
      status={status}
      className={className}
      size="sm"
      showTooltip={true}
    />
  );
};

export default VerificationBadge;
