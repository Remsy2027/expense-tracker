// Application Constants for ExpenseFlow

// App Information
export const APP_INFO = {
  name: "ExpenseFlow",
  version: "1.0.0",
  description: "Personal Finance Tracker",
  author: "ExpenseFlow Team",
  website: "https://expenseflow.app",
  supportEmail: "support@expenseflow.app",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  DAILY_DATA: "expense-tracker-daily-data",
  SETTINGS: "expense-tracker-settings",
  CURRENT_DATE: "expense-tracker-current-date",
  LAST_BACKUP: "expense-tracker-last-backup",
  USER_PREFERENCES: "expense-tracker-user-preferences",
  THEME: "expense-tracker-theme",
  ACTIVE_TAB: "expense-tracker-active-tab",
  ONBOARDING: "expense-tracker-onboarding-completed",
  RECENT_TRANSACTIONS: "expense-tracker-recent-transactions",
};

// Expense Categories with metadata
export const CATEGORIES = [
  {
    id: "food",
    name: "Food",
    icon: "🍽️",
    color: "#ef4444",
    description: "Meals, groceries, dining out",
    subcategories: [
      "Groceries",
      "Restaurants",
      "Fast Food",
      "Coffee",
      "Delivery",
    ],
  },
  {
    id: "transport",
    name: "Transport",
    icon: "🚗",
    color: "#06b6d4",
    description: "Travel, fuel, public transport",
    subcategories: [
      "Fuel",
      "Public Transport",
      "Taxi/Ride Share",
      "Parking",
      "Vehicle Maintenance",
    ],
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: "🛍️",
    color: "#3b82f6",
    description: "Clothing, electronics, general shopping",
    subcategories: ["Clothing", "Electronics", "Home Goods", "Books", "Gifts"],
  },
  {
    id: "bills",
    name: "Bills",
    icon: "📄",
    color: "#10b981",
    description: "Utilities, subscriptions, recurring payments",
    subcategories: [
      "Electricity",
      "Water",
      "Internet",
      "Phone",
      "Subscriptions",
      "Insurance",
    ],
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: "🎬",
    color: "#f59e0b",
    description: "Movies, games, hobbies, fun activities",
    subcategories: [
      "Movies",
      "Games",
      "Sports",
      "Hobbies",
      "Events",
      "Streaming",
    ],
  },
  {
    id: "medical",
    name: "Medical",
    icon: "🏥",
    color: "#ec4899",
    description: "Healthcare, medicine, medical expenses",
    subcategories: [
      "Doctor Visits",
      "Medicine",
      "Dental",
      "Pharmacy",
      "Health Insurance",
    ],
  },
  {
    id: "education",
    name: "Education",
    icon: "📚",
    color: "#8b5cf6",
    description: "Learning, courses, books, education",
    subcategories: ["Courses", "Books", "Training", "Certification", "Tuition"],
  },
  {
    id: "other",
    name: "Other",
    icon: "📦",
    color: "#6b7280",
    description: "Miscellaneous expenses",
    subcategories: ["Personal Care", "Donations", "Fees", "Miscellaneous"],
  },
];

// Income Sources
export const INCOME_SOURCES = [
  {
    id: "salary",
    name: "Salary",
    icon: "💼",
    description: "Regular employment income",
    frequency: "monthly",
  },
  {
    id: "freelance",
    name: "Freelance",
    icon: "💻",
    description: "Freelance work income",
    frequency: "irregular",
  },
  {
    id: "business",
    name: "Business",
    icon: "🏢",
    description: "Business revenue",
    frequency: "irregular",
  },
  {
    id: "investment",
    name: "Investment",
    icon: "📈",
    description: "Returns from investments",
    frequency: "irregular",
  },
  {
    id: "rental",
    name: "Rental",
    icon: "🏠",
    description: "Rental property income",
    frequency: "monthly",
  },
  {
    id: "bonus",
    name: "Bonus",
    icon: "🎁",
    description: "Work bonuses and incentives",
    frequency: "irregular",
  },
  {
    id: "gift",
    name: "Gift",
    icon: "💝",
    description: "Money received as gifts",
    frequency: "irregular",
  },
  {
    id: "other",
    name: "Other",
    icon: "💰",
    description: "Other income sources",
    frequency: "irregular",
  },
];

