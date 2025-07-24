import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  rounded = 'lg',
  border = true,
  hover = false,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  };

  const baseClasses = 'bg-white';
  const borderClass = border ? 'border border-gray-200' : '';
  const hoverClass = hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200' : '';
  
  const classes = `
    ${baseClasses}
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${roundedClasses[rounded]}
    ${borderClass}
    ${hoverClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ 
  children, 
  className = '',
  divider = true,
  ...props 
}) => {
  const borderClass = divider ? 'border-b border-gray-200 pb-4 mb-6' : '';
  
  return (
    <div className={`${borderClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ 
  children, 
  className = '',
  as: Component = 'h3',
  ...props 
}) => (
  <Component 
    className={`text-lg font-semibold text-gray-900 ${className}`} 
    {...props}
  >
    {children}
  </Component>
);

export const CardDescription = ({ 
  children, 
  className = '',
  ...props 
}) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ 
  children, 
  className = '',
  ...props 
}) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ 
  children, 
  className = '',
  divider = true,
  ...props 
}) => {
  const borderClass = divider ? 'border-t border-gray-200 pt-4 mt-6' : '';
  
  return (
    <div className={`${borderClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

// Specialized card variants
export const StatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'blue',
  className = '',
  ...props
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600'
  };

  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card hover className={`overflow-hidden ${className}`} {...props}>
      <div className={`bg-gradient-to-r ${colorClasses[color]} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          {Icon && (
            <div className="p-3 bg-white/20 rounded-lg">
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </div>
      {change && (
        <div className="px-6 py-4">
          <span className={`text-sm font-medium ${changeColors[changeType]}`}>
            {change}
          </span>
        </div>
      )}
    </Card>
  );
};

export const FeatureCard = ({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  className = '',
  ...props
}) => {
  const Component = href ? 'a' : 'div';
  const clickProps = href ? { href } : onClick ? { onClick } : {};
  const interactiveClass = (href || onClick) ? 'cursor-pointer hover:bg-gray-50' : '';

  return (
    <Card className={`${interactiveClass} ${className}`} {...props}>
      <Component className="block" {...clickProps}>
        {Icon && (
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <Icon className="h-6 w-6 text-indigo-600" />
          </div>
        )}
        <CardTitle className="mb-2">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </Component>
    </Card>
  );
};

export default Card;