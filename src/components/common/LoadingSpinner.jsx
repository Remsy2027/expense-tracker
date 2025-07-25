import React from "react";

const LoadingSpinner = ({
  size = "md",
  color = "primary",
  className = "",
  label = "Loading...",
  showLabel = false,
  fullScreen = false,
}) => {
  // Clean size configurations
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  // Clean color configurations
  const colorClasses = {
    primary: "text-blue-600",
    gray: "text-gray-400",
    white: "text-white",
  };

  const baseClasses = `${sizeClasses[size]} ${colorClasses[color]} ${className}`;

  // Simple spinner component
  const SpinnerIcon = () => (
    <div className={`${baseClasses} animate-spin`}>
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );

  const LoaderComponent = () => (
    <div className={`flex flex-col items-center space-y-3 ${fullScreen ? "justify-center" : ""}`}>
      <SpinnerIcon />
      {showLabel && (
        <div className={`text-sm font-medium ${colorClasses[color]}`}>
          {label}
        </div>
      )}
    </div>
  );

  // Clean full screen loader
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <LoaderComponent />
      </div>
    );
  }

  return <LoaderComponent />;
};

// Clean skeleton loading component
export const SkeletonLoader = ({
  lines = 3,
  className = "",
  avatar = false,
}) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {avatar && (
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      )}

      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded ${
            i === lines - 1 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </div>
  );
};

// Clean button loading state
export const ButtonLoader = ({
  size = "sm",
  color = "white",
  className = "",
}) => (
  <LoadingSpinner
    size={size}
    color={color}
    className={className}
  />
);

// Clean page loading component
export const PageLoader = ({
  title = "Loading",
  subtitle = "Please wait...",
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center space-y-6 p-8">
      <div className="w-16 h-16 mx-auto">
        <LoadingSpinner size="lg" color="primary" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>
    </div>
  </div>
);

// Clean chart loading placeholder
export const ChartLoader = ({ height = "h-64" }) => (
  <div className={`${height} bg-gray-50 rounded-2xl p-6 animate-pulse`}>
    <div className="h-full flex items-end space-x-2">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-200 rounded-sm"
          style={{ height: `${Math.random() * 60 + 40}%` }}
        />
      ))}
    </div>
  </div>
);

export default LoadingSpinner;