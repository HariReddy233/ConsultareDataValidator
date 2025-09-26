import React, { useState, useEffect } from 'react';
import { DataCategory, ValidationField } from '../../types';
import { api } from '../../services/api';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface FieldInstructionsProps {
  category: DataCategory;
  refreshTrigger?: number;
}

const FieldInstructions: React.FC<FieldInstructionsProps> = ({ category, refreshTrigger }) => {
  const [fields, setFields] = useState<ValidationField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        setLoading(true);
        const response = await api.getInstructions(category);
        setFields(response.fields);
        setError(null);
      } catch (err) {
        setError('Failed to load field instructions');
        console.error('Error fetching instructions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructions();
  }, [category, refreshTrigger]);

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
    <div className="space-y-6">
      {/* Fields Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    SAP Field Name
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Database Field Name
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Data Type
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Field Length
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Mandatory
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Valid Values
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fields.map((field, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-mono text-gray-900 font-medium">
                      {field.sapFile}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {field.dbField}
                    </td>
                    <td className="py-4 px-6">
                      {getDataTypeBadge(field.type)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {field.length}
                    </td>
                    <td className="py-4 px-6">
                      {getMandatoryBadge(field.mandatory)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {field.validValues ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {field.validValues.map((value, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-xs bg-gray-100 text-gray-700 border-gray-300"
                            >
                              {value}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 max-w-md">
                      <div className="truncate" title={field.description}>
                        {field.description}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Data Type Legend */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Type Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">AlphaNumeric</Badge>
              <span className="text-sm text-gray-600">Text and numbers</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Char</Badge>
              <span className="text-sm text-gray-600">Character string</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">Numeric</Badge>
              <span className="text-sm text-gray-600">Decimal numbers</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">Integer</Badge>
              <span className="text-sm text-gray-600">Whole numbers</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-pink-100 text-pink-800 border-pink-200 text-xs">Date</Badge>
              <span className="text-sm text-gray-600">Date values</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldInstructions;

