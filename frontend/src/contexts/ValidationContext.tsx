import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DataCategory, ValidationResult, ValidationSummary } from '../types';

interface ValidationContextType {
  selectedCategory: DataCategory | null;
  validationResults: ValidationResult[];
  validationSummary: ValidationSummary | null;
  setSelectedCategory: (category: DataCategory | null) => void;
  setValidationResults: (results: ValidationResult[]) => void;
  setValidationSummary: (summary: ValidationSummary | null) => void;
  clearValidation: () => void;
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

interface ValidationProviderProps {
  children: ReactNode;
}

export const ValidationProvider: React.FC<ValidationProviderProps> = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState<DataCategory | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);

  const clearValidation = () => {
    setValidationResults([]);
    setValidationSummary(null);
  };

  const value: ValidationContextType = {
    selectedCategory,
    validationResults,
    validationSummary,
    setSelectedCategory,
    setValidationResults,
    setValidationSummary,
    clearValidation,
  };

  return (
    <ValidationContext.Provider value={value}>
      {children}
    </ValidationContext.Provider>
  );
};

export const useValidationContext = (): ValidationContextType => {
  const context = useContext(ValidationContext);
  if (context === undefined) {
    throw new Error('useValidationContext must be used within a ValidationProvider');
  }
  return context;
};
