import React, { useState } from "react";
import {
  Edit3,
  Trash2,
  Copy,
  MoreVertical,
  Clock,
  Tag,
  DollarSign,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { CATEGORIES } from "../../utils/constants";

const TransactionItem = ({
  transaction,
  type,
  onEdit,
  onDelete,
  onDuplicate,
  isSelected = false,
  onSelect,
  showDetails = false,
  compact = false,
  className = "",
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    description: transaction.description || transaction.source || "",
    category: transaction.category || "Other",
    amount: transaction.amount || 0,
  });

  // Get category information
  const category = CATEGORIES.find((cat) => cat.name === transaction.category);
  const categoryColor = category?.color || "#6b7280";

  // Handle edit submission
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (onEdit) {
      onEdit(transaction.id, editForm);
      setIsEditing(false);
    }
  };

  // Handle menu actions
  const handleMenuAction = (action) => {
    setShowMenu(false);
    switch (action) {
      case "edit":
        setIsEditing(true);
        break;
      case "duplicate":
        onDuplicate && onDuplicate(transaction);
        break;
      case "delete":
        onDelete && onDelete(transaction.id);
        break;
    }
  };

  // Render editing form
  if (isEditing) {
    return (
      <div
        className={`p-4 border border-indigo-200 bg-indigo-50 rounded-lg ${className}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {type === "income" ? "Source" : "Description"}
              </label>
              <input
                type="text"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {type === "expenses" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    amount: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Render compact view
  if (compact) {
    return (
      <div
        className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
          isSelected
            ? "border-indigo-200 bg-indigo-50"
            : "border-gray-200 bg-white hover:bg-gray-50"
        } ${className}`}
      >
        {/* Selection checkbox */}
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(transaction.id)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
        )}

        {/* Category indicator */}
        {type === "expenses" && (
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: categoryColor }}
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {type === "income" ? transaction.source : transaction.description}
          </p>
          <p className="text-xs text-gray-500">
            {transaction.time}
            {type === "expenses" &&
              transaction.category &&
              ` • ${transaction.category}`}
          </p>
        </div>

        {/* Amount */}
        <p
          className={`font-semibold ${
            type === "income" ? "text-green-600" : "text-red-600"
          }`}
        >
          {type === "income" ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </p>

        {/* Actions menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <ActionMenu onAction={handleMenuAction} />
            </>
          )}
        </div>
      </div>
    );
  }

  // Render detailed view
  return (
    <div
      className={`group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
        isSelected ? "ring-2 ring-indigo-500 border-indigo-300" : ""
      } ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Selection checkbox */}
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(transaction.id)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
            )}

            {/* Transaction type indicator */}
            <div
              className={`p-2 rounded-lg ${
                type === "income" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <DollarSign
                className={`h-4 w-4 ${
                  type === "income" ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>

            {/* Main info */}
            <div>
              <h4 className="font-semibold text-gray-900">
                {type === "income"
                  ? transaction.source
                  : transaction.description}
              </h4>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{transaction.time}</span>
                {transaction.createdAt && (
                  <>
                    <span>•</span>
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(transaction.createdAt, "MMM dd")}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Amount and actions */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p
                className={`text-xl font-bold ${
                  type === "income" ? "text-green-600" : "text-red-600"
                }`}
              >
                {type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
              {type === "expenses" && transaction.category && (
                <p className="text-sm text-gray-500">{transaction.category}</p>
              )}
            </div>

            {/* Actions menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <ActionMenu onAction={handleMenuAction} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category badge for expenses */}
      {type === "expenses" && transaction.category && (
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: categoryColor }}
            >
              {category?.icon} {transaction.category}
            </span>
          </div>
        </div>
      )}

      {/* Details section */}
      {showDetails && (
        <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Transaction ID:</span>
              <p className="font-mono text-xs">{transaction.id}</p>
            </div>
            <div>
              <span className="font-medium">Created:</span>
              <p>
                {formatDate(
                  transaction.createdAt || Date.now(),
                  "dd MMM yyyy, HH:mm",
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center space-x-1">
          {onEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 rounded-lg shadow-sm hover:shadow transition-all duration-200"
              title="Edit transaction"
            >
              <Edit3 className="h-3 w-3" />
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(transaction)}
              className="p-1.5 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 rounded-lg shadow-sm hover:shadow transition-all duration-200"
              title="Duplicate transaction"
            >
              <Copy className="h-3 w-3" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(transaction.id)}
              className="p-1.5 bg-white border border-gray-200 text-gray-600 hover:text-red-600 rounded-lg shadow-sm hover:shadow transition-all duration-200"
              title="Delete transaction"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Action menu component
const ActionMenu = ({ onAction }) => (
  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
    <button
      onClick={() => onAction("edit")}
      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
    >
      <Edit3 className="h-4 w-4" />
      <span>Edit Transaction</span>
    </button>
    <button
      onClick={() => onAction("duplicate")}
      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
    >
      <Copy className="h-4 w-4" />
      <span>Duplicate</span>
    </button>
    <div className="border-t border-gray-100 my-1" />
    <button
      onClick={() => onAction("delete")}
      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
    >
      <Trash2 className="h-4 w-4" />
      <span>Delete</span>
    </button>
  </div>
);

// Skeleton loader for transaction items
export const TransactionItemSkeleton = ({ compact = false }) => (
  <div
    className={`animate-pulse ${compact ? "p-3" : "p-4"} border border-gray-200 rounded-lg`}
  >
    <div className="flex items-center space-x-3">
      <div className="w-4 h-4 bg-gray-200 rounded" />
      {!compact && <div className="w-8 h-8 bg-gray-200 rounded-lg" />}
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="h-6 bg-gray-200 rounded w-20" />
    </div>
  </div>
);

export default TransactionItem;
