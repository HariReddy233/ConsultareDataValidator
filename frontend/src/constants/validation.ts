// Validation categories
export const VALIDATION_CATEGORIES = {
  BUSINESS_PARTNER: 'BusinessPartnerMasterData',
  ITEM_MASTER: 'ItemMasterData',
  FINANCIAL: 'FinancialData',
  SETUP: 'SetupData',
} as const;

export type ValidationCategory = typeof VALIDATION_CATEGORIES[keyof typeof VALIDATION_CATEGORIES];

// Validation status
export const VALIDATION_STATUS = {
  VALID: 'Valid',
  WARNING: 'Warning',
  ERROR: 'Error',
} as const;

export type ValidationStatus = typeof VALIDATION_STATUS[keyof typeof VALIDATION_STATUS];

// Data types
export const DATA_TYPES = {
  CHAR: 'Char',
  INTEGER: 'Integer',
  STRING: 'String',
  DECIMAL: 'Decimal',
  DATE: 'Date',
} as const;

export type DataType = typeof DATA_TYPES[keyof typeof DATA_TYPES];

// Field validation rules
export const FIELD_RULES = {
  MANDATORY: 'mandatory',
  LENGTH: 'length',
  VALID_VALUES: 'validValues',
  DATA_TYPE: 'dataType',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Field is mandatory and cannot be empty',
  LENGTH_EXCEEDED: 'Field length exceeds maximum of',
  INVALID_VALUE: 'Invalid value. Must be one of:',
  INVALID_TYPE: 'Must be a valid',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload Excel or CSV files',
  UPLOAD_FAILED: 'File upload failed',
  VALIDATION_FAILED: 'Validation failed',
  NETWORK_ERROR: 'Network error. Please check your connection',
} as const;
