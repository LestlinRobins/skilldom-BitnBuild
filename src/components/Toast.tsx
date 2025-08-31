import React, { useEffect } from "react";
import { CheckCircle, X, Coins } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  svcChange?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, svcChange }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-success-500 border-success-400";
      case "error":
        return "bg-red-500 border-red-400";
      default:
        return "bg-accent-500 border-accent-400";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <X size={20} />;
      default:
        return <CheckCircle size={20} />;
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div
        className={`${getTypeStyles()} border text-white px-6 py-4 rounded-lg shadow-xl max-w-sm mx-auto`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
          <div className="flex-1">
            <p className="font-medium text-sm">{message}</p>
            {svcChange && (
              <div className="flex items-center space-x-1 mt-1">
                <Coins size={14} />
                <span className="text-xs opacity-90">
                  {svcChange > 0 ? "+" : ""}
                  {svcChange} SVC
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
