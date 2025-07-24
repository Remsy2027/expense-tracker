import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Edit3, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff,
  MoreVertical,
  Calendar,
  Tag,
  DollarSign,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { CATEGORIES } from '../../utils/constants';

const TransactionList = ({ 
  type, 
  title, 
  data = [], 
  onDelete, 
  onEdit,
  onDuplicate,
  emptyMessage = "No transactions found",
  showSearch = true,
  showFilter = true,
  showSort = true,
  compact = false,
  className = ""
}) => {
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('time');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Get category colors
  const getCategoryColor = (categoryName) => {
    const category = CATEGORIES.find(cat => cat.name === categoryName);
    return category?.color || '#6b7280';
  };

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const searchFields = type === 'income' 
          ? [item.source]
          : [item.description, item.category];
        
        return searchFields.some(field => 
          field?.toLowerCase().includes(term)
        );
      });
    }

    // Apply category filter
    if (filterCategory && type === 'expenses') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'name':
          aValue = type === 'income' ? a.source : a.description;
          bValue = type === 'income' ? b.source : b.description;
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        case 'time':
        default:
          aValue = new Date(a.createdAt || Date.now());
          bValue = new Date(b.createdAt || Date.now());
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, filterCategory, sortBy, sortOrder, type]);

  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Handle item selection
  const handleItemSelect = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.size === processedData.length) {
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedItems(new Set(processedData.map(item => item.id)));
      setShowBulkActions(true);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedItems.size} selected transactions?`)) {
      selectedItems.forEach(id => onDelete(id));
      setSelectedItems(new Set());
      setShowBulkActions(false);
    }
  };

  // Action menu component
  const ActionMenu = ({ item, onClose }) => (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
      {onEdit && (
        <button
          onClick={() => { onEdit(item); onClose(); }}
          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <Edit3 className="h-4 w-4" />
          <span>Edit</span>
        </button>
      )}
      {onDuplicate && (
        <button
          onClick={() => { onDuplicate(item); onClose(); }}
          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <Copy className="h-4 w-4" />
          <span>Duplicate</span>
        </button>
      )}
      <button
        onClick={() => { onDelete(item.id); onClose(); }}
        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete</span>
      </button>
    </div>
  );

  const TransactionItem = ({ item, index }) => {
    const [showActions, setShowActions] = useState(false);
    const isSelected = selectedItems.has(item.id);

    return (
      <div 
        className={`relative group transition-all duration-200 ${
          compact ? 'p-3' : 'p-4'
        } ${
          isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white hover:bg-gray-50'
        } ${
          index !== processedData.length - 1 ? 'border-b border-gray-200' : ''
        }`}
      >
        <div className={`grid gap-4 items-center ${
          compact 
            ? 'grid-cols-[auto_1fr_auto_auto]' 
            : 'grid-cols-[auto_1fr_auto_auto_auto]'
        }`}>
          {/* Selection checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleItemSelect(item.id)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />

          {/* Transaction details */}
          <div className="min-w-0">
            <div className="flex items-center space-x-3">
              {/* Category icon/color */}
              {type === 'expenses' && (
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getCategoryColor(item.category) }}
                />
              )}
              
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">
                  {type === 'income' ? item.source : item.description}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{item.time}</span>
                  {type === 'expenses' && (
                    <>
                      <span>•</span>
                      <Tag className="h-3 w-3" />
                      <span>{item.category}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Category badge (non-compact) */}
          {!compact && type === 'expenses' && (
            <div>
              <span 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: getCategoryColor(item.category) }}
              >
                {item.category}
              </span>
            </div>
          )}

          {/* Amount */}
          <div className="text-right">
            <p className={`font-semibold ${
              type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
            </p>
          </div>

          {/* Actions */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {showActions && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowActions(false)}
                />
                <ActionMenu 
                  item={item} 
                  onClose={() => setShowActions(false)} 
                />
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">
              {processedData.length} transaction{processedData.length !== 1 ? 's' : ''}
              {data.length !== processedData.length && ` (${data.length} total)`}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {showSearch && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Filter className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        {showFilters && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${type}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              {/* Category filter for expenses */}
              {type === 'expenses' && (
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Sort options */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="time-desc">Newest First</option>
                <option value="time-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                {type === 'expenses' && (
                  <option value="category-asc">Category A-Z</option>
                )}
              </select>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-700">
                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => {
                    setSelectedItems(new Set());
                    setShowBulkActions(false);
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative">
        {processedData.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {type === 'income' ? (
                <DollarSign className="h-8 w-8 text-gray-400" />
              ) : (
                <Tag className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          <>
            {/* Select all header */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedItems.size === processedData.length && processedData.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select all transactions
                </span>
              </label>
            </div>

            {/* Transaction list */}
            <div className="max-h-96 overflow-y-auto">
              {processedData.map((item, index) => (
                <TransactionItem 
                  key={item.id} 
                  item={item} 
                  index={index}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Total: {formatCurrency(processedData.reduce((sum, item) => sum + item.amount, 0))}
          </span>
          <span className="text-gray-500">
            {processedData.length} of {data.length} transactions
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;