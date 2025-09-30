import React, { useState, useEffect } from 'react';
import { DataCategory, ValidationField } from '../../types';
import { api } from '../../services/api';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface FieldInstructionsProps {
  category: DataCategory;
  subcategory?: string;
  refreshTrigger?: number;
}

const FieldInstructions: React.FC<FieldInstructionsProps> = ({ category, subcategory, refreshTrigger }) => {
  const [fields, setFields] = useState<ValidationField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructionsAndSubcategory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch field instructions using dynamic API
        if (subcategory) {
          try {
            // Use the new dynamic API to fetch field instructions from Data_Table
            const response = await api.getDynamicFieldInstructions(subcategory);
            setFields(response.fields);
          } catch (err) {
            console.error('Error fetching dynamic field instructions:', err);
            // Fallback to old API
            try {
              const response = await api.getInstructionsBySubcategory(subcategory);
              setFields(response.fields);
            } catch (fallbackErr) {
              console.error('Fallback API also failed:', fallbackErr);
              throw fallbackErr;
            }
          }
        } else {
          // Fallback to category-based API
          const response = await api.getInstructions(category);
          setFields(response.fields);
        }
      } catch (err) {
        setError('Failed to load field instructions');
        console.error('Error fetching instructions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructionsAndSubcategory();
  }, [category, subcategory, refreshTrigger]);


  const getDataTypeBadge = (type: string) => {
    const typeColors = {
      'AlphaNumeric': 'bg-blue-100 text-blue-800 border-blue-200',
      'Char': 'bg-green-100 text-green-800 border-green-200',
      'Numeric': 'bg-purple-100 text-purple-800 border-purple-200',
      'Integer': 'bg-orange-100 text-orange-800 border-orange-200',
      'Date': 'bg-pink-100 text-pink-800 border-pink-200',
    };
    
    const colorClass = typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800 border-gray-200';
    
    return (
      <Badge className={`text-xs ${colorClass}`}>
        {type}
      </Badge>
    );
  };

  const getMandatoryBadge = (mandatory: boolean) => {
    return mandatory ? (
      <div className="flex items-center gap-1">
        <CheckCircle className="w-3 h-3 text-sap-error" />
        <span className="text-xs font-medium text-sap-error">Required</span>
      </div>
    ) : (
      <div className="flex items-center gap-1">
        <AlertCircle className="w-3 h-3 text-gray-400" />
        <span className="text-xs font-medium text-gray-500">Optional</span>
      </div>
    );
  };

  // Get all available field keys from the first field to create dynamic columns
  const getFieldKeys = () => {
    if (fields.length === 0) return [];
    const keys = Object.keys(fields[0]);
    // Ensure errorDetails is always included even if not in the data
    if (!keys.includes('errorDetails')) {
      keys.push('errorDetails');
    }
    return keys;
  };

  // Get display name for field key
  const getFieldDisplayName = (key: string) => {
    const displayNames: { [key: string]: string } = {
      sapFile: 'SAP Field Name',
      dbField: 'Database Field Name',
      description: 'Description',
      type: 'Data Type',
      length: 'Field Length',
      mandatory: 'Mandatory',
      validValues: 'Valid Values',
      relatedTable: 'Related Table',
      remarks: 'Remarks',
      instructionImagePath: 'Instruction Image Path',
      tableName: 'Table Name',
      errorDetails: 'Error Details'
    };
    return displayNames[key] || key;
  };

  // Render field value based on its type
  const renderFieldValue = (key: string, value: any) => {
    if (key === 'type') {
      return getDataTypeBadge(value);
    }
    if (key === 'mandatory') {
      return getMandatoryBadge(value);
    }
    if (key === 'validValues' && value) {
      return (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {value.map((val: string, idx: number) => (
            <Badge 
              key={idx} 
              variant="outline" 
              className="text-xs bg-gray-100 text-gray-700 border-gray-300"
            >
              {val}
            </Badge>
          ))}
        </div>
      );
    }
    if (key === 'errorDetails') {
      // For now, we'll show a placeholder since we don't have error data in the field instructions
      // This would typically come from validation results
      return (
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {value || 'No errors'}
          </span>
        </div>
      );
    }
    if (key === 'description' || key === 'remarks') {
      return (
        <div className="truncate max-w-md" title={value}>
          {value || '-'}
        </div>
      );
    }
    if (key === 'instructionImagePath') {
      return (
        <div className="truncate max-w-xs" title={value}>
          <span className="text-sm text-gray-600">{value || '-'}</span>
        </div>
      );
    }
    return <span className="text-sm text-gray-600">{value || '-'}</span>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading field instructions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Field Instructions View */}
      <Card className="overflow-hidden flex-1 flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[calc(100vh-300px)]">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  {getFieldKeys().map((key) => (
                    <th key={key} className="text-left py-4 px-6 font-semibold text-gray-900 text-sm whitespace-nowrap">
                      {getFieldDisplayName(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fields.map((field, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    {getFieldKeys().map((key) => (
                      <td key={key} className="py-4 px-6 whitespace-nowrap">
                        {key === 'sapFile' ? (
                          <span className="text-sm font-mono text-gray-900 font-medium">
                            {field[key as keyof typeof field]}
                          </span>
                        ) : (
                          renderFieldValue(key, field[key as keyof typeof field] || null)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldInstructions;
