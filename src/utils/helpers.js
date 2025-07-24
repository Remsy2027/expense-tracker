import { CURRENCIES, VALIDATION_RULES, CATEGORIES, DATE_FORMATS } from './constants';

/**
 * Currency formatting utilities
 */
export const formatCurrency = (amount, currencyCode = 'INR', options = {}) => {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  
  const defaultOptions = {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
    ...options
  };

  try {
    return new Intl.NumberFormat(currency.locale, defaultOptions).format(amount);
  } catch (error) {
    // Fallback formatting
    return `${currency.symbol}${Number(amount).toFixed(currency.decimals)}`;
  }
};

export const parseCurrency = (currencyString, currencyCode = 'INR') => {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  
  // Remove currency symbol and other non-numeric characters except decimal point
  const numericString = currencyString
    .replace(new RegExp(`[${currency.symbol}\\s,]`, 'g'), '')
    .replace(/[^\d.-]/g, '');
  
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatNumber = (number, options = {}) => {
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  };

  try {
    return new Intl.NumberFormat('en-IN', defaultOptions).format(number);
  } catch (error) {
    return Number(number).toFixed(defaultOptions.maximumFractionDigits);
  }
};

/**
 * Date formatting utilities
 */
export const formatDate = (date, format = 'dd/MM/yyyy', locale = 'en-IN') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const formatMap = {
    'dd': dateObj.getDate().toString().padStart(2, '0'),
    'MM': (dateObj.getMonth() + 1).toString().padStart(2, '0'),
    'yyyy': dateObj.getFullYear().toString(),
    'MMM': dateObj.toLocaleDateString(locale, { month: 'short' }),
    'MMMM': dateObj.toLocaleDateString(locale, { month: 'long' })
  };

  return format.replace(/dd|MM|yyyy|MMM|MMMM/g, match => formatMap[match] || match);
};

export const parseDate = (dateString, format = 'dd/MM/yyyy') => {
  const formatParts = format.split(/[\/\-\s]/);
  const dateParts = dateString.split(/[\/\-\s]/);
  
  if (formatParts.length !== dateParts.length) {
    return null;
  }

  const dateMap = {};
  formatParts.forEach((part, index) => {
    dateMap[part] = dateParts[index];
  });

  const year = parseInt(dateMap.yyyy);
  const month = parseInt(dateMap.MM) - 1; // JavaScript months are 0-indexed
  const day = parseInt(dateMap.dd);

  const date = new Date(year, month, day);
  
  // Validate the date
  if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
    return date;
  }
  
  return null;
};

export const getDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates = [];
  
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

export const isToday = (date) => {
  const today = new Date();
  const compareDate = new Date(date);
  
  return today.toDateString() === compareDate.toDateString();
};

export const isThisMonth = (date) => {
  const today = new Date();
  const compareDate = new Date(date);
  
  return today.getMonth() === compareDate.getMonth() && 
         today.getFullYear() === compareDate.getFullYear();
};

export const getDaysInMonth = (date) => {
  const dateObj = new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();
};

export const getStartOfMonth = (date) => {
  const dateObj = new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
};

export const getEndOfMonth = (date) => {
  const dateObj = new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
};

/**
 * Validation utilities
 */
export const validateTransaction = (transaction, type = 'expense') => {
  const errors = [];
  
  // Validate amount
  if (!transaction.amount || isNaN(parseFloat(transaction.amount))) {
    errors.push('Amount is required and must be a valid number');
  } else {
    const amount = parseFloat(transaction.amount);
    if (amount < VALIDATION_RULES.TRANSACTION_AMOUNT.min) {
      errors.push(`Amount must be at least ${VALIDATION_RULES.TRANSACTION_AMOUNT.min}`);
    }
    if (amount > VALIDATION_RULES.TRANSACTION_AMOUNT.max) {
      errors.push(`Amount cannot exceed ${VALIDATION_RULES.TRANSACTION_AMOUNT.max}`);
    }
  }

  // Validate description/source
  const textField = type === 'expense' ? 'description' : 'source';
  const text = transaction[textField];
  
  if (!text || text.trim().length === 0) {
    errors.push(`${textField.charAt(0).toUpperCase() + textField.slice(1)} is required`);
  } else {
    if (text.length < VALIDATION_RULES.DESCRIPTION.minLength) {
      errors.push(`${textField.charAt(0).toUpperCase() + textField.slice(1)} must be at least ${VALIDATION_RULES.DESCRIPTION.minLength} character`);
    }
    if (text.length > VALIDATION_RULES.DESCRIPTION.maxLength) {
      errors.push(`${textField.charAt(0).toUpperCase() + textField.slice(1)} cannot exceed ${VALIDATION_RULES.DESCRIPTION.maxLength} characters`);
    }
  }

  // Validate category (for expenses)
  if (type === 'expense' && transaction.category) {
    const validCategories = CATEGORIES.map(cat => cat.name);
    if (!validCategories.includes(transaction.category)) {
      errors.push('Invalid category selected');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateDate = (dateString) => {
  const date = new Date(dateString);
  const minDate = new Date(VALIDATION_RULES.DATE.minDate);
  const maxDate = new Date(VALIDATION_RULES.DATE.maxDate);
  
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }
  
  if (date < minDate) {
    return { isValid: false, error: `Date cannot be before ${formatDate(minDate)}` };
  }
  
  if (date > maxDate) {
    return { isValid: false, error: `Date cannot be after ${formatDate(maxDate)}` };
  }
  
  return { isValid: true };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeInput = (input, options = {}) => {
  const {
    allowSpecialChars = false,
    maxLength = 1000,
    trim = true
  } = options;

  let sanitized = String(input);
  
  if (trim) {
    sanitized = sanitized.trim();
  }
  
  if (!allowSpecialChars) {
    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>'"&]/g, '');
  }
  
  if (maxLength > 0) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

/**
 * Data processing utilities
 */
export const generateTrendData = (dailyData, currentDate, days = 7) => {
  const trendData = [];
  const endDate = new Date(currentDate);
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayData = dailyData[dateStr] || { income: [], expenses: [] };
    const income = dayData.income.reduce((sum, item) => sum + item.amount, 0);
    const expenses = dayData.expenses.reduce((sum, item) => sum + item.amount, 0);
    
    trendData.push({
      date: formatDate(date, 'MMM dd'),
      dateString: dateStr,
      income,
      expenses,
      balance: income - expenses
    });
  }
  
  return trendData;
};

export const calculateCategoryTotals = (expenses) => {
  return expenses.reduce((totals, expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    return totals;
  }, {});
};

export const getTopCategories = (categoryTotals, limit = 5) => {
  return Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: 0 // Will be calculated by caller if needed
    }));
};

