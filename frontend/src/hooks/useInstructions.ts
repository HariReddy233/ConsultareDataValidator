import { useState, useCallback, useEffect } from 'react';
import { ValidationField } from '../types';

interface UseInstructionsReturn {
  instructions: ValidationField[];
  isLoading: boolean;
  error: string | null;
  fetchInstructions: (category: string) => Promise<void>;
  clearInstructions: () => void;
}

export const useInstructions = (): UseInstructionsReturn => {
  const [instructions, setInstructions] = useState<ValidationField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstructions = useCallback(async (category: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/instructions/${category}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch instructions: ${response.statusText}`);
      }

      const result = await response.json();
      setInstructions(result.fields || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching instructions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearInstructions = useCallback(() => {
    setInstructions([]);
    setError(null);
  }, []);

  return {
    instructions,
    isLoading,
    error,
    fetchInstructions,
    clearInstructions,
  };
};
