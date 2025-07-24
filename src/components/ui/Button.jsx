import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
  onClick,
  type = "button",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm hover:shadow-md",
    secondary:
      "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm hover:shadow-md",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md",
    warning:
      "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-sm hover:shadow-md",
    info: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md",
    outline:
      "bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    "outline-primary":
      "bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    link: "bg-transparent text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline focus:ring-indigo-500",
  };

  const sizes = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  const classes = `
    ${baseClasses}
    ${variants[variant] || variants.primary}
    ${sizes[size]}
    ${widthClass}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

// Compound components for common use cases
export const IconButton = ({
  icon: Icon,
  children,
  iconPosition = "left",
  ...props
}) => (
  <Button {...props}>
    {iconPosition === "left" && Icon && <Icon className="w-4 h-4 mr-2" />}
    {children}
    {iconPosition === "right" && Icon && <Icon className="w-4 h-4 ml-2" />}
  </Button>
);

export const LoadingButton = ({ loading, children, ...props }) => (
  <Button loading={loading} {...props}>
    {children}
  </Button>
);

export const ButtonGroup = ({ children, className = "" }) => (
  <div className={`inline-flex rounded-lg shadow-sm ${className}`} role="group">
    {React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;

      const isFirst = index === 0;
      const isLast = index === React.Children.count(children) - 1;

      return React.cloneElement(child, {
        className: `
          ${child.props.className || ""}
          ${!isFirst ? "-ml-px" : ""}
          ${!isFirst && !isLast ? "rounded-none" : ""}
          ${isFirst ? "rounded-r-none" : ""}
          ${isLast ? "rounded-l-none" : ""}
        `
          .trim()
          .replace(/\s+/g, " "),
      });
    })}
  </div>
);

export default Button;
