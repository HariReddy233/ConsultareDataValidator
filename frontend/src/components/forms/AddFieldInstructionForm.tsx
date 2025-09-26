import React, { useState } from 'react';
import { DataCategory } from '../../types';
import { api } from '../../services/api';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { X, Plus } from 'lucide-react';

interface AddFieldInstructionFormProps {
  category: DataCategory;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  sap_field_name: string;
  db_field_name: string;
  description: string;
  data_type: string;
  field_length: string;
  is_mandatory: boolean;
  valid_values: string;
  related_table: string;
}

const AddFieldInstructionForm: React.FC<AddFieldInstructionFormProps> = ({
  category,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<FormData>({
    sap_field_name: '',
    db_field_name: '',
    description: '',
    data_type: 'Char',
    field_length: '',
    is_mandatory: false,
    valid_values: '',
    related_table: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dataTypes = ['Char', 'AlphaNumeric', 'Numeric', 'Integer', 'Date'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createFieldInstruction(category, formData);

      // Reset form and close
      setFormData({
        sap_field_name: '',
        db_field_name: '',
        description: '',
        data_type: 'Char',
        field_length: '',
        is_mandatory: false,
        valid_values: '',
        related_table: ''
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add Field Instruction</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SAP Field Name *
                </label>
                <input
                  type="text"
                  name="sap_field_name"
                  value={formData.sap_field_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sap-primary focus:border-sap-primary"
                  placeholder="e.g., CUSTOMER_CODE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Database Field Name *
                </label>
                <input
                  type="text"
                  name="db_field_name"
                  value={formData.db_field_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sap-primary focus:border-sap-primary"
                  placeholder="e.g., customer_code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Type *
                </label>
                <select
                  name="data_type"
                  value={formData.data_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sap-primary focus:border-sap-primary"
                >
                  {dataTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Length *
                </label>
                <input
                  type="number"
                  name="field_length"
                  value={formData.field_length}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sap-primary focus:border-sap-primary"
                  placeholder="e.g., 50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Table
                </label>
                <input
                  type="text"
                  name="related_table"
                  value={formData.related_table}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sap-primary focus:border-sap-primary"
                  placeholder="e.g., customers"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_mandatory"
                  checked={formData.is_mandatory}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-sap-primary focus:ring-sap-primary border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Mandatory Field
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid Values
              </label>
              <input
                type="text"
                name="valid_values"
                value={formData.valid_values}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sap-primary focus:border-sap-primary"
                placeholder="e.g., ACTIVE,INACTIVE (comma-separated)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter valid values separated by commas (optional)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sap-primary focus:border-sap-primary"
                placeholder="Enter field description..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-sap-success hover:bg-sap-success/90 text-white"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field Instruction
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddFieldInstructionForm;
