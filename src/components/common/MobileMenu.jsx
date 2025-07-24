import React, { useEffect } from 'react';
import { X, Home, List, BarChart3, Wallet, Settings, HelpCircle, Download, Upload, Moon, Sun, User } from 'lucide-react';

const MobileMenu = ({ 
  isOpen, 
  onClose, 
  navItems = [], 
  activeTab, 
  onTabChange,
  user = null,
  theme = 'light',
  onThemeToggle,
  onExportData,
  onImportData
}) => {
  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const getIconComponent = (iconName) => {
    const icons = {
      Home,
      List,
      BarChart3,
      Wallet,
      Settings
    };
    return icons[iconName] || Home;
  };

  const handleTabChange = (tabId) => {
    onTabChange(tabId);
    onClose();
  };

  const menuItems = [
    ...navItems.map(item => ({
      ...item,
      type: 'navigation'
    })),
    { 
      id: 'divider-1', 
      type: 'divider' 
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: 'Download',
      type: 'action',
      action: () => {
        onExportData?.();
        onClose();
      }
    },
    {
      id: 'import',
      label: 'Import Data',
      icon: 'Upload',
      type: 'action',
      action: () => {
        onImportData?.();
        onClose();
      }
    },
    { 
      id: 'divider-2', 
      type: 'divider' 
    },
    {
      id: 'theme',
      label: theme === 'light' ? 'Dark Mode' : 'Light Mode',
      icon: theme === 'light' ? 'Moon' : 'Sun',
      type: 'action',
      action: () => {
        onThemeToggle?.();
      }
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: 'HelpCircle',
      type: 'action',
      action: () => {
        // Open help modal or navigate to help page
        onClose();
      }
    }
  ];

  const getActionIcon = (iconName) => {
    const icons = {
      Download,
      Upload,
      Moon,
      Sun,
      HelpCircle
    };
    return icons[iconName] || HelpCircle;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div className="fixed inset-y-0 left-0 w-80 max-w-sm bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">ExpenseFlow</h2>
                <p className="text-xs text-white/80">Personal Finance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-12 w-12 rounded-full border-2 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-4 space-y-1">
              {menuItems.map((item) => {
                if (item.type === 'divider') {
                  return (
                    <div 
                      key={item.id} 
                      className="border-t border-gray-200 dark:border-gray-700 my-4" 
                    />
                  );
                }

                if (item.type === 'navigation') {
                  const IconComponent = getIconComponent(item.icon);
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <IconComponent className={`h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.label}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full flex-shrink-0" />
                      )}
                    </button>
                  );
                }

                if (item.type === 'action') {
                  const IconComponent = getActionIcon(item.icon);

                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    >
                      <IconComponent className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                }

                return null;
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ExpenseFlow v1.0.0
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Made with ❤️ for better finances
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;