// Currency Configuration
export const CURRENCIES = [
  {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    locale: "en-IN",
    decimals: 0,
  },
  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "en-US",
    decimals: 2,
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "de-DE",
    decimals: 2,
  },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    locale: "en-GB",
    decimals: 2,
  },
  {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    locale: "ja-JP",
    decimals: 0,
  },
  {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    locale: "en-CA",
    decimals: 2,
  },
];

// Date Formats
export const DATE_FORMATS = [
  { key: "dd/MM/yyyy", label: "DD/MM/YYYY", example: "31/12/2024" },
  { key: "MM/dd/yyyy", label: "MM/DD/YYYY", example: "12/31/2024" },
  { key: "yyyy-MM-dd", label: "YYYY-MM-DD", example: "2024-12-31" },
  { key: "dd-MM-yyyy", label: "DD-MM-YYYY", example: "31-12-2024" },
  { key: "MMM dd, yyyy", label: "MMM DD, YYYY", example: "Dec 31, 2024" },
  { key: "dd MMM yyyy", label: "DD MMM YYYY", example: "31 Dec 2024" },
];

// Theme Configuration
export const THEMES = [
  {
    id: "light",
    name: "Light",
    description: "Clean and bright interface",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Easy on the eyes in low light",
  },
  {
    id: "auto",
    name: "Auto",
    description: "Follows system preference",
  },
];

// Notification Settings
export const NOTIFICATION_SETTINGS = {
  DEFAULT_DURATION: 5000,
  ERROR_DURATION: 8000,
  SUCCESS_DURATION: 3000,
  WARNING_DURATION: 6000,
  MAX_NOTIFICATIONS: 5,
  POSITION: "top-right",
};

// Validation Rules
export const VALIDATION_RULES = {
  TRANSACTION_AMOUNT: {
    min: 0.01,
    max: 1000000,
    decimals: 2,
  },
  DESCRIPTION: {
    minLength: 1,
    maxLength: 100,
  },
  SOURCE: {
    minLength: 1,
    maxLength: 50,
  },
  DATE: {
    minDate: "2020-01-01",
    maxDate: "2030-12-31",
  },
};

// API Configuration (for future use)
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:3001",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Chart Configuration
export const CHART_CONFIG = {
  COLORS: {
    PRIMARY: "#6366f1",
    SUCCESS: "#10b981",
    DANGER: "#ef4444",
    WARNING: "#f59e0b",
    INFO: "#3b82f6",
    SECONDARY: "#6b7280",
  },
  DEFAULTS: {
    ANIMATION_DURATION: 750,
    GRID_COLOR: "#e5e7eb",
    TEXT_COLOR: "#374151",
    FONT_FAMILY: "Inter, sans-serif",
  },
};

// Export/Import Configuration
export const EXPORT_CONFIG = {
  FORMATS: ["json", "csv", "pdf"],
  DEFAULT_FORMAT: "json",
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_EXTENSIONS: [".json", ".csv"],
};

// Feature Flags
export const FEATURES = {
  DARK_MODE: true,
  EXPORT_DATA: true,
  IMPORT_DATA: true,
  BUDGET_GOALS: true,
  CATEGORIES: true,
  CHARTS: true,
  NOTIFICATIONS: true,
  BACKUP_RESTORE: true,
  MULTI_CURRENCY: false, // Future feature
  RECURRING_TRANSACTIONS: false, // Future feature
  FINANCIAL_GOALS: false, // Future feature
  EXPENSE_PREDICTIONS: false, // Future feature
};

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  LAZY_LOAD_THRESHOLD: 50,
  VIRTUAL_SCROLL_THRESHOLD: 100,
  MAX_TRANSACTIONS_PER_PAGE: 50,
  CHART_UPDATE_THROTTLE: 250,
};

