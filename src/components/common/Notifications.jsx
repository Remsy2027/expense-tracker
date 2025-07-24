import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
} from "lucide-react";

const Notifications = ({ notifications = [], onRemove, maxVisible = 5 }) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications.slice(0, maxVisible));
  }, [notifications, maxVisible]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "error":
        return AlertCircle;
      case "warning":
        return AlertTriangle;
      case "info":
      default:
        return Info;
    }
  };

  const getNotificationStyles = (type) => {
    const baseStyles = "border-l-4 shadow-lg backdrop-blur-sm";

    switch (type) {
      case "success":
        return `${baseStyles} bg-green-50/95 border-l-green-500 text-green-800`;
      case "error":
        return `${baseStyles} bg-red-50/95 border-l-red-500 text-red-800`;
      case "warning":
        return `${baseStyles} bg-yellow-50/95 border-l-yellow-500 text-yellow-800`;
      case "info":
      default:
        return `${baseStyles} bg-blue-50/95 border-l-blue-500 text-blue-800`;
    }
  };

  const getIconStyles = (type) => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      case "info":
      default:
        return "text-blue-600";
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      {visibleNotifications.map((notification, index) => {
        const IconComponent = getNotificationIcon(notification.type);

        return (
          <div
            key={notification.id}
            className={`
              transform transition-all duration-300 ease-out pointer-events-auto
              ${getNotificationStyles(notification.type)}
              rounded-lg p-4 relative overflow-hidden
              animate-slide-in-right
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: "both",
            }}
          >
            {/* Progress bar for timed notifications */}
            {notification.duration > 0 && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-black/10">
                <div
                  className="h-full bg-current opacity-30 transition-all ease-linear"
                  style={{
                    animation: `shrink ${notification.duration}ms linear forwards`,
                  }}
                />
              </div>
            )}

            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className="flex-shrink-0">
                <IconComponent
                  className={`h-5 w-5 ${getIconStyles(notification.type)}`}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                {notification.title && (
                  <h4 className="font-semibold text-sm mb-1">
                    {notification.title}
                  </h4>
                )}

                {/* Message */}
                <p className="text-sm leading-relaxed">
                  {notification.message}
                </p>

                {/* Timestamp and actions */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2 text-xs opacity-75">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimestamp(notification.timestamp)}</span>
                  </div>

                  {/* Action buttons */}
                  {notification.actions && (
                    <div className="flex items-center space-x-2">
                      {notification.actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={action.handler}
                          className="text-xs font-medium underline hover:no-underline transition-all duration-200"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Close button */}
              {notification.dismissible !== false && (
                <button
                  onClick={() => onRemove?.(notification.id)}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors duration-200"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
          </div>
        );
      })}

      {/* Show count of hidden notifications */}
      {notifications.length > maxVisible && (
        <div className="text-center pointer-events-auto">
          <div className="inline-flex items-center px-3 py-1 bg-gray-800/90 text-white text-xs rounded-full backdrop-blur-sm">
            +{notifications.length - maxVisible} more notifications
          </div>
        </div>
      )}

      {/* Styles for progress bar animation */}
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Enhanced notification component with built-in auto-dismiss
export const NotificationItem = ({ notification, onRemove, index = 0 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (notification.duration > 0) {
      // Update progress bar
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - 100 / (notification.duration / 100);
          if (newProgress <= 0) {
            clearInterval(progressInterval);
            handleDismiss();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(progressInterval);
    }
  }, [notification.duration]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onRemove?.(notification.id);
    }, 300); // Wait for exit animation
  };

  const IconComponent = getNotificationIcon(notification.type);

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        ${getNotificationStyles(notification.type)}
        rounded-lg p-4 relative overflow-hidden
      `}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Progress bar */}
      {notification.duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/10">
          <div
            className="h-full bg-current opacity-30 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <IconComponent
            className={`h-5 w-5 ${getIconStyles(notification.type)}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          {notification.title && (
            <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
          )}

          <p className="text-sm leading-relaxed">{notification.message}</p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2 text-xs opacity-75">
              <Clock className="h-3 w-3" />
              <span>{formatTimestamp(notification.timestamp)}</span>
            </div>

            {notification.actions && (
              <div className="flex items-center space-x-2">
                {notification.actions.map((action, actionIndex) => (
                  <button
                    key={actionIndex}
                    onClick={action.handler}
                    className="text-xs font-medium underline hover:no-underline transition-all duration-200"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {notification.dismissible !== false && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors duration-200"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Helper functions (move these to top if needed in other parts)
function getNotificationIcon(type) {
  switch (type) {
    case "success":
      return CheckCircle;
    case "error":
      return AlertCircle;
    case "warning":
      return AlertTriangle;
    case "info":
    default:
      return Info;
  }
}

function getNotificationStyles(type) {
  const baseStyles = "border-l-4 shadow-lg backdrop-blur-sm";

  switch (type) {
    case "success":
      return `${baseStyles} bg-green-50/95 border-l-green-500 text-green-800`;
    case "error":
      return `${baseStyles} bg-red-50/95 border-l-red-500 text-red-800`;
    case "warning":
      return `${baseStyles} bg-yellow-50/95 border-l-yellow-500 text-yellow-800`;
    case "info":
    default:
      return `${baseStyles} bg-blue-50/95 border-l-blue-500 text-blue-800`;
  }
}

function getIconStyles(type) {
  switch (type) {
    case "success":
      return "text-green-600";
    case "error":
      return "text-red-600";
    case "warning":
      return "text-yellow-600";
    case "info":
    default:
      return "text-blue-600";
  }
}

function formatTimestamp(timestamp) {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - notificationTime) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}

export default Notifications;
