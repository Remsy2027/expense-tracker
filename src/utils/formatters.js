// Formatting utilities for ExpenseFlow

import { CURRENCIES } from './constants';

/**
 * Format currency values with proper locale and currency symbol
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

/**
 * Format numbers with proper thousand separators
 */
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
 * Format percentage values
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatCompactNumber = (number) => {
  const abs = Math.abs(number);
  const sign = number < 0 ? '-' : '';
  
  if (abs >= 1e9) {
    return `${sign}${(abs / 1e9).toFixed(1)}B`;
  } else if (abs >= 1e6) {
    return `${sign}${(abs / 1e6).toFixed(1)}M`;
  } else if (abs >= 1e3) {
    return `${sign}${(abs / 1e3).toFixed(1)}K`;
  }
  
  return `${sign}${abs}`;
};

/**
 * Format date values with various formats
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
    'MMMM': dateObj.toLocaleDateString(locale, { month: 'long' }),
    'HH': dateObj.getHours().toString().padStart(2, '0'),
    'mm': dateObj.getMinutes().toString().padStart(2, '0'),
    'ss': dateObj.getSeconds().toString().padStart(2, '0')
  };

  return format.replace(/dd|MM|yyyy|MMM|MMMM|HH|mm|ss/g, match => formatMap[match] || match);
};

/**
 * Format time values
 */
export const formatTime = (date, format = '12h', locale = 'en-IN') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }

  const options = format === '24h' 
    ? { hour: '2-digit', minute: '2-digit', hour12: false }
    : { hour: '2-digit', minute: '2-digit', hour12: true };

  return dateObj.toLocaleTimeString(locale, options);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date, locale = 'en-IN') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
};

/**
 * Format file sizes
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format duration in milliseconds to human readable format
 */
export const formatDuration = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Format phone numbers
 */
export const formatPhoneNumber = (phoneNumber, format = 'indian') => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (format === 'indian') {
    // Indian phone number format: +91 XXXXX XXXXX
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
  }
  
  return phoneNumber; // Return original if no format matches
};

/**
 * Format transaction references/IDs
 */
export const formatTransactionId = (id, prefix = 'TXN') => {
  return `${prefix}${String(id).padStart(8, '0')}`;
};

/**
 * Format account numbers (mask sensitive info)
 */
export const formatAccountNumber = (accountNumber, showLast = 4) => {
  if (!accountNumber) return '';
  
  const str = String(accountNumber);
  if (str.length <= showLast) return str;
  
  const masked = '*'.repeat(str.length - showLast);
  const visible = str.slice(-showLast);
  
  return `${masked}${visible}`;
};

/**
 * Format text with proper capitalization
 */
export const formatProperCase = (text) => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format text for display (truncate with ellipsis)
 */
export const formatTruncateText = (text, maxLength = 50, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Format arrays as readable lists
 */
export const formatList = (items, conjunction = 'and', locale = 'en-IN') => {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  const last = items[items.length - 1];
  const rest = items.slice(0, -1);
  
  return `${rest.join(', ')}, ${conjunction} ${last}`;
};

/**
 * Format error messages for display
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unexpected error occurred';
};

/**
 * Format form field names for display
 */
export const formatFieldName = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
};

/**
 * Format validation messages
 */
export const formatValidationMessage = (field, rule, value) => {
  const fieldName = formatFieldName(field);
  
  switch (rule) {
    case 'required':
      return `${fieldName} is required`;
    case 'min':
      return `${fieldName} must be at least ${value}`;
    case 'max':
      return `${fieldName} must not exceed ${value}`;
    case 'minLength':
      return `${fieldName} must be at least ${value} characters`;
    case 'maxLength':
      return `${fieldName} must not exceed ${value} characters`;
    case 'email':
      return `${fieldName} must be a valid email address`;
    case 'pattern':
      return `${fieldName} format is invalid`;
    default:
      return `${fieldName} is invalid`;
  }
};

/**
 * Format API responses for display
 */
export const formatApiResponse = (response) => {
  if (response?.data) return response.data;
  if (response?.result) return response.result;
  return response;
};

/**
 * Format search queries
 */
export const formatSearchQuery = (query) => {
  return query
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' '); // Normalize whitespace
};

/**
 * Format sort keys for display
 */
export const formatSortKey = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

export default {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatCompactNumber,
  formatDate,
  formatTime,
  formatRelativeTime,
  formatFileSize,
  formatDuration,
  formatPhoneNumber,
  formatTransactionId,
  formatAccountNumber,
  formatProperCase,
  formatTruncateText,
  formatList,
  formatErrorMessage,
  formatFieldName,
  formatValidationMessage,
  formatApiResponse,
  formatSearchQuery,
  formatSortKey
};