import React, { useState, useEffect } from 'react';
import { DataCategory, ValidationField } from '../../types';
import { api } from '../../services/api';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Loader2, FileText } from 'lucide-react';

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
        
        if (subcategory) {
          const response = await api.getInstructionsBySubcategory(subcategory);
          setFields(response.instructions || response.fields || []);
        } else {
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


  // Get all available field keys from the first field to create dynamic columns
  const getFieldKeys = () => {
    if (fields.length === 0) return [];
    return Object.keys(fields[0]);
  };

  // Get display name for field key
  const getFieldDisplayName = (key: string) => {
    const displayNames: { [key: string]: string } = {
      sap_field_name: 'SAP Field Name',
      db_field_name: 'Database Field Name',
      description: 'Description',
      data_type: 'Data Type',
      field_length: 'Field Length',
      is_mandatory: 'Mandatory',
      valid_values: 'Valid Values',
      related_table: 'Related Table',
      remarks: 'Remarks',
      instruction_image_path: 'Instruction Image Path',
      table_name: 'Table Name'
    };
    return displayNames[key] || key;
  };

  // Render field value with appropriate formatting
  const renderFieldValue = (field: ValidationField, key: string) => {
    const value = field[key];
    
    if (value === null || value === undefined) {
      return <span className="text-sm text-gray-400">-</span>;
    }
    
    if (key === 'is_mandatory') {
      return (
        <Badge variant={value ? 'success' : 'secondary'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    }
    
    if (key === 'valid_values' && Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {value.map((item, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {item}
            </Badge>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'string' && value.length > 50) {
      return (
        <div className="truncate max-w-md" title={value}>
          <span className="text-sm text-gray-600">{value}</span>
        </div>
      );
    }
    
    return <span className="text-sm text-gray-600">{String(value)}</span>;
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
      {/* Field Instructions Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Field Instructions</h2>
            <p className="text-sm text-gray-600">
              {fields.length > 0 
                ? `Viewing ${fields.length} field instruction${fields.length === 1 ? '' : 's'}`
                : 'No field instructions available'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Field Instructions View */}
      <Card className="overflow-hidden flex-1 flex flex-col shadow-sm border-0 bg-white">
        <CardContent className="p-0 flex-1 flex flex-col">
          <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[calc(100vh-300px)]">
            <table className="w-full min-w-max">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  {getFieldKeys().map((key) => (
                    <th key={key} className="text-left py-4 px-6 font-semibold text-gray-900 text-sm whitespace-nowrap">
                      {getFieldDisplayName(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fields.map((field, index) => (
                  <tr key={index} className="hover:bg-blue-50/30 transition-colors duration-200">
                    {getFieldKeys().map((key) => (
                      <td key={key} className="py-4 px-6 whitespace-nowrap">
                        {renderFieldValue(field, key)}
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
