export interface ValidationField {
  [key: string]: any; // Completely dynamic - any field from database
}

export interface ValidationResult {
  rowNumber: number;
  code: string;
  status: 'Valid' | 'Warning' | 'Error';
  fieldsWithIssues: string[];
  message: string;
  aiInsights?: string;
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
  aiRecommendations?: string;
  validationMethod?: 'AI' | 'Basic';
  aiError?: string;
}

export interface InstructionsResponse {
  success: boolean;
  category: string;
  fields: ValidationField[];
  instructions?: ValidationField[]; // Add instructions property for subcategory API
  columnNames?: string[];
  dataTable?: string;
  source?: string;
  totalRecords?: number;
  count?: number;
}

export interface SampleDataResponse {
  success: boolean;
  category: string;
  headers: string[];
  sampleData: Record<string, string>[];
}

// DataCategory is now a string that represents the main category name with spaces removed
// This allows for dynamic categories loaded from the database
export type DataCategory = string;

export interface TabConfig {
  id: string;
  label: string;
  category: DataCategory;
}

// New SAP Category types
export interface SAPSubCategory {
  SubCategoryID: number;
  SubCategoryName: string;
  TemplatePath: string;
  SamplePath: string;
  Data_Table: string;
}

export interface SAPMainCategory {
  MainCategoryID: number;
  MainCategoryName: string;
  SubCategories: SAPSubCategory[];
}

export interface SAPCategoriesResponse {
  success: boolean;
  data: SAPMainCategory[];
}

// Dynamic Data API types
export interface DynamicDataResponse {
  success: boolean;
  message: string;
  data: {
    category: string;
    tableName: string;
    columns: string[];
    data: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      limit: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    search: string;
    sort: {
      by: string;
      order: string;
    };
  };
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  maxLength: number | null;
  precision: number | null;
  scale: number | null;
}

export interface ColumnInfoResponse {
  success: boolean;
  message: string;
  data: {
    category: string;
    tableName: string;
    columns: ColumnInfo[];
  };
}

export interface FileDownloadResponse {
  success: boolean;
  message?: string;
  filePath?: string;
}

// Settings menu types
export interface SettingsMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  hasSubmenu?: boolean;
  submenuItems?: SettingsSubMenuItem[];
}

export interface SettingsSubMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path?: string;
}

export type SettingsCategory = 'settings';