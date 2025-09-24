import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import { ValidationProvider } from './contexts/ValidationContext';
import { DataCategory } from './types';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<DataCategory>('BusinessPartnerMasterData');

  return (
    <ValidationProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          selectedCategory={selectedCategory} 
          onCategoryChange={setSelectedCategory} 
        />
        <MainContent category={selectedCategory} />
      </div>
    </ValidationProvider>
  );
}

export default App;
