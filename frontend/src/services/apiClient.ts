import { API_BASE_URL } from '../constants/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async get(url: string, params?: Record<string, any>): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await fetch(`${API_BASE_URL}${url}${queryString}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch data' }));
      throw new Error(errorData.message || 'Failed to fetch data');
    }
    
    return response.json();
  }

  async post(url: string, data?: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create data' }));
      throw new Error(errorData.message || 'Failed to create data');
    }
    
    return response.json();
  }

  async put(url: string, data?: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update data' }));
      throw new Error(errorData.message || 'Failed to update data');
    }
    
    return response.json();
  }

  async delete(url: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete data' }));
      throw new Error(errorData.message || 'Failed to delete data');
    }
    
    return response.json();
  }
}

export const apiClient = new ApiClient();
export { ApiClient };

