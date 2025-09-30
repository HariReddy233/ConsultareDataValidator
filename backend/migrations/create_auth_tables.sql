-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) UNIQUE NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) DEFAULT 'user',
    user_department VARCHAR(100),
    user_phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id VARCHAR(50) PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    department_id VARCHAR(50) PRIMARY KEY,
    department_name VARCHAR(100) UNIQUE NOT NULL,
    department_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create modules table for permissions
CREATE TABLE IF NOT EXISTS modules (
    module_id VARCHAR(50) PRIMARY KEY,
    module_name VARCHAR(100) NOT NULL,
    module_description TEXT,
    module_path VARCHAR(200),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
    permission_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
    module_id VARCHAR(50) REFERENCES modules(module_id) ON DELETE CASCADE,
    can_read BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_export BOOLEAN DEFAULT false,
    can_print BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, module_id)
);

-- Insert default roles
INSERT INTO roles (role_id, role_name, role_description) VALUES 
('admin', 'Administrator', 'Full system access'),
('user', 'User', 'Standard user access'),
('viewer', 'Viewer', 'Read-only access')
ON CONFLICT (role_id) DO NOTHING;

-- Insert default departments
INSERT INTO departments (department_id, department_name, department_description) VALUES 
('it', 'Information Technology', 'IT Department'),
('finance', 'Finance', 'Finance Department'),
('hr', 'Human Resources', 'HR Department'),
('operations', 'Operations', 'Operations Department')
ON CONFLICT (department_id) DO NOTHING;

-- Insert default modules
INSERT INTO modules (module_id, module_name, module_description, module_path) VALUES 
('data_validation', 'Data Validation', 'SAP Data Validation Module', '/validation'),
('field_instructions', 'Field Instructions', 'Field Instructions Management', '/instructions'),
('categories', 'Categories', 'SAP Categories Management', '/categories'),
('reports', 'Reports', 'Reports and Analytics', '/reports'),
('settings', 'Settings', 'System Settings', '/settings')
ON CONFLICT (module_id) DO NOTHING;

-- Create default admin user (password: admin123)
-- Note: This password should be changed on first login
INSERT INTO users (user_id, user_name, user_email, user_password, user_role, user_department) VALUES 
('admin', 'System Administrator', 'admin@consultare.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'it')
ON CONFLICT (user_id) DO NOTHING;

-- Grant all permissions to admin user
INSERT INTO user_permissions (permission_id, user_id, module_id, can_read, can_create, can_update, can_delete, can_export, can_print)
SELECT 
    'perm_' || modules.module_id || '_admin',
    'admin',
    modules.module_id,
    true, true, true, true, true, true
FROM modules
ON CONFLICT (permission_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(user_email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(user_role);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_module_id ON user_permissions(module_id);
