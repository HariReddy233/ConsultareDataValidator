import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';

interface Role {
  role_id: string;
  role_name: string;
  role_description: string;
  created_at: string;
  updated_at: string;
}

interface Department {
  department_id: string;
  department_name: string;
  department_description: string;
  created_at: string;
  updated_at: string;
}

const RolesDepartmentsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'departments'>('roles');
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);

  // Load roles data
  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/roles');
      
      if (response.success) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load departments data
  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/departments');
      
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'roles') {
      loadRoles();
    } else {
      loadDepartments();
    }
  }, [activeTab]);

  const handleEditRole = (role: Role) => {
    setEditingRole({ ...role });
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment({ ...department });
  };

  const handleSaveRole = async () => {
    if (!editingRole) return;

    try {
      setLoading(true);
      await api.put(`/api/users/roles/${editingRole.role_id}`, {
        role_name: editingRole.role_name,
        role_description: editingRole.role_description
      });
      setEditingRole(null);
      loadRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDepartment = async () => {
    if (!editingDepartment) return;

    try {
      setLoading(true);
      await api.put(`/api/users/departments/${editingDepartment.department_id}`, {
        department_name: editingDepartment.department_name,
        department_description: editingDepartment.department_description
      });
      setEditingDepartment(null);
      loadDepartments();
    } catch (error) {
      console.error('Error updating department:', error);
      alert('Failed to update department');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    setEditingDepartment(null);
  };

  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        setLoading(true);
        await api.delete(`/api/users/roles/${roleId}`);
        loadRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
        alert('Failed to delete role');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        setLoading(true);
        await api.delete(`/api/users/departments/${departmentId}`);
        loadDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
        alert('Failed to delete department');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddRole = async (roleData: { role_name: string; role_description: string }) => {
    try {
      setLoading(true);
      await api.post('/api/users/roles', roleData);
      setShowAddRole(false);
      loadRoles();
    } catch (error) {
      console.error('Error creating role:', error);
      alert('Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (departmentData: { department_name: string; department_description: string }) => {
    try {
      setLoading(true);
      await api.post('/api/users/departments', departmentData);
      setShowAddDepartment(false);
      loadDepartments();
    } catch (error) {
      console.error('Error creating department:', error);
      alert('Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Roles & Departments</h1>
            <p className="text-gray-600 mt-1">Manage system roles and departments</p>
          </div>
          
          <button
            onClick={() => {
              if (activeTab === 'roles') {
                loadRoles();
              } else {
                loadDepartments();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        
        {/* Tabs */}
        <div className="mt-6 flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'roles'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-white hover:text-gray-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            Roles Management
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'departments'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-white hover:text-gray-900'
            }`}
          >
            <Building className="w-4 h-4" />
            Departments Management
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        {activeTab === 'roles' ? (
          <RolesTab
            roles={roles}
            loading={loading}
            editingRole={editingRole}
            setEditingRole={setEditingRole}
            onEdit={handleEditRole}
            onSave={handleSaveRole}
            onCancel={handleCancelEdit}
            onDelete={handleDeleteRole}
            onAdd={handleAddRole}
            showAddRole={showAddRole}
            setShowAddRole={setShowAddRole}
          />
        ) : (
          <DepartmentsTab
            departments={departments}
            loading={loading}
            editingDepartment={editingDepartment}
            setEditingDepartment={setEditingDepartment}
            onEdit={handleEditDepartment}
            onSave={handleSaveDepartment}
            onCancel={handleCancelEdit}
            onDelete={handleDeleteDepartment}
            onAdd={handleAddDepartment}
            showAddDepartment={showAddDepartment}
            setShowAddDepartment={setShowAddDepartment}
          />
        )}
      </div>
    </div>
  );
};

// Roles Tab Component
interface RolesTabProps {
  roles: Role[];
  loading: boolean;
  editingRole: Role | null;
  setEditingRole: (role: Role | null) => void;
  onEdit: (role: Role) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (roleId: string) => void;
  onAdd: (data: { role_name: string; role_description: string }) => void;
  showAddRole: boolean;
  setShowAddRole: (show: boolean) => void;
}

const RolesTab: React.FC<RolesTabProps> = ({
  roles,
  loading,
  editingRole,
  setEditingRole,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onAdd,
  showAddRole,
  setShowAddRole
}) => {
  const [newRole, setNewRole] = useState({ role_name: '', role_description: '' });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRole.role_name.trim()) {
      onAdd(newRole);
      setNewRole({ role_name: '', role_description: '' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">System Roles</h2>
          </div>
          <button
            onClick={() => setShowAddRole(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Role
          </button>
        </div>
      </div>

      {/* Add Role Form */}
      {showAddRole && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleAddSubmit} className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Role Name"
                value={newRole.role_name}
                onChange={(e) => setNewRole({ ...newRole, role_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Description"
                value={newRole.role_description}
                onChange={(e) => setNewRole({ ...newRole, role_description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddRole(false);
                  setNewRole({ role_name: '', role_description: '' });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roles Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading roles...</span>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role) => (
                <tr key={role.role_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {role.role_name.toLowerCase().replace(/\s+/g, '_')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingRole?.role_id === role.role_id ? (
                      <input
                        type="text"
                        value={editingRole.role_name}
                        onChange={(e) => setEditingRole({ ...editingRole, role_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{role.role_name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingRole?.role_id === role.role_id ? (
                      <input
                        type="text"
                        value={editingRole.role_description}
                        onChange={(e) => setEditingRole({ ...editingRole, role_description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter description"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{role.role_description || 'Enter description'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingRole?.role_id === role.role_id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={onSave}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={onCancel}
                          className="flex items-center gap-1 px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(role)}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded"
                          title="Edit role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(role.role_id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {roles.length === 0 && !loading && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
            <p className="text-gray-500">Get started by creating a new role.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Departments Tab Component
interface DepartmentsTabProps {
  departments: Department[];
  loading: boolean;
  editingDepartment: Department | null;
  setEditingDepartment: (department: Department | null) => void;
  onEdit: (department: Department) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (departmentId: string) => void;
  onAdd: (data: { department_name: string; department_description: string }) => void;
  showAddDepartment: boolean;
  setShowAddDepartment: (show: boolean) => void;
}

const DepartmentsTab: React.FC<DepartmentsTabProps> = ({
  departments,
  loading,
  editingDepartment,
  setEditingDepartment,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onAdd,
  showAddDepartment,
  setShowAddDepartment
}) => {
  const [newDepartment, setNewDepartment] = useState({ department_name: '', department_description: '' });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDepartment.department_name.trim()) {
      onAdd(newDepartment);
      setNewDepartment({ department_name: '', department_description: '' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Building className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">System Departments</h2>
          </div>
          <button
            onClick={() => setShowAddDepartment(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Department
          </button>
        </div>
      </div>

      {/* Add Department Form */}
      {showAddDepartment && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleAddSubmit} className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Department Name"
                value={newDepartment.department_name}
                onChange={(e) => setNewDepartment({ ...newDepartment, department_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Description"
                value={newDepartment.department_description}
                onChange={(e) => setNewDepartment({ ...newDepartment, department_description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddDepartment(false);
                  setNewDepartment({ department_name: '', department_description: '' });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Departments Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading departments...</span>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.map((department) => (
                <tr key={department.department_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {department.department_name.toLowerCase().replace(/\s+/g, '_')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingDepartment?.department_id === department.department_id ? (
                      <input
                        type="text"
                        value={editingDepartment.department_name}
                        onChange={(e) => setEditingDepartment({ ...editingDepartment, department_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{department.department_name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingDepartment?.department_id === department.department_id ? (
                      <input
                        type="text"
                        value={editingDepartment.department_description}
                        onChange={(e) => setEditingDepartment({ ...editingDepartment, department_description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter description"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{department.department_description || 'Enter description'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingDepartment?.department_id === department.department_id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={onSave}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={onCancel}
                          className="flex items-center gap-1 px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(department)}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded"
                          title="Edit department"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(department.department_id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete department"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {departments.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
            <p className="text-gray-500">Get started by creating a new department.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesDepartmentsManagement;
