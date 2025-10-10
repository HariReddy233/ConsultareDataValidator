import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';

interface User {
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: string; // This will be the role ID
  user_department?: string; // This will be the department ID
  user_phone_number?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  role_name?: string; // This will be the role name for display
  department_name?: string; // This will be the department name for display
}

interface Permission {
  module_name: string;
  module_path: string;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_print: boolean;
}

interface AuthContextType {
  user: User | null;
  permissions: Permission[];
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<User | undefined>;
  hasPermission: (moduleName: string, permission: string) => boolean;
}

interface RegisterData {
  user_name: string;
  user_email: string;
  user_password: string;
  user_role?: string;
  user_department?: string;
  user_phone_number?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        const storedPermissions = localStorage.getItem('auth_permissions');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          if (storedPermissions) {
            setPermissions(JSON.parse(storedPermissions));
          }
          
          // Verify token is still valid by fetching profile
          try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.PROFILE}`, {
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (!response.ok) {
              if (response.status === 401) {
                // Token is invalid, clear auth state
                console.log('Token expired or invalid, clearing auth state');
                clearAuthState();
              } else {
                // Other errors, keep auth state but log the issue
                console.warn('Profile fetch failed with status:', response.status);
              }
            } else {
              // Token is valid, update user data with fresh profile
              const data = await response.json();
              if (data.success && data.data) {
                setUser(data.data);
                localStorage.setItem('auth_user', JSON.stringify(data.data));
              }
            }
          } catch (error) {
            console.error('Token verification failed:', error);
            // Don't clear auth state on network errors, only on 401
            console.warn('Network error during token verification, keeping auth state');
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthState = () => {
    setUser(null);
    setPermissions([]);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_permissions');
  };

  // Load user permissions asynchronously
  const loadUserPermissions = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.PERMISSIONS}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userPermissions = data.data || [];
        setPermissions(userPermissions);
        localStorage.setItem('auth_permissions', JSON.stringify(userPermissions));
      }
    } catch (error) {
      console.error('Failed to load permissions:', error);
      // Don't throw error - permissions are not critical for login
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      // Remove loading state for instant login
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: identifier, user_password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { user: userData, token: authToken } = data.data;

      setUser(userData);
      setToken(authToken);
      setPermissions([]); // Will be loaded separately

      // Store in localStorage
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      localStorage.setItem('auth_permissions', JSON.stringify([]));

      // Load permissions asynchronously after login (no blocking)
      loadUserPermissions(authToken);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // After successful registration, automatically log in
      await login(userData.user_email, userData.user_password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    clearAuthState();
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.PROFILE}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      const updatedUser = data.data;
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.CHANGE_PASSWORD}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    try {
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.PROFILE}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      if (data.success && data.data) {
        setUser(data.data);
        localStorage.setItem('auth_user', JSON.stringify(data.data));
        return data.data;
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
      throw error;
    }
  };

  const hasPermission = (moduleName: string, permission: string): boolean => {
    if (!permissions.length) return false;
    
    const modulePermission = permissions.find(p => p.module_name === moduleName);
    if (!modulePermission) return false;

    return modulePermission[permission as keyof Permission] === true;
  };

  const value: AuthContextType = {
    user,
    permissions,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshProfile,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
