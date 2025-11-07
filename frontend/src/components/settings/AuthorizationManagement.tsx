import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Save, 
  RotateCcw, 
  Users,
  Building,
  Calculator,
  Database,
  Settings,
  Plus,
  Upload,
  Eye,
  Edit,
  Trash2,
  Check,
  FileText,
  Package
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  all: boolean;
}

interface Module {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  permissions: Permission;
  subModules?: {
    id: string;
    name: string;
    permissions: Permission;
    subModules?: {
      id: string;
      name: string;
      permissions: Permission;
    }[];
  }[];
}

interface Role {
  id: string;
  name: string;
  userCount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}

// Mock data based on actual database structure
const getMockUsersByRole = (roleId?: string) => {
  const allUsers = [
    { id: '01K76CS6QSE84P9R9D9PXCBFGE', name: 'Avinash', email: 'asaman@consultare.net', role: 'admin' },
    { id: '01K76V0K75TRRW61KWB2SBVRB6', name: 'Hari', email: 'hreddy@consultare.net', role: 'viewer' },
    { id: 'admin', name: 'System Administrator', email: 'admin@consultare.in', role: 'admin' }
  ];

  if (!roleId) return allUsers;
  
  return allUsers.filter(user => user.role === roleId);
};

const AuthorizationManagement: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [modules, setModules] = useState<Module[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const { hasPermission } = useAuth();

  // Load data from API - ENABLED for roles and modules
  useEffect(() => {
    loadRoles(); // Load roles
    loadModules(); // Load modules for permission display
  }, []);

  // Reload users when selected role changes - ENABLED for role selection
  useEffect(() => {
    if (selectedRole) {
      loadUsers(selectedRole);
    }
  }, [selectedRole]);

  // Load permissions when user changes - ENABLED for displaying permissions
  useEffect(() => {
    if (selectedUser) {
      loadUserPermissions(selectedUser);
    }
  }, [selectedUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('No authentication token found');
        alert('You must be logged in to access this page');
        return;
      }
      
      console.log('Loading data with token:', token.substring(0, 20) + '...');
      
      await Promise.all([
        loadRoles(),
        loadModules()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('No authentication token found, using mock data');
        const mockRoles = [
          { id: 'admin', name: 'Administrator', userCount: 2 },
          { id: '01K76FDADC9T1TRF05TXG72YJ6', name: 'Functional Consultant', userCount: 0 },
          { id: 'viewer', name: 'User', userCount: 1 }
        ];
        setRoles(mockRoles);
        return;
      }

      console.log('Loading roles...');
      
      try {
        const response = await api.get('/api/users/roles');
        console.log('Roles response:', response);
        if (response.success) {
          const rolesData = response.data.map((role: any) => ({
            id: role.role_id,
            name: role.role_name,
            userCount: role.user_count || 0
          }));
          setRoles(rolesData);
          console.log('Roles loaded:', rolesData.length);
        }
      } catch (apiError) {
        console.error('API call failed for roles, using mock data:', apiError);
        // Fall back to mock data when API fails
        const mockRoles = [
          { id: 'admin', name: 'Administrator', userCount: 2 },
          { id: '01K76FDADC9T1TRF05TXG72YJ6', name: 'Functional Consultant', userCount: 0 },
          { id: 'viewer', name: 'User', userCount: 1 }
        ];
        setRoles(mockRoles);
        console.log('Using mock roles:', mockRoles.length);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      // Fallback to mock roles based on actual database structure
      const mockRoles = [
        { id: 'admin', name: 'Administrator', userCount: 2 },
        { id: '01K76FDADC9T1TRF05TXG72YJ6', name: 'Functional Consultant', userCount: 0 },
        { id: 'viewer', name: 'User', userCount: 1 }
      ];
      setRoles(mockRoles);
      console.log('Using mock roles:', mockRoles.length);
    }
  };

  const loadUsers = async (roleId?: string) => {
    try {
      setLoadingUsers(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('No authentication token found, using mock data');
        const mockUsers = getMockUsersByRole(roleId);
        setUsers(mockUsers);
        if (mockUsers.length > 0) {
          setSelectedUser(mockUsers[0].id);
        } else {
          setSelectedUser('');
        }
        return;
      }

      const endpoint = roleId ? `/api/users?role=${roleId}` : '/api/users';
      console.log('Loading users from endpoint:', endpoint);
      
      try {
        const response = await api.get(endpoint);
        console.log('Users API response:', response);
        if (response.success && response.data && response.data.users) {
          const usersData = response.data.users.map((user: any) => ({
            id: user.user_id,
            name: user.user_name,
            email: user.user_email
          }));
          console.log('Mapped users data:', usersData);
          setUsers(usersData);
          if (usersData.length > 0) {
            setSelectedUser(usersData[0].id);
          } else {
            setSelectedUser('');
          }
        } else {
          console.warn('API response invalid:', response);
          setUsers([]);
          setSelectedUser('');
        }
      } catch (apiError) {
        console.error('API call failed, using mock data:', apiError);
        // Fall back to mock data when API fails
        const mockUsers = getMockUsersByRole(roleId);
        setUsers(mockUsers);
        if (mockUsers.length > 0) {
          setSelectedUser(mockUsers[0].id);
        } else {
          setSelectedUser('');
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to mock data based on actual database structure
      const mockUsers = getMockUsersByRole(roleId);
      setUsers(mockUsers);
      if (mockUsers.length > 0) {
        setSelectedUser(mockUsers[0].id);
      } else {
        setSelectedUser('');
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadUserPermissions = async (userId: string) => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('No authentication token found, skipping permission loading');
        return;
      }

      try {
        const response = await api.get(`/api/users/${userId}/permissions`);
        
        if (response.success && response.data) {
          // Update modules with loaded permissions
          const loadedPermissions = response.data;
          
          setModules(prevModules => 
            prevModules.map(module => {
              const modulePermission = loadedPermissions.find((p: any) => p.module_name === module.name);
              if (modulePermission) {
                return {
                  ...module,
                  permissions: {
                    create: modulePermission.can_create || false,
                    read: modulePermission.can_read || false,
                    update: modulePermission.can_update || false,
                    delete: modulePermission.can_delete || false,
                    all: modulePermission.can_create && modulePermission.can_read && modulePermission.can_update && modulePermission.can_delete
                  }
                };
              }
              return module;
            })
          );
        }
      } catch (apiError) {
        console.error('API call failed for permissions, keeping default permissions:', apiError);
        // Keep default permissions when API fails
      }
    } catch (error) {
      console.error('Error loading user permissions:', error);
      // Keep default permissions if loading fails
    } finally {
      setLoading(false);
    }
  };

  const getModuleIcon = (moduleId: string) => {
    switch (moduleId) {
      case 'business-partner': return Database;
      case 'item-master': return Package;
      case 'financial-data': return Calculator;
      case 'setup-data': return Database;
      case 'asset-master': return Database;
      case 'field-instructions': return FileText;
      case 'settings': return Settings;
      default: return Database;
    }
  };

  const loadModules = async () => {
    try {
      console.log('Loading modules...');
      const response = await api.get('/api/users/modules');
      console.log('Modules response:', response);
      if (response.success) {
        const modulesData: Module[] = response.data.map((module: any) => ({
          id: module.module_id,
          name: module.module_name,
          icon: getModuleIcon(module.module_id),
          permissions: { create: false, read: false, update: false, delete: false, all: false }
        }));
        setModules(modulesData);
        console.log('Modules loaded:', modulesData.length);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      // Fallback to default modules if API fails
      const fallbackModules: Module[] = [
        {
          id: 'sap-data-validator',
          name: 'SAP Data Validator',
          icon: Database,
          permissions: { create: false, read: false, update: false, delete: false, all: false }
        },
            {
              id: 'business-partner',
              name: 'Business Partner Master Data',
          icon: Users,
          permissions: { create: false, read: false, update: false, delete: false, all: false }
            },
            {
              id: 'item-master',
              name: 'Item Master Data',
          icon: Package,
          permissions: { create: false, read: false, update: false, delete: false, all: false }
            },
            {
              id: 'financial-data',
              name: 'Financial Data',
          icon: Calculator,
          permissions: { create: false, read: false, update: false, delete: false, all: false }
            },
            {
              id: 'setup-data',
              name: 'Set Up Data',
          icon: Settings,
          permissions: { create: false, read: false, update: false, delete: false, all: false }
            },
            {
              id: 'asset-master',
              name: 'Asset Master Data',
          icon: Building,
          permissions: { create: false, read: false, update: false, delete: false, all: false }
            },
            {
              id: 'field-instructions',
              name: 'Field Instructions',
          icon: FileText,
          permissions: { create: false, read: false, update: false, delete: false, all: false }
        },
        {
          id: 'settings',
          name: 'Settings',
          icon: Settings,
          permissions: { create: false, read: false, update: false, delete: false, all: false }
        },
            {
              id: 'users',
              name: 'Users',
          icon: Users,
          permissions: { create: false, read: false, update: false, delete: false, all: false }
            },
            {
              id: 'roles-departments',
              name: 'Roles & Departments',
          icon: Building,
          permissions: { create: false, read: false, update: false, delete: false, all: false }
            },
            {
              id: 'authorization',
              name: 'Authorization',
          icon: Shield,
          permissions: { create: false, read: false, update: false, delete: false, all: false }
        }
      ];
      setModules(fallbackModules);
    }
  };

  const handlePermissionChange = (moduleId: string, subModuleId: string | null, permission: keyof Permission, value: boolean) => {
    // DISABLED - No functionality
    console.log('Permission change disabled:', { moduleId, subModuleId, permission, value });
  };

  const handleQuickAction = (action: 'create' | 'read' | 'update' | 'delete') => {
    // DISABLED - No functionality
    console.log('Quick action disabled:', action);
  };

  const handleSelectAll = () => {
    // DISABLED - No functionality
    console.log('Select all disabled');
  };

  const handleSavePermissions = async () => {
    // DISABLED - No functionality
    console.log('Save permissions disabled');
    alert('Authorization functionality has been disabled');
  };

  const updateUserPermissions = (userId: string, permissions: any[]) => {
    // DISABLED - No functionality
    console.log('Update user permissions disabled:', { userId, permissions });
  };

  const selectedRoleData = roles.find(role => role.id === selectedRole);
  const selectedUserData = users.find(user => user.id === selectedUser);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Authorization Management</h1>
            <p className="text-gray-600 mt-1">Manage user permissions and access controls</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSavePermissions}
              disabled={true}
              className="flex items-center gap-2 bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Authorization Disabled
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Disabled Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Shield className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Permission Display Only</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You can select roles and users to view their permissions from the database, but permission modification is disabled. All checkboxes are read-only.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading authorization data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
          {/* Role & User Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Role & User Selection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Please select role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedRole ? `${users.length} users in selected role` : 'Select a role to view users'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  disabled={loadingUsers || !selectedRole}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingUsers ? (
                    <option value="">Loading users...</option>
                  ) : !selectedRole ? (
                    <option value="">Please select user</option>
                  ) : users.length > 0 ? (
                    <>
                      <option value="">Please select user</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                      </option>
                      ))}
                    </>
                  ) : (
                    <option value="">No users found for this role</option>
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {loadingUsers ? 'Loading users...' : users.length > 0 ? 'User selected' : 'No users available'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleQuickAction('create')}
                disabled={true}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Select All Create
              </button>
              
              <button
                onClick={() => handleQuickAction('read')}
                disabled={true}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4" />
                Select All Read
              </button>
              
              <button
                onClick={() => handleQuickAction('update')}
                disabled={true}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg transition-colors border border-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit className="w-4 h-4" />
                Select All Update
              </button>
              
              <button
                onClick={() => handleQuickAction('delete')}
                disabled={true}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Select All Delete
              </button>
            </div>
          </div>

          {/* Permissions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Permissions</h2>
                <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                  <span className="font-medium">💡 Tip:</span> Unchecking READ permission will hide the module from the menu bar
          </div>
        </div>
      </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MODULE
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center">
                        <span>CREATE</span>
                        <span className="text-xs text-gray-400 font-normal">Add new items</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center">
                        <span>READ</span>
                        <span className="text-xs text-gray-400 font-normal">View & access</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center">
                        <span>UPDATE</span>
                        <span className="text-xs text-gray-400 font-normal">Edit existing</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center">
                        <span>DELETE</span>
                        <span className="text-xs text-gray-400 font-normal">Remove items</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center">
                        <span>ALL</span>
                        <span className="text-xs text-gray-400 font-normal">Master toggle</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {modules.map((module) => (
                    <React.Fragment key={module.id}>
                      {/* Main Module Row - With Checkboxes */}
                      <tr className="bg-gray-100">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <module.icon className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-semibold text-gray-900">{module.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={module.permissions.create}
                            onChange={(e) => handlePermissionChange(module.id, null, 'create', e.target.checked)}
                            disabled={true}
                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 opacity-75 cursor-not-allowed"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={module.permissions.read}
                            onChange={(e) => handlePermissionChange(module.id, null, 'read', e.target.checked)}
                            disabled={true}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 opacity-75 cursor-not-allowed"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={module.permissions.update}
                            onChange={(e) => handlePermissionChange(module.id, null, 'update', e.target.checked)}
                            disabled={true}
                            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 opacity-75 cursor-not-allowed"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={module.permissions.delete}
                            onChange={(e) => handlePermissionChange(module.id, null, 'delete', e.target.checked)}
                            disabled={true}
                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 opacity-75 cursor-not-allowed"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={module.permissions.all}
                            onChange={(e) => handlePermissionChange(module.id, null, 'all', e.target.checked)}
                            disabled={true}
                            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 opacity-75 cursor-not-allowed"
                                />
                              </td>
                            </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorizationManagement;