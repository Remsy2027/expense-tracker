import React, { useEffect } from "react";
import {
  X,
  Home,
  List,
  BarChart3,
  Wallet,
  Settings,
  Moon,
  Sun,
  User,
} from "lucide-react";

const MobileMenu = ({
  isOpen,
  onClose,
  navItems = [],
  activeTab,
  onTabChange,
  user = null,
  theme = "light",
  onThemeToggle,
}) => {
  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const getIconComponent = (iconName) => {
    const icons = {
      Home,
      List,
      BarChart3,
      Wallet,
      Settings,
    };
    return icons[iconName] || Home;
  };

  const handleTabChange = (tabId) => {
    onTabChange(tabId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Clean Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Clean Menu Panel */}
      <div className="fixed inset-y-0 left-0 w-80 max-w-sm bg-white shadow-2xl">
        <div className="flex flex-col h-full">
          
          {/* Clean Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">ExpenseFlow</h2>
                <p className="text-xs text-gray-500">Personal Finance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Clean User Info */}
          {user && (
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-12 w-12 rounded-2xl"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Clean Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-4 space-y-2">
              {navItems.map((item) => {
                const IconComponent = getIconComponent(item.icon);
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Clean Settings Section */}
          <div className="border-t border-gray-100 p-4">
            <div className="space-y-2">
              <button
                onClick={() => {
                  onThemeToggle?.();
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 text-gray-700 hover:bg-gray-100"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <Sun className="h-5 w-5 flex-shrink-0" />
                )}
                <span className="font-medium">
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </span>
              </button>

              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 text-gray-700 hover:bg-gray-100">
                <Settings className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">Settings</span>
              </button>
            </div>
          </div>

          {/* Clean Footer */}
          <div className="border-t border-gray-100 p-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">ExpenseFlow v1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;