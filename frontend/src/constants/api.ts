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
} as const;

// Request timeout
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
  ],
} as const;
