import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Package, 
  Calculator, 
  Database,
  Loader2,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { DataCategory, SAPMainCategory } from '../../types';
import { useSAPCategories } from '../../hooks/useSAPCategories';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  selectedCategory: DataCategory;
  onCategoryChange: (category: DataCategory) => void;
}

// Icon mapping for different category types
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('business partner') || name.includes('partner')) return Users;
  if (name.includes('item') || name.includes('product')) return Package;
  if (name.includes('financial') || name.includes('accounting')) return Calculator;
  if (name.includes('setup') || name.includes('configuration')) return Database;
  return Database; // Default icon
};

const Sidebar: React.FC<SidebarProps> = ({ selectedCategory, onCategoryChange }) => {
  const { categories, loading, error } = useSAPCategories();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Convert SAP categories to the format expected by the component
  const menuItems = categories.map((category: SAPMainCategory) => ({
    id: category.MainCategoryName.replace(/\s+/g, '') as DataCategory,
    label: category.MainCategoryName,
    icon: getCategoryIcon(category.MainCategoryName),
  }));

  return (
    <div className="w-72 bg-sap-gray-900 text-white flex flex-col shadow-lg min-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-300">
        <div className="flex items-center space-x-3">
          <img 
            src="/images/SAP_BusinessOne_R_grad_blu.png" 
            alt="SAP Business One" 
            className="h-12 w-200 object-contain"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            <span className="ml-2 text-blue-400">Loading categories...</span>
          </div>
        ) : error ? (
          <div className="text-red-400 text-center py-8">
            <p>Failed to load categories</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = selectedCategory === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onCategoryChange(item.id)}
                    className={`w-full flex items-start px-4 py-4 rounded-lg text-left transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-900 text-white shadow-md'
                        : 'text-blue-900 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-blue-900 group-hover:text-white'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{item.label}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sap-gray-800">
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-800 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-white truncate">
                  {user.user_name}
                </div>
                <div className="text-xs text-blue-200 truncate">
                  {user.user_email}
                </div>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">{user.user_name}</div>
                  <div className="text-xs text-gray-500">{user.user_role}</div>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // TODO: Navigate to profile page
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Profile Settings
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-center mt-4">
          <img 
            src="/images/Consultare.png" 
            alt="Consultare" 
            className="h-6 w-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
