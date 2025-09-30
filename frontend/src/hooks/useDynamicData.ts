import { useState, useEffect, useCallback } from 'react';
import { dynamicDataService } from '../services/dynamicDataService';
import { DynamicDataResponse, ColumnInfoResponse } from '../types';

interface UseDynamicDataParams {
  category: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  autoFetch?: boolean;
}

interface UseDynamicDataReturn {
  data: any[] | null;
  columns: string[] | null;
  columnInfo: any[] | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateParams: (newParams: Partial<UseDynamicDataParams>) => void;
  insertData: (data: Record<string, any>) => Promise<any>;
  updateData: (id: string, data: Record<string, any>) => Promise<any>;
  deleteData: (id: string) => Promise<any>;
}

export const useDynamicData = (params: UseDynamicDataParams): UseDynamicDataReturn => {
  const [data, setData] = useState<any[] | null>(null);
  const [columns, setColumns] = useState<string[] | null>(null);
  const [columnInfo, setColumnInfo] = useState<any[] | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState(params);

  const fetchData = useCallback(async () => {
    if (!currentParams.category) return;

    try {
      setLoading(true);
      setError(null);

      const response: DynamicDataResponse = await dynamicDataService.getDataByCategory(
        currentParams.category,
        {
          page: currentParams.page,
          limit: currentParams.limit,
          search: currentParams.search,
          sortBy: currentParams.sortBy,
          sortOrder: currentParams.sortOrder,
        }
      );

      if (response.success) {
        setData(response.data.data);
        setColumns(response.data.columns);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentParams]);

  const fetchColumnInfo = useCallback(async () => {
    if (!currentParams.category) return;

    try {
      const response: ColumnInfoResponse = await dynamicDataService.getColumnInfo(
        currentParams.category
      );

      if (response.success) {
        setColumnInfo(response.data.columns);
      }
    } catch (err) {
      console.error('Failed to fetch column info:', err);
    }
  }, [currentParams.category]);

  const insertData = useCallback(async (newData: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await dynamicDataService.insertData(currentParams.category, newData);
      
      if (response.success) {
        // Refresh data after successful insert
        await fetchData();
        return response;
      } else {
        throw new Error(response.message || 'Failed to insert data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to insert data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentParams.category, fetchData]);

  const updateData = useCallback(async (id: string, updatedData: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await dynamicDataService.updateData(currentParams.category, id, updatedData);
      
      if (response.success) {
        // Refresh data after successful update
        await fetchData();
        return response;
      } else {
        throw new Error(response.message || 'Failed to update data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentParams.category, fetchData]);

  const deleteData = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await dynamicDataService.deleteData(currentParams.category, id);
      
      if (response.success) {
        // Refresh data after successful delete
        await fetchData();
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentParams.category, fetchData]);

  const updateParams = useCallback((newParams: Partial<UseDynamicDataParams>) => {
    setCurrentParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Auto-fetch data when params change
  useEffect(() => {
    if (currentParams.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, currentParams.autoFetch]);

  // Fetch column info when category changes
  useEffect(() => {
    if (currentParams.category) {
      fetchColumnInfo();
    }
  }, [fetchColumnInfo, currentParams.category]);

  return {
    data,
    columns,
    columnInfo,
    pagination,
    loading,
    error,
    refetch,
    updateParams,
    insertData,
    updateData,
    deleteData,
  };
};
