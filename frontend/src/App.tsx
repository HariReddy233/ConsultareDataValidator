import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import { DataCategory } from './types';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<DataCategory>('BusinessPartnerMasterData');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        selectedCategory={selectedCategory} 
        onCategoryChange={setSelectedCategory} 
      />
      <MainContent category={selectedCategory} />
    </div>
  );
}

export default App;
