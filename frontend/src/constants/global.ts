// Global constants for the application
export const APP_CONFIG = {
  NAME: 'SAP Data Validator',
  VERSION: '1.0.0',
  DESCRIPTION: 'Consultare SAP Data Validation System',
} as const;

export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  PAGINATION_DEFAULT_SIZE: 10,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

export const PERMISSIONS = {
  CREATE: 'can_create',
  READ: 'can_read',
  UPDATE: 'can_update',
  DELETE: 'can_delete',
  EXPORT: 'can_export',
  PRINT: 'can_print',
} as const;

export const MODULES = {
  SAP_DATA_VALIDATOR: 'SAP Data Validator',
  BUSINESS_PARTNER: 'Business Partner Master Data',
  ITEM_MASTER: 'Item Master Data',
  FINANCIAL_DATA: 'Financial Data',
  SETUP_DATA: 'Set Up Data',
  ASSET_MASTER: 'Asset Master Data',
  FIELD_INSTRUCTIONS: 'Field Instructions',
  SETTINGS: 'Settings',
  USERS: 'Users',
  ROLES_DEPARTMENTS: 'Roles & Departments',
  AUTHORIZATION: 'Authorization',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  PROFILE: '/settings/profile',
  USERS: '/settings/users',
  ROLES: '/settings/roles',
  AUTHORIZATION: '/settings/authorization',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
  AUTH_PERMISSIONS: 'auth_permissions',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
} as const;

export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successful',
    LOGOUT: 'Logout successful',
    REGISTER: 'Registration successful',
    UPDATE: 'Update successful',
    DELETE: 'Delete successful',
    SAVE: 'Save successful',
  },
  ERROR: {
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied.',
    NOT_FOUND: 'Resource not found.',
    VALIDATION: 'Please check your input and try again.',
    GENERIC: 'An error occurred. Please try again.',
  },
  LOADING: {
    SAVING: 'Saving...',
    LOADING: 'Loading...',
    PROCESSING: 'Processing...',
    UPLOADING: 'Uploading...',
  },
} as const;


