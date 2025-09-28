import { ValidationResponse, InstructionsResponse, SampleDataResponse, SAPCategoriesResponse, SAPMainCategory, SAPSubCategory } from '../types';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';

export const api = {
  // Get validation instructions for a category
  getInstructions: async (category: string): Promise<InstructionsResponse> => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORY.INSTRUCTIONS(category)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch instructions');
    }
    return response.json();
  },

  // Validate uploaded data
  validateData: async (category: string, data: any[]): Promise<ValidationResponse> => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORY.VALIDATE(category)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
    if (!response.ok) {
      throw new Error('Failed to validate data');
    }
    return response.json();
  },

  // Download sample file
  getSampleData: async (category: string): Promise<SampleDataResponse> => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORY.SAMPLE(category)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sample data');
    }
    return response.json();
  },

  // Create new field instruction
  createFieldInstruction: async (category: string, instructionData: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/instructions/${category}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(instructionData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create field instruction');
    }
    return response.json();
  },

  // SAP Categories API
  // Get all categories with subcategories
  getSAPCategories: async (): Promise<SAPCategoriesResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch SAP categories');
    }
    return response.json();
  },

  // Get main categories only
  getMainCategories: async (): Promise<{ success: boolean; data: SAPMainCategory[] }> => {
    const response = await fetch(`${API_BASE_URL}/api/categories/main`);
    if (!response.ok) {
      throw new Error('Failed to fetch main categories');
    }
    return response.json();
  },

  // Get subcategories by main category ID
  getSubcategoriesByMainCategoryId: async (mainCategoryId: number): Promise<{ success: boolean; data: SAPSubCategory[] }> => {
    const response = await fetch(`${API_BASE_URL}/api/categories/${mainCategoryId}/subcategories`);
    if (!response.ok) {
      throw new Error('Failed to fetch subcategories');
    }
    return response.json();
  },

  // Get subcategories by main category name
  getSubcategoriesByMainCategoryName: async (mainCategoryName: string): Promise<{ success: boolean; data: SAPSubCategory[] }> => {
    const response = await fetch(`${API_BASE_URL}/api/categories/name/${encodeURIComponent(mainCategoryName)}/subcategories`);
    if (!response.ok) {
      throw new Error('Failed to fetch subcategories');
    }
    return response.json();
  },

  // Download template or sample file
  downloadFile: async (subCategoryId: number, fileType: 'template' | 'sample'): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/api/categories/download/${subCategoryId}/${fileType}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to download file');
    }
    return response.blob();
  },
};
