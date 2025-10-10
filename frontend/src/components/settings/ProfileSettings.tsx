import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Save, 
  Edit, 
  Camera,
  Key,
  Lock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileData {
  user_name: string;
  user_email: string;
  user_phone_number: string;
  user_department: string; // This will be the department ID
  user_role: string; // This will be the role ID
  is_active: boolean;
  created_at: string;
  last_login: string;
  department_name?: string; // This will be the department name for display
  role_name?: string; // This will be the role name for display
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}


const ProfileSettings: React.FC = () => {
  const { user, updateProfile, changePassword, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile data
  const [profileData, setProfileData] = useState<ProfileData>({
    user_name: '',
    user_email: '',
    user_phone_number: '',
    user_department: '',
    user_role: '',
    is_active: true,
    created_at: '',
    last_login: ''
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });


  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        user_name: user.user_name || '',
        user_email: user.user_email || '',
        user_phone_number: user.user_phone_number || '',
        user_department: user.user_department || '',
        user_role: user.user_role || '',
        is_active: user.is_active || true,
        created_at: user.created_at || '',
        last_login: user.last_login || '',
        department_name: user.department_name || user.user_department || '',
        role_name: user.role_name || user.user_role || ''
      });
    } else {
      // If no user data, try to refresh from server
      refreshProfile().catch(error => {
        console.error('Failed to refresh profile on mount:', error);
      });
    }
  }, [user, refreshProfile]);

  const handleProfileUpdate = async () => {
    try {
      setIsLoading(true);
      setMessage(null);

      await updateProfile({
        user_name: profileData.user_name,
        user_phone_number: profileData.user_phone_number,
        user_department: profileData.user_department
      });

      // Refresh user data from the server
      const refreshedUser = await refreshProfile();
      if (refreshedUser) {
        setProfileData({
          user_name: refreshedUser.user_name || '',
          user_email: refreshedUser.user_email || '',
          user_phone_number: refreshedUser.user_phone_number || '',
          user_department: refreshedUser.user_department || '',
          user_role: refreshedUser.user_role || '',
          is_active: refreshedUser.is_active || true,
          created_at: refreshedUser.created_at || '',
          last_login: refreshedUser.last_login || '',
          department_name: refreshedUser.department_name || refreshedUser.user_department || '',
          role_name: refreshedUser.role_name || refreshedUser.user_role || ''
        });
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setIsLoading(true);
      setMessage(null);

      if (securitySettings.newPassword !== securitySettings.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match.' });
        return;
      }

      if (securitySettings.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
        return;
      }

      await changePassword(securitySettings.currentPassword, securitySettings.newPassword);

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setSecuritySettings({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password. Please check your current password.' });
    } finally {
      setIsLoading(false);
    }
  };


  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
          </div>
          
          {message && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="mt-6 flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        {activeTab === 'profile' && (
          <ProfileTab
            profileData={profileData}
            setProfileData={setProfileData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isLoading={isLoading}
            onSave={handleProfileUpdate}
            getRoleBadgeColor={getRoleBadgeColor}
            formatDate={formatDate}
          />
        )}

        {activeTab === 'security' && (
          <SecurityTab
            securitySettings={securitySettings}
            setSecuritySettings={setSecuritySettings}
            isLoading={isLoading}
            onSave={handlePasswordChange}
          />
        )}

      </div>
    </div>
  );
};

// Profile Tab Component
interface ProfileTabProps {
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isLoading: boolean;
  onSave: () => void;
  getRoleBadgeColor: (role: string) => string;
  formatDate: (date: string) => string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  profileData,
  setProfileData,
  isEditing,
  setIsEditing,
  isLoading,
  onSave,
  getRoleBadgeColor,
  formatDate
}) => {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profileData.user_name.charAt(0).toUpperCase()}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{profileData.user_name}</h2>
              <p className="text-gray-600">{profileData.user_email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(profileData.role_name || profileData.user_role)}`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {profileData.role_name || profileData.user_role}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profileData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {profileData.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Member since {formatDate(profileData.created_at)}</p>
            <p>Last login: {formatDate(profileData.last_login)}</p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={profileData.user_name}
              onChange={(e) => setProfileData({ ...profileData, user_name: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={profileData.user_email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={profileData.user_phone_number}
              onChange={(e) => setProfileData({ ...profileData, user_phone_number: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              value={profileData.department_name || profileData.user_department}
              onChange={(e) => setProfileData({ ...profileData, user_department: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Security Tab Component
interface SecurityTabProps {
  securitySettings: SecuritySettings;
  setSecuritySettings: (settings: SecuritySettings) => void;
  isLoading: boolean;
  onSave: () => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({
  securitySettings,
  setSecuritySettings,
  isLoading,
  onSave
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Key className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              value={securitySettings.currentPassword}
              onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter current password"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={securitySettings.newPassword}
              onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter new password"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              value={securitySettings.confirmPassword}
              onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm new password"
            />
          </div>

          <button
            onClick={onSave}
            disabled={isLoading || !securitySettings.currentPassword || !securitySettings.newPassword || !securitySettings.confirmPassword}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Key className="w-4 h-4" />
            {isLoading ? 'Updating Password...' : 'Update Password'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Information</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• Your password should be at least 6 characters long</p>
          <p>• Use a combination of letters, numbers, and symbols for better security</p>
          <p>• Never share your password with anyone</p>
          <p>• Change your password regularly for better security</p>
        </div>
      </div>
    </div>
  );
};


export default ProfileSettings;
