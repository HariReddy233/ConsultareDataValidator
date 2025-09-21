import React, { useState, useEffect } from 'react';
import { DataCategory, ValidationField } from '../types';
import { api } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Plus, Loader2 } from 'lucide-react';

interface FieldInstructionsProps {
  category: DataCategory;
}

const FieldInstructions: React.FC<FieldInstructionsProps> = ({ category }) => {
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
  }, [category]);

  const getMandatoryBadge = (mandatory: boolean) => {
    return mandatory ? (
      <Badge variant="error">Yes</Badge>
    ) : (
      <Badge variant="success">No</Badge>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Field Instructions</h2>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Field
        </Button>
      </div>

      {/* Fields Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                COLUMN NAME
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                FIELD NAME
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                LENGTH
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                IS MANDATORY
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                RELATED TABLE
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                REMARKS
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                DESCRIPTION
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                  {field.sapFile}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900">
                  {field.dbField}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {field.length}
                </td>
                <td className="py-3 px-4">
                  {getMandatoryBadge(field.mandatory)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {field.relatedTable}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {field.validValues ? (
                    <div className="flex flex-wrap gap-1">
                      {field.validValues.map((value, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {field.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FieldInstructions;

