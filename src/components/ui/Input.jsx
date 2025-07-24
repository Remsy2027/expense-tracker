import React, { forwardRef } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

export const Textarea = forwardRef(
  (
    {
      label,
      error,
      success,
      helperText,
      size = "md",
      fullWidth = false,
      className = "",
      disabled = false,
      required = false,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPasswordType = type === "password";
    const actualType = isPasswordType && showPassword ? "text" : type;

    const baseClasses =
      "block border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const sizeClasses = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-4 py-3 text-lg",
    };

    const stateClasses = error
      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
      : success
        ? "border-green-300 focus:border-green-500 focus:ring-green-500"
        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500";

    const widthClass = fullWidth ? "w-full" : "";
    const leftPadding = LeftIcon ? "pl-10" : "";
    const rightPadding = RightIcon || isPasswordType ? "pr-10" : "";

    const inputClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${stateClasses}
    ${widthClass}
    ${leftPadding}
    ${rightPadding}
    ${className}
  `
      .trim()
      .replace(/\s+/g, " ");

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LeftIcon className="h-5 w-5 text-gray-400" />
            </div>
          )}

          <input
            ref={ref}
            type={actualType}
            className={inputClasses}
            disabled={disabled}
            {...props}
          />

          {isPasswordType && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          )}

          {RightIcon && !isPasswordType && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <RightIcon className="h-5 w-5 text-gray-400" />
            </div>
          )}

          {(error || success) && !RightIcon && !isPasswordType && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
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

Textarea.displayName = "Textarea";

// Input group for combining inputs
export const InputGroup = ({ children, className = "" }) => (
  <div className={`flex ${className}`}>
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

// Number input with increment/decrement buttons
export const NumberInput = forwardRef(
  ({ min, max, step = 1, ...props }, ref) => {
    const [value, setValue] = React.useState(
      props.value || props.defaultValue || 0,
    );

    const increment = () => {
      const newValue = Number(value) + Number(step);
      if (max === undefined || newValue <= max) {
        setValue(newValue);
        props.onChange?.({ target: { value: newValue } });
      }
    };

    const decrement = () => {
      const newValue = Number(value) - Number(step);
      if (min === undefined || newValue >= min) {
        setValue(newValue);
        props.onChange?.({ target: { value: newValue } });
      }
    };

    const handleChange = (e) => {
      setValue(e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="pr-16"
          {...props}
        />
        <div className="absolute inset-y-0 right-0 flex flex-col">
          <button
            type="button"
            onClick={increment}
            className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border-l border-gray-300 rounded-tr-lg hover:bg-gray-50"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={decrement}
            className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border-l border-t border-gray-300 rounded-br-lg hover:bg-gray-50"
          >
            ▼
          </button>
        </div>
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";
