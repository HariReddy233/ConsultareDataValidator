import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { SAPMainCategory, SAPSubCategory } from '../types';

export const useSAPCategories = () => {
  const [categories, setCategories] = useState<SAPMainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getSAPCategories();
      setCategories(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      console.error('Error fetching SAP categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getSubcategoriesByMainCategoryId = useCallback(async (mainCategoryId: number): Promise<SAPSubCategory[]> => {
    try {
      const response = await api.getSubcategoriesByMainCategoryId(mainCategoryId);
      return response.data;
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      throw err;
    }
  }, []);

  const getSubcategoriesByMainCategoryName = useCallback(async (mainCategoryName: string): Promise<SAPSubCategory[]> => {
    try {
      const response = await api.getSubcategoriesByMainCategoryName(mainCategoryName);
      return response.data;
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      throw err;
    }
  }, []);

  const downloadFile = useCallback(async (subCategoryId: number, fileType: 'template' | 'sample'): Promise<void> => {
    try {
      const blob = await api.downloadFile(subCategoryId, fileType);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from the subcategory
      const subcategory = categories
        .flatMap(cat => cat.SubCategories)
        .find(sub => sub.SubCategoryID === subCategoryId);
      
      const fileName = subcategory ? `${subcategory.SubCategoryName}_${fileType}.xlsx` : `file_${fileType}.xlsx`;
      link.download = fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      throw err;
    }
  }, [categories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    getSubcategoriesByMainCategoryId,
    getSubcategoriesByMainCategoryName,
    downloadFile,
  };
};
