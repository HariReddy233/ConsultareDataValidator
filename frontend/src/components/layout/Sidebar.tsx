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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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

const Sidebar: React.FC<SidebarProps> = ({ selectedCategory, onCategoryChange, isCollapsed = false, onToggleCollapse }) => {
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
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col shadow-sm min-h-screen transition-all duration-300`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-8 border-b border-gray-200">
        <div className="flex items-center justify-center">
          {!isCollapsed && (
            <img 
              src="/images/SAP_BusinessOne_R_grad_blu.png" 
              alt="SAP Business One" 
              className="h-8 w-auto object-contain"
            />
          )}
        </div>
      </div>

      {/* Navigation - Simplified */}
      <nav className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            {!isCollapsed && <span className="ml-2 text-gray-600">Loading...</span>}
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">
            <p className="text-sm">Failed to load categories</p>
            {!isCollapsed && <p className="text-xs mt-1">{error}</p>}
          </div>
        ) : (
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = selectedCategory === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onCategoryChange(item.id)}
                    className={`w-full flex items-center px-3 py-2.5 rounded-md text-left transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0 ${
                      isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* User Section - Back at bottom */}
      <div className="p-4 border-t border-gray-200">
        {user && (
          <div className="relative">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex-1 flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                title={isCollapsed ? `${user.user_name} (${user.user_email})` : undefined}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user.user_name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user.user_email}
                    </div>
                  </div>
                )}
              </button>
              
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isCollapsed ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    )}
                  </svg>
                </button>
              )}
            </div>

            {showUserMenu && !isCollapsed && (
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
      </div>
    </div>
  );
};

export default Sidebar;
