import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Save, 
  RotateCcw, 
  GripVertical
} from 'lucide-react';
import { api } from '../../services/api';

interface ModuleField {
  id: string;
  label: string;
  width: number;
  type: 'Text' | 'Number' | 'Date' | 'Boolean' | 'Select';
  alignment: 'Left' | 'Center' | 'Right';
  enabled: boolean;
  order: number;
}

interface Module {
  module_id: string;
  module_name: string;
  module_description: string;
  module_path: string;
  fields: ModuleField[];
}

interface SAPCategory {
  MainCategoryID: string;
  MainCategoryName: string;
  SubCategories: {
    SubCategoryID: string;
    SubCategoryName: string;
    TemplatePath: string;
    SamplePath: string;
    Data_Table: string;
  }[];
}

interface Profile {
  profile_id: string;
  profile_name: string;
  profile_description: string;
}

const AuthorizationManagement: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<string>('admin');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [modules, setModules] = useState<Module[]>([]);
  const [sapCategories, setSapCategories] = useState<SAPCategory[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentFields, setCurrentFields] = useState<ModuleField[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entryType, setEntryType] = useState<'module' | 'category'>('module');

  // Load modules, categories and profiles
  useEffect(() => {
    loadModules();
    loadSAPCategories();
    loadProfiles();
  }, []);

  // Load fields when module or category changes
  useEffect(() => {
    if (entryType === 'module' && selectedModule) {
      loadModuleFields(selectedModule);
    } else if (entryType === 'category' && selectedCategory) {
      loadCategoryFields(selectedCategory);
    }
  }, [selectedModule, selectedCategory, entryType]);

  const loadModules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/modules');
      
      if (response.success) {
        const modulesWithFields = response.data.map((module: any) => ({
          ...module,
          fields: generateDefaultFields(module.module_name)
        }));
        setModules(modulesWithFields);
        if (modulesWithFields.length > 0) {
          setSelectedModule(modulesWithFields[0].module_id);
        }
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSAPCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/categories');
      
      if (response.success) {
        setSapCategories(response.data);
        if (response.data.length > 0) {
          setSelectedCategory(response.data[0].MainCategoryID);
        }
      }
    } catch (error) {
      console.error('Error loading SAP categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      // For now, create default profiles - in real app, this would come from API
      const defaultProfiles: Profile[] = [
        { profile_id: 'admin', profile_name: 'admin', profile_description: 'Administrator profile' },
        { profile_id: 'user', profile_name: 'user', profile_description: 'Standard user profile' },
        { profile_id: 'viewer', profile_name: 'viewer', profile_description: 'Read-only profile' }
      ];
      setProfiles(defaultProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const generateDefaultFields = (moduleName: string): ModuleField[] => {
    // Generate default fields based on module name
    const commonFields: ModuleField[] = [
      { id: 'id', label: 'ID', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 1 },
      { id: 'name', label: 'Name', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 2 },
      { id: 'description', label: 'Description', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 3 },
      { id: 'status', label: 'Status', width: 100, type: 'Text', alignment: 'Center', enabled: true, order: 4 },
      { id: 'created_date', label: 'Created Date', width: 100, type: 'Date', alignment: 'Left', enabled: true, order: 5 },
      { id: 'updated_date', label: 'Updated Date', width: 100, type: 'Date', alignment: 'Left', enabled: true, order: 6 },
      { id: 'created_by', label: 'Created By', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 7 },
      { id: 'updated_by', label: 'Updated By', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 8 }
    ];

    // Add module-specific fields
    if (moduleName.toLowerCase().includes('user')) {
      return [
        ...commonFields,
        { id: 'email', label: 'Email', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 9 },
        { id: 'phone', label: 'Phone', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 10 },
        { id: 'role', label: 'Role', width: 100, type: 'Select', alignment: 'Left', enabled: true, order: 11 },
        { id: 'department', label: 'Department', width: 100, type: 'Select', alignment: 'Left', enabled: true, order: 12 },
        { id: 'is_active', label: 'Active', width: 100, type: 'Boolean', alignment: 'Center', enabled: true, order: 13 }
      ];
    }

    return commonFields;
  };

  const generateCategoryFields = (categoryName: string): ModuleField[] => {
    // Generate fields based on SAP category
    const commonFields: ModuleField[] = [
      { id: 'id', label: 'ID', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 1 },
      { id: 'name', label: 'Name', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 2 },
      { id: 'description', label: 'Description', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 3 },
      { id: 'status', label: 'Status', width: 100, type: 'Text', alignment: 'Center', enabled: true, order: 4 },
      { id: 'created_date', label: 'Created Date', width: 100, type: 'Date', alignment: 'Left', enabled: true, order: 5 },
      { id: 'updated_date', label: 'Updated Date', width: 100, type: 'Date', alignment: 'Left', enabled: true, order: 6 },
      { id: 'created_by', label: 'Created By', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 7 },
      { id: 'updated_by', label: 'Updated By', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 8 }
    ];

    // Add category-specific fields based on the category name
    if (categoryName.toLowerCase().includes('business partner')) {
      return [
        ...commonFields,
        { id: 'card_code', label: 'Card Code', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 9 },
        { id: 'card_name', label: 'Card Name', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 10 },
        { id: 'card_type', label: 'Card Type', width: 100, type: 'Select', alignment: 'Left', enabled: true, order: 11 },
        { id: 'phone', label: 'Phone', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 12 },
        { id: 'email', label: 'Email', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 13 },
        { id: 'address', label: 'Address', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 14 },
        { id: 'city', label: 'City', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 15 },
        { id: 'country', label: 'Country', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 16 }
      ];
    } else if (categoryName.toLowerCase().includes('item master')) {
      return [
        ...commonFields,
        { id: 'item_code', label: 'Item Code', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 9 },
        { id: 'item_name', label: 'Item Name', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 10 },
        { id: 'item_type', label: 'Item Type', width: 100, type: 'Select', alignment: 'Left', enabled: true, order: 11 },
        { id: 'unit_price', label: 'Unit Price', width: 100, type: 'Number', alignment: 'Right', enabled: true, order: 12 },
        { id: 'currency', label: 'Currency', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 13 },
        { id: 'warehouse', label: 'Warehouse', width: 100, type: 'Text', alignment: 'Left', enabled: true, order: 14 },
        { id: 'stock_quantity', label: 'Stock Quantity', width: 100, type: 'Number', alignment: 'Right', enabled: true, order: 15 }
      ];
    }

    return commonFields;
  };

  const loadModuleFields = async (moduleId: string) => {
    try {
      setLoading(true);
      // In a real app, this would load from API
      const module = modules.find(m => m.module_id === moduleId);
      if (module) {
        setCurrentFields([...module.fields]);
      }
    } catch (error) {
      console.error('Error loading module fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryFields = async (categoryId: string) => {
    try {
      setLoading(true);
      // Find the selected category
      const category = sapCategories.find(c => c.MainCategoryID === categoryId);
      if (category) {
        // Generate fields based on the category
        const fields = generateCategoryFields(category.MainCategoryName);
        setCurrentFields(fields);
      }
    } catch (error) {
      console.error('Error loading category fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (index: number, field: keyof ModuleField, value: any) => {
    const updatedFields = [...currentFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setCurrentFields(updatedFields);
  };

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    const draggedField = currentFields[dragIndex];
    const updatedFields = [...currentFields];
    updatedFields.splice(dragIndex, 1);
    updatedFields.splice(hoverIndex, 0, draggedField);
    
    // Update order numbers
    const reorderedFields = updatedFields.map((field, index) => ({
      ...field,
      order: index + 1
    }));
    
    setCurrentFields(reorderedFields);
  };

  const handleSaveConfiguration = async () => {
    try {
      setSaving(true);
      // In a real app, this would save to API
      console.log('Saving configuration:', {
        profile: selectedProfile,
        module: selectedModule,
        fields: currentFields
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to reset to default configuration?')) {
      const module = modules.find(m => m.module_id === selectedModule);
      if (module) {
        setCurrentFields([...module.fields]);
      }
    }
  };


  const selectedModuleData = entryType === 'module' 
    ? modules.find(m => m.module_id === selectedModule)
    : sapCategories.find(c => c.MainCategoryID === selectedCategory);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customization</h1>
            <div className="mt-4 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Profile:</label>
                <select
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                >
                  {profiles.map(profile => (
                    <option key={profile.profile_id} value={profile.profile_id}>
                      {profile.profile_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Entry type:</label>
                <select
                  value={entryType}
                  onChange={(e) => {
                    const newEntryType = e.target.value as 'module' | 'category';
                    setEntryType(newEntryType);
                    if (newEntryType === 'module') {
                      setSelectedModule(modules.length > 0 ? modules[0].module_id : '');
                      setSelectedCategory('');
                    } else {
                      setSelectedCategory(sapCategories.length > 0 ? sapCategories[0].MainCategoryID : '');
                      setSelectedModule('');
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                >
                  <option value="module">Modules</option>
                  <option value="category">Dynamic Data</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {entryType === 'module' ? 'Module:' : 'Category:'}
                </label>
                <select
                  value={entryType === 'module' ? selectedModule : selectedCategory}
                  onChange={(e) => {
                    if (entryType === 'module') {
                      setSelectedModule(e.target.value);
                    } else {
                      setSelectedCategory(e.target.value);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                >
                  {entryType === 'module' ? (
                    modules.map(module => (
                      <option key={module.module_id} value={module.module_id}>
                        {module.module_name}
                      </option>
                    ))
                  ) : (
                    sapCategories.map(category => (
                      <option key={category.MainCategoryID} value={category.MainCategoryID}>
                        {category.MainCategoryName}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            {selectedModuleData && (
              <p className="mt-2 text-sm text-gray-600">
                {currentFields.length} customization Drag to reorder customization
              </p>
            )}
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetToDefault}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Default
              </button>
              <button
                onClick={handleSaveConfiguration}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading customization...</span>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="overflow-x-auto flex-1 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 h-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      Reorder
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Id
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Label
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      enabled
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentFields.map((field, index) => (
                    <tr key={field.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={field.id}
                          onChange={(e) => handleFieldChange(index, 'id', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.enabled}
                            onChange={(e) => handleFieldChange(index, 'enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {currentFields.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No fields found</h3>
                  <p className="text-gray-500">Select a module to view its customizable fields.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorizationManagement;
