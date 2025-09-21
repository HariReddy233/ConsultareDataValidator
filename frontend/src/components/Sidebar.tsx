import React from 'react';
import { 
  Users, 
  Package, 
  TrendingUp, 
  Database, 
  Settings 
} from 'lucide-react';
import { DataCategory } from '../types';

interface SidebarProps {
  selectedCategory: DataCategory;
  onCategoryChange: (category: DataCategory) => void;
}

const menuItems = [
  {
    id: 'BusinessPartnerMasterData' as DataCategory,
    label: 'Business Partner Master Data',
    icon: Users,
  },
  {
    id: 'ItemMasterData' as DataCategory,
    label: 'Item Master Data',
    icon: Package,
  },
  {
    id: 'FinancialData' as DataCategory,
    label: 'Financial Data',
    icon: TrendingUp,
  },
  {
    id: 'SetupData' as DataCategory,
    label: 'Set Up Data',
    icon: Database,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div className="w-64 bg-blue-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-xl font-bold">SAP B1 Data Validation</h1>
        <p className="text-sm text-blue-200 mt-1">Master Data Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedCategory === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onCategoryChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-800">
        <button className="w-full flex items-center px-4 py-3 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition-colors">
          <Settings className="w-5 h-5 mr-3" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