// Accessibility Configuration
export const A11Y_CONFIG = {
  FOCUS_OUTLINE_WIDTH: "2px",
  FOCUS_OUTLINE_COLOR: "#6366f1",
  MIN_TOUCH_TARGET_SIZE: "44px",
  MIN_CONTRAST_RATIO: 4.5,
  REDUCED_MOTION_QUERY: "(prefers-reduced-motion: reduce)",
};

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  DASHBOARD: { key: "1", modifier: "ctrl" },
  TRANSACTIONS: { key: "2", modifier: "ctrl" },
  ANALYTICS: { key: "3", modifier: "ctrl" },
  BUDGET: { key: "4", modifier: "ctrl" },
  ADD_INCOME: { key: "i", modifier: "ctrl" },
  ADD_EXPENSE: { key: "e", modifier: "ctrl" },
  SEARCH: { key: "/", modifier: "ctrl" },
  ESCAPE: { key: "Escape" },
  ENTER: { key: "Enter" },
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: "An unexpected error occurred. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  VALIDATION: "Please check your input and try again.",
  STORAGE: "Failed to save data. Please try again.",
  IMPORT: "Failed to import data. Please check the file format.",
  EXPORT: "Failed to export data. Please try again.",
  DELETE: "Failed to delete item. Please try again.",
  UPDATE: "Failed to update item. Please try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  TRANSACTION_ADDED: "Transaction added successfully!",
  TRANSACTION_UPDATED: "Transaction updated successfully!",
  TRANSACTION_DELETED: "Transaction deleted successfully!",
  DATA_EXPORTED: "Data exported successfully!",
  DATA_IMPORTED: "Data imported successfully!",
  SETTINGS_SAVED: "Settings saved successfully!",
  BACKUP_CREATED: "Backup created successfully!",
};

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  CURRENCY: /^\d+(\.\d{1,2})?$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  SPECIAL_CHARS: /[!@#$%^&*(),.?":{}|<>]/,
};

// Default Settings
export const DEFAULT_SETTINGS = {
  currency: "INR",
  dateFormat: "dd/MM/yyyy",
  theme: "light",
  notifications: true,
  autoBackup: true,
  defaultCategory: "Other",
  chartAnimations: true,
  soundEffects: false,
  compactMode: false,
  showDecimalPlaces: true,
  groupTransactionsByDate: true,
  enableKeyboardShortcuts: true,
};

// Quick Actions
export const QUICK_ACTIONS = [
  {
    id: "add-income",
    label: "Add Income",
    icon: "💰",
    shortcut: "Ctrl+I",
    category: "transaction",
  },
  {
    id: "add-expense",
    label: "Add Expense",
    icon: "💸",
    shortcut: "Ctrl+E",
    category: "transaction",
  },
  {
    id: "view-analytics",
    label: "View Analytics",
    icon: "📊",
    shortcut: "Ctrl+3",
    category: "navigation",
  },
  {
    id: "export-data",
    label: "Export Data",
    icon: "📥",
    shortcut: "Ctrl+Shift+E",
    category: "data",
  },
];

// Transaction Templates (for future use)
export const TRANSACTION_TEMPLATES = {
  COMMON_EXPENSES: [
    { description: "Coffee", category: "Food", amount: 150 },
    { description: "Lunch", category: "Food", amount: 300 },
    { description: "Petrol", category: "Transport", amount: 500 },
    { description: "Grocery", category: "Food", amount: 1000 },
    { description: "Movie Ticket", category: "Entertainment", amount: 200 },
  ],
  COMMON_INCOME: [
    { source: "Salary", amount: 50000 },
    { source: "Freelance Project", amount: 15000 },
    { source: "Investment Return", amount: 5000 },
  ],
};

// Budget Categories (for future budget feature)
export const BUDGET_CATEGORIES = [
  {
    name: "Essential",
    percentage: 50,
    description: "Needs like food, housing, utilities",
  },
  {
    name: "Discretionary",
    percentage: 30,
    description: "Wants like entertainment, shopping",
  },
  {
    name: "Savings",
    percentage: 20,
    description: "Emergency fund, investments, goals",
  },
];

export default {
  APP_INFO,
  STORAGE_KEYS,
  CATEGORIES,
  INCOME_SOURCES,
  CURRENCIES,
  DATE_FORMATS,
  THEMES,
  NOTIFICATION_SETTINGS,
  VALIDATION_RULES,
  API_CONFIG,
  CHART_CONFIG,
  EXPORT_CONFIG,
  FEATURES,
  PERFORMANCE_CONFIG,
  A11Y_CONFIG,
  KEYBOARD_SHORTCUTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REGEX_PATTERNS,
  DEFAULT_SETTINGS,
  QUICK_ACTIONS,
  TRANSACTION_TEMPLATES,
  BUDGET_CATEGORIES,
};
