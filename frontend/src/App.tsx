import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import { ValidationProvider } from './contexts/ValidationContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DataCategory } from './types';
import { useSAPCategories } from './hooks/useSAPCategories';

function AppContent() {
  const { categories, loading } = useSAPCategories();
  const [selectedCategory, setSelectedCategory] = useState<DataCategory>('');

  // Set the first category as selected when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      const firstCategory = categories[0].MainCategoryName.replace(/\s+/g, '') as DataCategory;
      setSelectedCategory(firstCategory);
    }
  }, [categories, selectedCategory]);

  // Show loading state while categories are being fetched
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <div className="w-72 bg-sap-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-blue-400">Loading categories...</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        selectedCategory={selectedCategory} 
        onCategoryChange={setSelectedCategory} 
      />
      <MainContent category={selectedCategory} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ValidationProvider>
        <ProtectedRoute>
          <AppContent />
        </ProtectedRoute>
      </ValidationProvider>
    </AuthProvider>
  );
}

export default App;
