import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { DynamicDataResponse, ColumnInfoResponse } from '../types';

class DynamicDataService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get data from any table based on category
  async getDataByCategory(
    category: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    } = {}
  ): Promise<DynamicDataResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${API_BASE_URL}${API_ENDPOINTS.DYNAMIC_DATA.GET_DATA(category)}?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return response.json();
  }

  // Get column information for a category
  async getColumnInfo(category: string): Promise<ColumnInfoResponse> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.DYNAMIC_DATA.GET_COLUMNS(category)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch column info: ${response.statusText}`);
    }

    return response.json();
  }

  // Insert data into the table
  async insertData(category: string, data: Record<string, any>): Promise<any> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.DYNAMIC_DATA.INSERT_DATA(category)}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to insert data: ${response.statusText}`);
    }

    return response.json();
  }

  // Update data in the table
  async updateData(category: string, id: string, data: Record<string, any>): Promise<any> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.DYNAMIC_DATA.UPDATE_DATA(category, id)}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update data: ${response.statusText}`);
    }

    return response.json();
  }

  // Delete data from the table
  async deleteData(category: string, id: string): Promise<any> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.DYNAMIC_DATA.DELETE_DATA(category, id)}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete data: ${response.statusText}`);
    }

    return response.json();
  }
}

export const dynamicDataService = new DynamicDataService();
