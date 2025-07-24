import React, { forwardRef } from "react";
import { ChevronDown, AlertCircle, CheckCircle, X } from "lucide-react";

const Select = forwardRef(
  (
    {
      label,
      error,
      success,
      helperText,
      options = [],
      placeholder = "Select an option",
      size = "md",
      fullWidth = false,
      className = "",
      disabled = false,
      required = false,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "block border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-white";

    const sizeClasses = {
      sm: "px-3 py-2 text-sm pr-8",
      md: "px-4 py-2 text-base pr-10",
      lg: "px-4 py-3 text-lg pr-10",
    };

    const stateClasses = error
      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
      : success
        ? "border-green-300 focus:border-green-500 focus:ring-green-500"
        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500";

    const widthClass = fullWidth ? "w-full" : "";

    const selectClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${stateClasses}
    ${widthClass}
    ${className}
  `
      .trim()
      .replace(/\s+/g, " ");

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={selectClasses}
            disabled={disabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option, index) => (
              <option
                key={option.value || index}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </div>

          {(error || success) && (
            <div className="absolute inset-y-0 right-8 flex items-center pr-2 pointer-events-none">
              {error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          )}
        </div>

        {(error || success || helperText) && (
          <div className="mt-2">
            {error && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </p>
            )}
            {success && !error && (
              <p className="text-sm text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                {success}
              </p>
            )}
            {helperText && !error && !success && (
              <p className="text-sm text-gray-600">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
