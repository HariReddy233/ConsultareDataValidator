// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

// API Endpoints
export const API_ENDPOINTS = {
  // Instructions
  INSTRUCTIONS: {
    GET_ALL: '/sap_bp_master_instructions',
    GET_BY_FIELD: (fieldName: string) => `/sap_bp_master_instructions/${fieldName}`,
    CREATE: '/sap_bp_master_instructions',
    UPDATE: (fieldName: string) => `/sap_bp_master_instructions/${fieldName}`,
    DELETE: (fieldName: string) => `/sap_bp_master_instructions/${fieldName}`,
  },
  // Category-based endpoints
  CATEGORY: {
    INSTRUCTIONS: (category: string) => `/instructions/${category}`,
    VALIDATE: (category: string) => `/validate/${category}`,
    SAMPLE: (category: string) => `/download-sample/${category}`,
  },
  // Debug
  DEBUG: {
    TABLES: '/debug/tables',
  },
  // Health
  HEALTH: '/health',
  // Authentication
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password',
    PERMISSIONS: '/api/auth/permissions',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  // Dynamic Data
  DYNAMIC_DATA: {
    GET_DATA: (category: string) => `/api/dynamic-data/${category}`,
    GET_COLUMNS: (category: string) => `/api/dynamic-data/${category}/columns`,
    INSERT_DATA: (category: string) => `/api/dynamic-data/${category}`,
    UPDATE_DATA: (category: string, id: string) => `/api/dynamic-data/${category}/${id}`,
    DELETE_DATA: (category: string, id: string) => `/api/dynamic-data/${category}/${id}`
  },
} as const;

// Request timeout
export const REQUEST_TIMEOUT = 120000; // 2 minutes for large datasets

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
  ],
} as const;
