export interface ValidationField {
  sapFile: string;
  dbField: string;
  description: string;
  type: string;
  length: number;
  mandatory: boolean;
  validValues: string[] | null;
  relatedTable: string;
}

export interface ValidationResult {
  rowNumber: number;
  code: string;
  status: 'Valid' | 'Warning' | 'Error';
  fieldsWithIssues: string[];
  message: string;
}

export interface ValidationSummary {
  total: number;
  valid: number;
  warnings: number;
  errors: number;
}

export interface ValidationResponse {
  success: boolean;
  category: string;
  summary: ValidationSummary;
  results: ValidationResult[];
}

export interface InstructionsResponse {
  success: boolean;
  category: string;
  fields: ValidationField[];
}

export interface SampleDataResponse {
  success: boolean;
  category: string;
  headers: string[];
  sampleData: Record<string, string>[];
}

export type DataCategory = 'BusinessPartnerMasterData' | 'ItemMasterData' | 'FinancialData' | 'SetupData';

export interface TabConfig {
  id: string;
  label: string;
  category: DataCategory;
}
