# Frontend Structure Documentation

## Overview
This document outlines the optimized structure of the SAP Data Validator frontend application, including reusable components, utilities, and best practices.

## Directory Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── display/        # Data display components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   ├── settings/       # Settings components
│   └── ui/             # Reusable UI components
├── constants/          # Application constants
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── services/           # API services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Reusable Components

### UI Components (`src/components/ui/`)

#### LoadingSpinner
A customizable loading spinner component.

```tsx
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner 
  size="md" 
  color="primary" 
  text="Loading..." 
/>
```

#### Modal
A flexible modal component with overlay and keyboard support.

```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  size="md"
>
  Modal content here
</Modal>
```

#### ConfirmDialog
A confirmation dialog for destructive actions.

```tsx
import { ConfirmDialog } from '@/components/ui';

<ConfirmDialog
  isOpen={isOpen}
  onClose={handleClose}
  onConfirm={handleConfirm}
  title="Delete Item"
  message="Are you sure you want to delete this item?"
  type="danger"
/>
```

#### DataTable
A reusable data table with sorting, loading states, and custom rendering.

```tsx
import { DataTable } from '@/components/ui';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email', render: (value) => <a href={`mailto:${value}`}>{value}</a> }
];

<DataTable
  data={users}
  columns={columns}
  loading={isLoading}
  onRowClick={handleRowClick}
/>
```

#### FormInput
A styled form input with validation support.

```tsx
import { FormInput } from '@/components/ui';

<FormInput
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  error={errors.email}
  required
/>
```

#### FormSelect
A styled select dropdown with options.

```tsx
import { FormSelect } from '@/components/ui';

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' }
];

<FormSelect
  label="Select Option"
  options={options}
  value={selected}
  onChange={setSelected}
/>
```

## Custom Hooks

### useApi
A hook for making API calls with loading states and error handling.

```tsx
import { useApi } from '@/hooks';

const { data, loading, error, execute } = useApi({
  showSuccessToast: true,
  showErrorToast: true
});

const handleSubmit = () => {
  execute(() => apiClient.post('/api/users', userData));
};
```

### useGet, usePost, usePut, useDelete
Specific hooks for different HTTP methods.

```tsx
import { useGet, usePost } from '@/hooks';

const { data: users, loading, get } = useGet('/api/users');
const { post } = usePost('/api/users');

// Fetch users
useEffect(() => {
  get();
}, []);

// Create user
const createUser = (userData) => {
  post(userData);
};
```

## Contexts

### ToastContext
Provides toast notification functionality throughout the app.

```tsx
import { useToast } from '@/contexts';

const { success, error, warning, info } = useToast();

// Show notifications
success('User created successfully');
error('Failed to create user', 'Please try again');
```

### AuthContext
Manages authentication state and permissions.

```tsx
import { useAuth } from '@/contexts';

const { user, permissions, hasPermission, login, logout } = useAuth();

// Check permissions
if (hasPermission('Users', 'can_create')) {
  // Show create button
}
```

## Utilities

### Common Utilities (`src/utils/common.ts`)

#### Storage utilities
```tsx
import { storage } from '@/utils';

storage.set('key', value);
const data = storage.get('key');
storage.remove('key');
```

#### String utilities
```tsx
import { strings } from '@/utils';

strings.capitalize('hello world'); // "Hello world"
strings.truncate('Long text', 10); // "Long text..."
strings.formatPhone('1234567890'); // "(123) 456-7890"
```

#### Date utilities
```tsx
import { dates } from '@/utils';

dates.format(new Date(), 'MM/DD/YYYY'); // "10/14/2025"
dates.getRelativeTime(date); // "2h ago"
```

#### Number utilities
```tsx
import { numbers } from '@/utils';

numbers.formatCurrency(1234.56); // "$1,234.56"
numbers.formatFileSize(1024); // "1 KB"
```

#### Array utilities
```tsx
import { arrays } from '@/utils';

arrays.unique([1, 2, 2, 3]); // [1, 2, 3]
arrays.groupBy(users, 'department'); // { 'IT': [...], 'HR': [...] }
```

### Validation Utilities (`src/utils/validation.ts`)

```tsx
import { FormValidator, commonRules } from '@/utils/validation';

const validator = new FormValidator()
  .addRule('email', commonRules.email())
  .addRule('password', commonRules.password());

const errors = validator.validateForm(formData);
```

## Constants

### Global Constants (`src/constants/global.ts`)

```tsx
import { APP_CONFIG, MODULES, PERMISSIONS, ROUTES } from '@/constants';

console.log(APP_CONFIG.NAME); // "SAP Data Validator"
console.log(MODULES.USERS); // "Users"
console.log(PERMISSIONS.CREATE); // "can_create"
```

## Services

### API Client (`src/services/apiClient.ts`)

```tsx
import { apiClient } from '@/services';

// GET request
const response = await apiClient.get('/api/users');

// POST request
const response = await apiClient.post('/api/users', userData);

// With custom options
const response = await apiClient.get('/api/users', {
  timeout: 10000,
  retries: 2
});
```

## Best Practices

1. **Component Organization**: Keep components in appropriate directories based on their purpose
2. **Reusability**: Use the provided UI components for consistency
3. **Type Safety**: Always use TypeScript types and interfaces
4. **Error Handling**: Use the toast system for user feedback
5. **Loading States**: Show loading indicators for async operations
6. **Validation**: Use the validation utilities for form validation
7. **Constants**: Use the global constants instead of hardcoded strings
8. **API Calls**: Use the custom hooks for API operations

## Import Aliases

Use these import aliases for cleaner imports:

```tsx
import { Button, Modal } from '@/components/ui';
import { useApi, useToast } from '@/hooks';
import { storage, strings } from '@/utils';
import { MODULES, PERMISSIONS } from '@/constants';
```

## Migration Guide

When updating existing components:

1. Replace hardcoded strings with constants
2. Use the new UI components instead of custom ones
3. Implement proper error handling with toast notifications
4. Use the validation utilities for form validation
5. Replace direct API calls with the custom hooks
6. Use the common utilities for data manipulation





