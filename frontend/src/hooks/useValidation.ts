import { useState, useCallback } from 'react';
import { ValidationResult, ValidationSummary } from '../types';

interface UseValidationReturn {
  validationResults: ValidationResult[];
  validationSummary: ValidationSummary | null;
  isValidating: boolean;
  validateData: (data: any[], category: string) => Promise<void>;
  clearResults: () => void;
}

export const useValidation = (): UseValidationReturn => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateData = useCallback(async (data: any[], category: string) => {
    setIsValidating(true);
    try {
      const response = await fetch(`/validate/${category}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const result = await response.json();
      setValidationResults(result.results || []);
      setValidationSummary(result.summary || null);
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResults([]);
      setValidationSummary(null);
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setValidationResults([]);
    setValidationSummary(null);
  }, []);

  return {
    validationResults,
    validationSummary,
    isValidating,
    validateData,
    clearResults,
  };
};
