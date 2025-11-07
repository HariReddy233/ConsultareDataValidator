import { useState, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import { useToast } from '../contexts/ToastContext';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation successful',
    errorMessage = 'An error occurred',
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { success, error: showError } = useToast();

  const execute = useCallback(async (
    apiCall: () => Promise<any>,
    customOptions?: Partial<UseApiOptions>
  ) => {
    const opts = { ...options, ...customOptions };
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiCall();
      
      setState({
        data: response.data || response,
        loading: false,
        error: null,
      });

      if (opts.showSuccessToast) {
        success(opts.successMessage || successMessage);
      }

      if (opts.onSuccess) {
        opts.onSuccess(response.data || response);
      }

      return response;
    } catch (err: any) {
      const errorMsg = err.message || errorMessage;
      
      setState({
        data: null,
        loading: false,
        error: errorMsg,
      });

      if (opts.showErrorToast) {
        showError(opts.errorMessage || errorMessage, errorMsg);
      }

      if (opts.onError) {
        opts.onError(errorMsg);
      }

      throw err;
    }
  }, [options, successMessage, errorMessage, success, showError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specific API hooks for common operations
export function useGet<T = any>(endpoint: string, options?: UseApiOptions) {
  const api = useApi<T>(options);
  
  const get = useCallback((params?: Record<string, any>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.execute(() => apiClient.get(`${endpoint}${queryString}`));
  }, [api, endpoint]);

  return {
    ...api,
    get,
  };
}

export function usePost<T = any>(endpoint: string, options?: UseApiOptions) {
  const api = useApi<T>(options);
  
  const post = useCallback((data?: any) => {
    return api.execute(() => apiClient.post(endpoint, data));
  }, [api, endpoint]);

  return {
    ...api,
    post,
  };
}

export function usePut<T = any>(endpoint: string, options?: UseApiOptions) {
  const api = useApi<T>(options);
  
  const put = useCallback((data?: any) => {
    return api.execute(() => apiClient.put(endpoint, data));
  }, [api, endpoint]);

  return {
    ...api,
    put,
  };
}

export function useDelete<T = any>(endpoint: string, options?: UseApiOptions) {
  const api = useApi<T>(options);
  
  const deleteItem = useCallback(() => {
    return api.execute(() => apiClient.delete(endpoint));
  }, [api, endpoint]);

  return {
    ...api,
    delete: deleteItem,
  };
}





