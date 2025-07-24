import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  variant = 'spinner',
  className = '',
  label = 'Loading...',
  showLabel = false,
  fullScreen = false 
}) => {
  // Size configurations
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6', 
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Color configurations
  const colorClasses = {
    primary: 'text-indigo-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
    white: 'text-white'
  };

  const baseClasses = `${sizeClasses[size]} ${colorClasses[color]} ${className}`;

  // Spinner variants
  const SpinnerVariant = () => (
    <div className={`${baseClasses} animate-spin`}>
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );

  const DotsVariant = () => (
    <div className={`flex space-x-1 ${sizeClasses[size]}`}>
      <div 
        className={`w-2 h-2 ${colorClasses[color]} bg-current rounded-full animate-bounce`}
        style={{ animationDelay: '0ms' }}
      />
      <div 
        className={`w-2 h-2 ${colorClasses[color]} bg-current rounded-full animate-bounce`}
        style={{ animationDelay: '150ms' }}
      />
      <div 
        className={`w-2 h-2 ${colorClasses[color]} bg-current rounded-full animate-bounce`}
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );

  const PulseVariant = () => (
    <div className={`${baseClasses} animate-pulse`}>
      <div className={`w-full h-full ${colorClasses[color]} bg-current rounded-full opacity-75`} />
    </div>
  );

  const BarsVariant = () => (
    <div className={`flex items-end space-x-1 ${sizeClasses[size]}`}>
      <div 
        className={`w-1 bg-current ${colorClasses[color]} animate-pulse`}
        style={{ 
          height: '60%',
          animationDelay: '0ms',
          animationDuration: '1.4s'
        }}
      />
      <div 
        className={`w-1 bg-current ${colorClasses[color]} animate-pulse`}
        style={{ 
          height: '80%',
          animationDelay: '0.2s',
          animationDuration: '1.4s'
        }}
      />
      <div 
        className={`w-1 bg-current ${colorClasses[color]} animate-pulse`}
        style={{ 
          height: '100%',
          animationDelay: '0.4s',
          animationDuration: '1.4s'
        }}
      />
      <div 
        className={`w-1 bg-current ${colorClasses[color]} animate-pulse`}
        style={{ 
          height: '80%',
          animationDelay: '0.6s',
          animationDuration: '1.4s'
        }}
      />
      <div 
        className={`w-1 bg-current ${colorClasses[color]} animate-pulse`}
        style={{ 
          height: '60%',
          animationDelay: '0.8s',
          animationDuration: '1.4s'
        }}
      />
    </div>
  );

  const RippleVariant = () => (
    <div className={`relative ${baseClasses}`}>
      <div className="absolute inset-0">
        <div 
          className={`w-full h-full border-2 border-current ${colorClasses[color]} rounded-full animate-ping opacity-75`}
          style={{ animationDuration: '1.5s' }}
        />
      </div>
      <div className="absolute inset-0">
        <div 
          className={`w-full h-full border-2 border-current ${colorClasses[color]} rounded-full animate-ping opacity-75`}
          style={{ 
            animationDuration: '1.5s',
            animationDelay: '0.5s'
          }}
        />
      </div>
    </div>
  );

  const SquareVariant = () => (
    <div className={`${baseClasses} animate-spin`}>
      <div 
        className={`w-full h-full ${colorClasses[color]} bg-current opacity-75`}
        style={{ 
          borderRadius: '20%',
          animation: 'square-spin 1.2s ease-in-out infinite'
        }}
      />
      <style jsx>{`
        @keyframes square-spin {
          0% { transform: perspective(120px) rotateX(0deg) rotateY(0deg); }
          50% { transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg); }
          100% { transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg); }
        }
      `}</style>
    </div>
  );

  const GridVariant = () => (
    <div className={`grid grid-cols-3 gap-1 ${sizeClasses[size]}`}>
      {[...Array(9)].map((_, i) => (
        <div 
          key={i}
          className={`w-full aspect-square ${colorClasses[color]} bg-current rounded-sm animate-pulse`}
          style={{ 
            animationDelay: `${i * 100}ms`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );

  // Select variant component
  const getVariantComponent = () => {
    switch (variant) {
      case 'dots':
        return <DotsVariant />;
      case 'pulse':
        return <PulseVariant />;
      case 'bars':
        return <BarsVariant />;
      case 'ripple':
        return <RippleVariant />;
      case 'square':
        return <SquareVariant />;
      case 'grid':
        return <GridVariant />;
      case 'spinner':
      default:
        return <SpinnerVariant />;
    }
  };

  const LoaderComponent = () => (
    <div className={`flex flex-col items-center space-y-3 ${fullScreen ? 'justify-center' : ''}`}>
      {getVariantComponent()}
      {showLabel && (
        <div className={`text-sm font-medium ${colorClasses[color]} animate-pulse`}>
          {label}
        </div>
      )}
    </div>
  );

  // Full screen loader
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <LoaderComponent />
      </div>
    );
  }

  return <LoaderComponent />;
};

// Skeleton loading component
export const SkeletonLoader = ({ 
  lines = 3, 
  width = 'full',
  height = 'h-4',
  className = '',
  avatar = false,
  card = false 
}) => {
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '1/4': 'w-1/4'
  };

  if (card) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-4">
            {avatar && <div className="w-12 h-12 bg-gray-300 rounded-full" />}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4" />
              <div className="h-3 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            {[...Array(lines)].map((_, i) => (
              <div 
                key={i}
                className={`${height} bg-gray-300 rounded ${
                  i === lines - 1 ? 'w-2/3' : 'w-full'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {avatar && (
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      )}
      
      {[...Array(lines)].map((_, i) => (
        <div 
          key={i}
          className={`${height} bg-gray-200 rounded ${
            typeof width === 'string' 
              ? widthClasses[width] || width
              : i === lines - 1 
                ? 'w-2/3' 
                : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

// Button loading state
export const ButtonLoader = ({ 
  size = 'sm',
  color = 'white',
  className = '' 
}) => (
  <LoadingSpinner 
    size={size}
    color={color}
    variant="spinner"
    className={className}
  />
);

// Inline loading component
export const InlineLoader = ({ 
  text = 'Loading',
  size = 'sm',
  color = 'primary'
}) => (
  <div className="flex items-center space-x-2">
    <LoadingSpinner size={size} color={color} variant="dots" />
    <span className="text-sm text-gray-600">{text}</span>
  </div>
);

// Page loading component
export const PageLoader = ({ 
  title = 'Loading Page',
  subtitle = 'Please wait while we prepare your content'
}) => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
    <div className="text-center space-y-6 p-8">
      <div className="w-16 h-16 mx-auto">
        <LoadingSpinner size="xl" color="primary" variant="ripple" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>
      <div className="flex justify-center space-x-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// Chart loading placeholder
export const ChartLoader = ({ height = 'h-64' }) => (
  <div className={`${height} bg-gray-50 rounded-lg p-6 animate-pulse`}>
    <div className="h-full flex items-end space-x-2">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-200 rounded-sm"
          style={{ 
            height: `${Math.random() * 60 + 40}%`,
            animationDelay: `${i * 100}ms`
          }}
        />
      ))}
    </div>
  </div>
);

export default LoadingSpinner;