import React from 'react';
import { 
  Users, 
  Package, 
  Calculator, 
  Database
} from 'lucide-react';
import { DataCategory } from '../../types';

interface SidebarProps {
  selectedCategory: DataCategory;
  onCategoryChange: (category: DataCategory) => void;
}

const menuItems = [
  {
    id: 'BusinessPartnerMasterData' as DataCategory,
    label: 'Business Partner Master Data',
    description: 'Customer and vendor data validation',
    icon: Users,
  },
  {
    id: 'ItemMasterData' as DataCategory,
    label: 'Item Master Data',
    description: 'Product and service item validation',
    icon: Package,
  },
  {
    id: 'FinancialData' as DataCategory,
    label: 'Financial Data',
    description: 'Accounting and financial validation',
    icon: Calculator,
  },
  {
    id: 'SetupData' as DataCategory,
    label: 'Set Up Data',
    description: 'System configuration validation',
    icon: Database,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div className="w-72 bg-sap-blue-900 text-white flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-sap-blue-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-sap-blue-900 font-bold text-lg">C</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Consultare</h1>
            <p className="text-[10px] text-sap-blue-200">Master Data Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
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
                      ? 'bg-sap-primary text-white shadow-md'
                      : 'text-sap-blue-200 hover:bg-sap-blue-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-sap-blue-300 group-hover:text-white'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className={`text-xs mt-1 ${
                      isActive ? 'text-sap-blue-100' : 'text-sap-blue-300 group-hover:text-sap-blue-100'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sap-blue-800">
        <div className="text-xs text-sap-blue-300 text-center">
          © 2024 Consultare. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
