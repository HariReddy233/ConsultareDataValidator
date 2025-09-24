import { ValidationResponse, InstructionsResponse, SampleDataResponse } from '../types';
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
};
