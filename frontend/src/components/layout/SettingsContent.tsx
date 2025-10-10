import React from 'react';
import { 
  Shield
} from 'lucide-react';
import UsersManagement from '../settings/UsersManagement';
import RolesDepartmentsManagement from '../settings/RolesDepartmentsManagement';
import AuthorizationManagement from '../settings/AuthorizationManagement';
import ProfileSettings from '../settings/ProfileSettings';

interface SettingsContentProps {
  selectedMenuItem?: string;
  onMenuItemSelect?: (itemId: string) => void;
}

const SettingsContent: React.FC<SettingsContentProps> = ({ 
  selectedMenuItem, 
  onMenuItemSelect 
}) => {

  // If Users is selected, show the UsersManagement component
  if (selectedMenuItem === 'users') {
    return <UsersManagement />;
  }

  // If Roles & Departments is selected, show the RolesDepartmentsManagement component
  if (selectedMenuItem === 'roles-departments') {
    return <RolesDepartmentsManagement />;
  }

  // If Authorization is selected, show the AuthorizationManagement component
  if (selectedMenuItem === 'authorization') {
    return <AuthorizationManagement />;
  }

  // If Profile is selected, show the ProfileSettings component
  if (selectedMenuItem === 'profile') {
    return <ProfileSettings />;
  }

  // If no specific menu item is selected, show nothing (just the dropdown in sidebar)
  if (!selectedMenuItem) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-500">Select a settings option from the sidebar to get started.</p>
          </div>
        </div>
      </div>
    );
  }

  // If a specific menu item is selected but not handled above, show a placeholder
  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedMenuItem.charAt(0).toUpperCase() + selectedMenuItem.slice(1).replace('-', ' ')}
          </h3>
          <p className="text-gray-500">This settings section is coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;
