import React from 'react';
import { Menu, TrendingUp, Home, List, BarChart3, Wallet, Settings, User, Bell } from 'lucide-react';

const Header = ({ 
  activeTab, 
  onTabChange, 
  onMobileMenuToggle, 
  navItems = [],
  notifications = [],
  user = null 
}) => {
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

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-xl relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-tight">ExpenseFlow</h1>
                <p className="text-xs text-white/80 hidden md:block">Personal Finance Tracker</p>
              </div>
            </div>
          </div>

          {/* Center - Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const IconComponent = getIconComponent(item.icon);
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  aria-label={`Navigate to ${item.label}`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right side - User Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <button
                className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs font-medium">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="User menu"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-6 w-6 rounded-full border border-white/20"
                  />
                ) : (
                  <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center border border-white/20">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium">
                  {user?.name || 'User'}
                </span>
              </button>
            </div>

            {/* Settings */}
            <button
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Visible on smaller screens */}
        <div className="lg:hidden border-t border-white/20 py-3">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const IconComponent = getIconComponent(item.icon);
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-w-0 flex-shrink-0 ${
                    activeTab === item.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
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

      {/* Active Tab Indicator for Desktop */}
      <div className="hidden lg:block absolute bottom-0 left-0 right-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="flex space-x-1">
              {navItems.map((item) => (
                <div
                  key={item.id}
                  className={`h-1 transition-all duration-300 ${
                    activeTab === item.id
                      ? 'w-12 bg-white shadow-lg'
                      : 'w-6 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;