import React from "react";
import {
  Menu,
  TrendingUp,
  Home,
  List,
  BarChart3,
  Wallet,
  Settings,
  User,
  Bell,
} from "lucide-react";

const Header = ({
  activeTab,
  onTabChange,
  onMobileMenuToggle,
  navItems = [],
  notifications = [],
  user = null,
}) => {
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

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="h-5 h-5 text-gray-600" />
            </button>

            {/* Clean Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                <TrendingUp className="h-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">ExpenseFlow</h1>
                <p className="text-xs text-gray-500 hidden md:block">
                  Personal Finance
                </p>
              </div>
            </div>
          </div>

          {/* Center - Clean Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => {
              const IconComponent = getIconComponent(item.icon);
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  aria-label={`Navigate to ${item.label}`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right side - Clean User Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button
              className="relative w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 h-5 text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-medium text-white">
                  {notifications.length > 9 ? "9+" : notifications.length}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-5 h-5 text-gray-600" />
            </button>

            {/* User Menu */}
            <button
              className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="User menu"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-xl"
                />
              ) : (
                <div className="h-8 w-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
              <span className="hidden md:block text-sm font-medium text-gray-900">
                {user?.name || "User"}
              </span>
            </button>
          </div>
        </div>

        {/* Clean Mobile Navigation */}
        <div className="lg:hidden border-t border-gray-100 py-3">
          <div className="flex items-center justify-between overflow-x-auto">
            {navItems.map((item) => {
              const IconComponent = getIconComponent(item.icon);
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 min-w-0 flex-shrink-0 ${
                    activeTab === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  aria-label={`Navigate to ${item.label}`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;