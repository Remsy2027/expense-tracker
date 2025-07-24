import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  DollarSign,
  Calendar,
  Tag,
  FileText,
  User,
  Save,
  X,
  Clock,
  Calculator,
  Repeat,
} from "lucide-react";
import { CATEGORIES, INCOME_SOURCES } from "../../utils/constants";
import { validateTransaction, formatCurrency } from "../../utils/helpers";

const AddTransactionForm = ({
  type = "expense",
  onSubmit,
  onCancel,
  initialData = null,
  isVisible = true,
  autoFocus = false,
  showDatePicker = false,
  templates = [],
  className = "",
}) => {
  // Form state
  const [formData, setFormData] = useState({
    description: initialData?.description || initialData?.source || "",
    category: initialData?.category || (type === "expense" ? "Food" : ""),
    amount: initialData?.amount || "",
    source: initialData?.source || "",
    date: initialData?.date || new Date().toISOString().split("T")[0],
    notes: initialData?.notes || "",
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorValue, setCalculatorValue] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  // Refs
  const firstInputRef = useRef(null);
  const formRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (autoFocus && isVisible && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [autoFocus, isVisible]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    const validation = validateTransaction(formData, type);
    if (!validation.isValid) {
      const fieldErrors = {};
      validation.errors.forEach((error) => {
        if (error.includes("Amount")) fieldErrors.amount = error;
        else if (error.includes("description") || error.includes("source")) {
          fieldErrors[type === "expense" ? "description" : "source"] = error;
        } else fieldErrors.general = error;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      const result = await onSubmit(transactionData);

      if (result && result.success) {
        // Reset form on success
        setFormData({
          description: "",
          category: type === "expense" ? "Food" : "",
          amount: "",
          source: "",
          date: new Date().toISOString().split("T")[0],
          notes: "",
        });
      }
    } catch (error) {
      setErrors({ general: "Failed to save transaction. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field-specific errors
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle calculator
  const handleCalculatorResult = (value) => {
    setFormData((prev) => ({ ...prev, amount: value.toString() }));
    setCalculatorValue("");
    setShowCalculator(false);
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setFormData((prev) => ({
      ...prev,
      ...template,
      date: prev.date, // Keep current date
    }));
    setShowTemplates(false);
  };

  // Quick amount buttons
  const quickAmounts = [50, 100, 200, 500, 1000, 2000];

  if (!isVisible) return null;

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div
        className={`px-6 py-4 ${
          type === "income"
            ? "bg-gradient-to-r from-green-500 to-green-600"
            : "bg-gradient-to-r from-red-500 to-red-600"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Add {type === "income" ? "Income" : "Expense"}
              </h3>
              <p className="text-white/80 text-sm">
                {type === "income"
                  ? "Record your earnings"
                  : "Track your spending"}
              </p>
            </div>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Templates */}
        {templates.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">
                Quick Templates
              </h4>
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                {showTemplates ? "Hide" : "Show"} Templates
              </button>
            </div>

            {showTemplates && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-sm text-gray-900">
                      {type === "income"
                        ? template.source
                        : template.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(template.amount)}
                      {type === "expense" &&
                        template.category &&
                        ` • ${template.category}`}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Description/Source */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === "income" ? (
                <>
                  <User className="inline h-4 w-4 mr-1" />
                  Income Source
                </>
              ) : (
                <>
                  <FileText className="inline h-4 w-4 mr-1" />
                  Description
                </>
              )}
            </label>

            {type === "income" ? (
              <select
                ref={firstInputRef}
                value={formData.source}
                onChange={(e) => handleInputChange("source", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.source ? "border-red-300" : "border-gray-300"
                }`}
                required
              >
                <option value="">Select income source</option>
                {INCOME_SOURCES.map((source) => (
                  <option key={source.id} value={source.name}>
                    {source.icon} {source.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                ref={firstInputRef}
                type="text"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                  errors.description ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Lunch, Grocery, Gas bill"
                required
              />
            )}

            {(errors.source || errors.description) && (
              <p className="mt-1 text-sm text-red-600">
                {errors.source || errors.description}
              </p>
            )}
          </div>

          {/* Category (for expenses only) */}
          {type === "expense" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                {CATEGORIES.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount */}
          <div className={type === "expense" ? "" : "md:col-span-2"}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Amount (₹)
            </label>

            <div className="space-y-3">
              {/* Amount input */}
              <div className="relative">
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-${type === "income" ? "green" : "red"}-500 focus:border-transparent transition-colors ${
                    errors.amount ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  title="Open calculator"
                >
                  <Calculator className="h-4 w-4" />
                </button>
              </div>

              {/* Quick amount buttons */}
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() =>
                      handleInputChange("amount", amount.toString())
                    }
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      type === "income"
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-red-50 text-red-700 hover:bg-red-100"
                    }`}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
            </div>

            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Date (if enabled) */}
          {showDatePicker && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Add any additional notes..."
            />
          </div>
        </div>

        {/* General error */}
        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>
              Current time:{" "}
              {new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.amount ||
                (!formData.description && !formData.source)
              }
              className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                type === "income"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Add {type === "income" ? "Income" : "Expense"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Simple Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Calculator</h3>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={calculatorValue}
                onChange={(e) => setCalculatorValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right font-mono"
                placeholder="Enter calculation"
              />

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    try {
                      const result = eval(calculatorValue);
                      handleCalculatorResult(result);
                    } catch {
                      alert("Invalid calculation");
                    }
                  }}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Calculate
                </button>
                <button
                  onClick={() => setCalculatorValue("")}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTransactionForm;