export const calculateMonthlyStats = (dailyData, date) => {
  const targetDate = new Date(date);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  
  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  let activeDays = 0;
  const dailyTotals = [];
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = dailyData[dateStr] || { income: [], expenses: [] };
    
    const dayIncome = dayData.income.reduce((sum, item) => sum + item.amount, 0);
    const dayExpenses = dayData.expenses.reduce((sum, item) => sum + item.amount, 0);
    
    monthlyIncome += dayIncome;
    monthlyExpenses += dayExpenses;
    
    if (dayData.income.length > 0 || dayData.expenses.length > 0) {
      activeDays++;
    }
    
    dailyTotals.push({
      date: dateStr,
      income: dayIncome,
      expenses: dayExpenses,
      balance: dayIncome - dayExpenses,
      hasTransactions: dayData.income.length > 0 || dayData.expenses.length > 0
    });
  }
  
  return {
    monthlyIncome,
    monthlyExpenses,
    monthlySavings: monthlyIncome - monthlyExpenses,
    activeDays,
    daysInMonth,
    dailyTotals,
    averageDailyExpenses: activeDays > 0 ? monthlyExpenses / activeDays : 0,
    averageDailyIncome: activeDays > 0 ? monthlyIncome / activeDays : 0
  };
};

/**
 * Utility functions
 */
export const debounce = (func, wait, immediate) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

export const mergeDeep = (target, source) => {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

export const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const truncate = (str, length = 50, suffix = '...') => {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

export const randomColor = () => {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const getContrastColor = (hexColor) => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Local storage utilities
 */
export const safeLocalStorageGet = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Failed to get ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const safeLocalStorageSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to set ${key} in localStorage:`, error);
    return false;
  }
};

export const safeLocalStorageRemove = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove ${key} from localStorage:`, error);
    return false;
  }
};

/**
 * File utilities
 */
export const downloadFile = (data, filename, type = 'application/json') => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Chart data utilities
 */
export const prepareChartData = (data, type = 'line') => {
  switch (type) {
    case 'pie':
      return Object.entries(data).map(([name, value]) => ({
        name,
        value,
        percentage: ((value / Object.values(data).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
      }));
    
    case 'bar':
    case 'line':
    default:
      return Array.isArray(data) ? data : Object.entries(data).map(([name, value]) => ({
        name,
        value
      }));
  }
};

export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const formatPercentage = (value, decimals = 1) => {
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Search and filter utilities
 */
export const createSearchFilter = (searchTerm, fields) => {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return () => true;
  
  return (item) => {
    return fields.some(field => {
      const value = getNestedValue(item, field);
      return String(value).toLowerCase().includes(term);
    });
  };
};

export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = getNestedValue(a, key);
    const bVal = getNestedValue(b, key);
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = getNestedValue(item, key);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});
};

/**
 * Performance utilities
 */
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

export const memoize = (fn, getKey = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  return (...args) => {
    const key = getKey(...args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Export all utilities as default
export default {
  formatCurrency,
  parseCurrency,
  formatNumber,
  formatDate,
  parseDate,
  getDateRange,
  isToday,
  isThisMonth,
  getDaysInMonth,
  getStartOfMonth,
  getEndOfMonth,
  validateTransaction,
  validateDate,
  validateEmail,
  sanitizeInput,
  generateTrendData,
  calculateCategoryTotals,
  getTopCategories,
  calculateMonthlyStats,
  debounce,
  throttle,
  generateId,
  deepClone,
  mergeDeep,
  isObject,
  capitalize,
  slugify,
  truncate,
  randomColor,
  getContrastColor,
  safeLocalStorageGet,
  safeLocalStorageSet,
  safeLocalStorageRemove,
  downloadFile,
  readFileAsText,
  formatFileSize,
  prepareChartData,
  calculatePercentageChange,
  formatPercentage,
  createSearchFilter,
  getNestedValue,
  sortBy,
  groupBy,
  measurePerformance,
  memoize
};