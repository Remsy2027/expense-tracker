// src/components/settings/UserSettings.jsx
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  Eye, 
  EyeOff,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Clock,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

const UserSettings = () => {
  const { user, updateProfile, apiCall } = useAuth();
  const { addNotification } = useNotifications();
  
  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
    location: user?.location || '',
    timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  // App Preferences  
  const [preferences, setPreferences] = useState({
    currency: 'INR',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '12h',
    theme: 'light',
    language: 'en',
    startOfWeek: 'monday',
    defaultCategory: 'Other',
    showDecimals: true,
    compactMode: false,
    autoBackup: true,
    backupFrequency: 'weekly'
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    transactionAlerts: true,
    budgetWarnings: true,
    weeklyReports: true,
    monthlyReports: true,
    soundEffects: false,
    dailyReminders: false
  });

  // Privacy & Security
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    dataRetention: 365,
    allowAnalytics: true,
    shareUsageData: false,
    requirePasswordForExport: true,
    autoLockTimeout: 15
  });

  // Backup & Data
  const [dataSettings, setDataSettings] = useState({
    autoBackup: true,
    backupLocation: 'local',
    compressionEnabled: true,
    includeImages: true,
    maxBackups: 10,
    backupPassword: ''
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load settings on mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    setIsLoading(true);
    try {
      const response = await apiCall('/api/settings/user');
      if (response.settings) {
        const settings = response.settings;
        setPreferences(prev => ({ ...prev, ...settings.preferences }));
        setNotifications(prev => ({ ...prev, ...settings.notifications }));
        setSecurity(prev => ({ ...prev, ...settings.security }));
        setDataSettings(prev => ({ ...prev, ...settings.dataSettings }));
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to load settings'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const settingsData = {
        preferences,
        notifications,
        security,
        dataSettings
      };

      await apiCall('/api/settings/user', {
        method: 'PUT',
        body: JSON.stringify(settingsData)
      });

      addNotification({
        type: 'success',
        message: 'Settings saved successfully!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to save settings'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(profileData);
      addNotification({
        type: 'success',
        message: 'Profile updated successfully!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to update profile'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addNotification({
        type: 'error',
        message: 'New passwords do not match'
      });
      return;
    }

    setIsSaving(true);
    try {
      await apiCall('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
      
      addNotification({
        type: 'success',
        message: 'Password changed successfully!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message || 'Failed to change password'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await apiCall('/api/data/export', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const blob = new Blob([JSON.stringify(response, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenseflow-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        message: 'Data exported successfully!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to export data'
      });
    }
  };

  const importData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiCall('/api/data/import', {
        method: 'POST',
        body: formData
      });

      addNotification({
        type: 'success',
        message: `Data imported successfully! ${response.imported} items added.`
      });
      
      // Refresh the page to reload data
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to import data'
      });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Backup', icon: Database }
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, Country"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={profileData.timezone}
              onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
            rows={3}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Password Change Section */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Password</h3>
          <button
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showPasswordChange ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPasswordChange && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={changePassword}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveProfile}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">App Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Default Currency
            </label>
            <select
              value={preferences.currency}
              onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="INR">₹ Indian Rupee (INR)</option>
              <option value="USD">$ US Dollar (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
              <option value="GBP">£ British Pound (GBP)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="inline h-4 w-4 mr-1" />
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="es">Español (Spanish)</option>
              <option value="fr">Français (French)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Format
            </label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="dd/MM/yyyy">DD/MM/YYYY</option>
              <option value="MM/dd/yyyy">MM/DD/YYYY</option>
              <option value="yyyy-MM-dd">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Time Format
            </label>
            <select
              value={preferences.timeFormat}
              onChange={(e) => setPreferences(prev => ({ ...prev, timeFormat: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="12h">12 Hour (AM/PM)</option>
              <option value="24h">24 Hour</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette className="inline h-4 w-4 mr-1" />
              Theme
            </label>
            <select
              value={preferences.theme}
              onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Category
            </label>
            <select
              value={preferences.defaultCategory}
              onChange={(e) => setPreferences(prev => ({ ...prev, defaultCategory: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Food">🍽️ Food</option>
              <option value="Transport">🚗 Transport</option>
              <option value="Shopping">🛍️ Shopping</option>
              <option value="Other">📦 Other</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={preferences.showDecimals}
              onChange={(e) => setPreferences(prev => ({ ...prev, showDecimals: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show decimal places in amounts</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={preferences.compactMode}
              onChange={(e) => setPreferences(prev => ({ ...prev, compactMode: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Compact mode (show more items per page)</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Export Data</h4>
            <p className="text-sm text-gray-600">
              Download all your data in JSON format for backup or migration.
            </p>
            <button
              onClick={exportData}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Import Data</h4>
            <p className="text-sm text-gray-600">
              Import data from a previously exported JSON file.
            </p>
            <label className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>Import Data</span>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Settings</h3>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={dataSettings.autoBackup}
              onChange={(e) => setDataSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable automatic backups</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Frequency
              </label>
              <select
                value={preferences.backupFrequency}
                onChange={(e) => setPreferences(prev => ({ ...prev, backupFrequency: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keep Backups
              </label>
              <select
                value={dataSettings.maxBackups}
                onChange={(e) => setDataSettings(prev => ({ ...prev, maxBackups: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5 backups</option>
                <option value={10}>10 backups</option>
                <option value={30}>30 backups</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'preferences' && renderPreferencesTab()}
              {activeTab === 'data' && renderDataTab()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;