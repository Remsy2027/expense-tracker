import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

const Notifications = ({ notifications = [], onRemove, maxVisible = 3 }) => {
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
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
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

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm w-full">
      {visibleNotifications.map((notification, index) => {
        const IconComponent = getNotificationIcon(notification.type);

        return (
          <div
            key={notification.id}
            className={`
              transform transition-all duration-300 ease-out
              ${getNotificationStyles(notification.type)}
              rounded-2xl p-4 border shadow-sm backdrop-blur-sm
              animate-slide-in-right
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: "both",
            }}
          >
            <div className="flex items-start space-x-3">
              {/* Clean Icon */}
              <div className="flex-shrink-0">
                <IconComponent
                  className={`h-5 w-5 ${getIconStyles(notification.type)}`}
                />
              </div>

              {/* Clean Content */}
              <div className="flex-1 min-w-0">
                {notification.title && (
                  <h4 className="font-semibold text-sm mb-1">
                    {notification.title}
                  </h4>
                )}

                <p className="text-sm leading-relaxed">
                  {notification.message}
                </p>
              </div>

              {/* Clean Close Button */}
              <button
                onClick={() => onRemove?.(notification.id)}
                className="flex-shrink-0 p-1 rounded-xl hover:bg-black/10 transition-colors duration-200"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Clean notification item component
export const NotificationItem = ({ notification, onRemove, index = 0 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onRemove?.(notification.id);
    }, 300);
  };

  const IconComponent = getNotificationIcon(notification.type);

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        ${getNotificationStyles(notification.type)}
        rounded-2xl p-4 border shadow-sm
      `}
      style={{ animationDelay: `${index * 100}ms` }}
    >
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
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-xl hover:bg-black/10 transition-colors duration-200"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Helper functions
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
  switch (type) {
    case "success":
      return "bg-green-50 border-green-200 text-green-800";
    case "error":
      return "bg-red-50 border-red-200 text-red-800";
    case "warning":
      return "bg-yellow-50 border-yellow-200 text-yellow-800";
    case "info":
    default:
      return "bg-blue-50 border-blue-200 text-blue-800";
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

// CSS for slide animation
const styles = `
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
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Notifications;