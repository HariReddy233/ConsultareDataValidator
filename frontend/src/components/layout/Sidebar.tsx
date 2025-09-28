import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Package, 
  Calculator, 
  Database,
  Loader2
} from 'lucide-react';
import { DataCategory, SAPMainCategory } from '../../types';
import { useSAPCategories } from '../../hooks/useSAPCategories';

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
  const [showLogoShine, setShowLogoShine] = useState(false);

  // Trigger logo shine animation on component mount
  useEffect(() => {
    setShowLogoShine(true);
  }, []);

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
            className={`h-12 w-200 object-contain ${showLogoShine ? 'logo-shine' : ''}`}
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

      {/* Footer */}
      <div className="p-4 border-t border-sap-gray-800">
        <div className="flex justify-center">
          <img 
            src="/images/Consultare.png" 
            alt="Consultare" 
            className={`h-8 w-auto ${showLogoShine ? 'logo-shine' : ''}`}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
