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
    //description: 'Customer and vendor data validation',
    icon: Users,
  },
  {
    id: 'ItemMasterData' as DataCategory,
    label: 'Item Master Data',
    //description: 'Product and service item validation',
    icon: Package,
  },
  {
    id: 'FinancialData' as DataCategory,
    label: 'Financial Data',
    //description: 'Accounting and financial validation',
    icon: Calculator,
  },
  {
    id: 'SetupData' as DataCategory,
    label: 'Set Up Data',
    //description: 'System configuration validation',
    icon: Database,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div className="w-72 bg-sap-gray-900 text-white flex flex-col shadow-lg min-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-300">
        <div className="flex items-center space-x-3">
          <img 
            src="/images/SAP_BusinessOne_R_grad_blu.png" 
            alt="SAP Business One" 
            className="h-12 w-200 object-contain "
          />
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
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sap-gray-800">
        <div className="flex justify-center">
          <img 
            src="/images/Consultare.png" 
            alt="Consultare" 
            className="h-8 w-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
