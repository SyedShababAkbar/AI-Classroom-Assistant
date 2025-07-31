import React, { useState, useEffect } from 'react';
import { Mail, MessageCircle, Bell, User, Moon, Sun, TestTube } from 'lucide-react';
import { UserSettings } from '../../types';

const defaultSettings: UserSettings = {
  name: '',
  email: '',
  studentId: '',
  theme: 'light',
  notificationPreferences: 'email',
};

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('userSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleSave = async () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    try {
      await fetch("http://localhost:5000/api/settings/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: settings.email })
      });
    } catch (err) {
      console.error("Failed to update receiver email:", err);
    }
  };


  const handleTestNotification = () => {
    alert('Test notification sent successfully!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and notifications</p>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-800">Settings saved successfully!</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Profile */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
              <input
                type="text"
                value={settings.studentId}
                onChange={(e) => setSettings({ ...settings, studentId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <Bell className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Notification Channels</label>
              <div className="space-y-3">
                {(['email', 'whatsapp', 'both'] as const).map((option) => (
                  <label key={option} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="notifications"
                      value={option}
                      checked={settings.notificationPreferences === option}
                      onChange={(e) =>
                        setSettings({ ...settings, notificationPreferences: e.target.value as UserSettings['notificationPreferences'] })
                      }
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    {option === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
                    {option === 'whatsapp' && <MessageCircle className="w-5 h-5 text-green-600" />}
                    {option === 'both' && <Bell className="w-5 h-5 text-purple-600" />}
                    <span className="text-sm text-gray-700 capitalize">{option} only</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleTestNotification}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <TestTube className="w-5 h-5" />
              Test Notification
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            {settings.theme === 'dark' ? (
              <Moon className="w-6 h-6 text-blue-600" />
            ) : (
              <Sun className="w-6 h-6 text-blue-600" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">Theme Preference</h2>
          </div>

          <div className="space-y-3">
            {(['light', 'dark'] as const).map((theme) => (
              <label key={theme} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="theme"
                  value={theme}
                  checked={settings.theme === theme}
                  onChange={(e) =>
                    setSettings({ ...settings, theme: e.target.value as UserSettings['theme'] })
                  }
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-yellow-600" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
                <span className="text-sm text-gray-700 capitalize">{theme} Mode</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
