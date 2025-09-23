import { ValidationResponse, InstructionsResponse, SampleDataResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

export const api = {
  // Get validation instructions for a category
  getInstructions: async (category: string): Promise<InstructionsResponse> => {
    const response = await fetch(`${API_BASE_URL}/instructions/${category}`);
    if (!response.ok) {
      throw new Error('Failed to fetch instructions');
    }
    return response.json();
  },

  // Validate uploaded data
  validateData: async (category: string, data: any[]): Promise<ValidationResponse> => {
    const response = await fetch(`${API_BASE_URL}/validate/${category}`, {
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
    const response = await fetch(`${API_BASE_URL}/download-sample/${category}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sample data');
    }
    return response.json();
  },
};
