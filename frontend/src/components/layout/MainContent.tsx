import React, { useState, useRef } from 'react';
import { DataCategory, ValidationResponse } from '../../types';
import { api } from '../../services/api';
import ValidationResults from '../display/ValidationResults';
import FieldInstructions from '../display/FieldInstructions';
import AddFieldInstructionForm from '../forms/AddFieldInstructionForm';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Upload, Download, FileText, CheckCircle, AlertCircle, XCircle, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

interface MainContentProps {
  category: DataCategory;
}

const MainContent: React.FC<MainContentProps> = ({ category }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'instructions'>('upload');
  const [validationResults, setValidationResults] = useState<ValidationResponse | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedDataCategory, setSelectedDataCategory] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [refreshInstructions, setRefreshInstructions] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCategoryTitle = (category: DataCategory) => {
    switch (category) {
      case 'BusinessPartnerMasterData':
        return 'Business Partner Master Data';
      case 'ItemMasterData':
        return 'Item Master Data';
      case 'FinancialData':
        return 'Financial Data';
      case 'SetupData':
        return 'Set Up Data';
      default:
        return 'Data Validation';
    }
  };

  const getCategoryDescription = (category: DataCategory) => {
    switch (category) {
      case 'BusinessPartnerMasterData':
        return 'Upload for comprehensive field validation.';
      case 'ItemMasterData':
        return 'Upload for comprehensive field validation.';
      case 'FinancialData':
        return 'Upload for comprehensive field validation.';
      case 'SetupData':
        return 'Upload for comprehensive field validation.';
      default:
        return 'Upload for comprehensive field validation.';
    }
  };

  const getDataCategoryOptions = (category: DataCategory) => {
    switch (category) {
      case 'BusinessPartnerMasterData':
        return [
          'General Info',
          'Address',
          'Tax Info',
          'Contact Person',
          'State Code',
          'Group Code'
        ];
      case 'ItemMasterData':
        return [
          'Item Details',
          'Pricing',
          'Inventory',
          'Categories',
          'Specifications'
        ];
      case 'FinancialData':
        return [
          'Chart of Accounts',
          'GL Accounts',
          'Cost Centers',
          'Profit Centers'
        ];
      case 'SetupData':
        return [
          'Company Settings',
          'User Management',
          'System Configuration',
          'Integration Settings'
        ];
      default:
        return [];
    }
  };

  const handleFileUpload = async (data: any[], file: File) => {
    console.log('handleFileUpload called with:', { dataLength: data.length, fileName: file.name });
    setFileData(data);
    setUploadedFile(file);

    try {
      console.log('Calling API validation for category:', category);
      const result = await api.validateData(category, data);
      console.log('Validation result:', result);
      setValidationResults(result);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed');
    const file = event.target.files?.[0];
    console.log('Selected file:', file);
    if (file) {
      console.log('Processing file:', file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          console.log('File read successfully');
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          console.log('Parsed data:', jsonData);
          
          handleFileUpload(jsonData, file);
        } catch (error) {
          console.error('Error reading file:', error);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleUploadClick = () => {
    console.log('Upload button clicked');
    console.log('File input ref:', fileInputRef.current);
    fileInputRef.current?.click();
  };


  const handleDownloadTemplate = async () => {
    try {
      const response = await api.getSampleData(category);
      // Create and download Excel file
      console.log('Downloading template:', response);
    } catch (error) {
      console.error('Failed to download template:', error);
    }
  };

  const handleDownloadSample = async () => {
    try {
      const response = await api.getSampleData(category);
      // Create and download sample file
      console.log('Downloading sample:', response);
    } catch (error) {
      console.error('Failed to download sample:', error);
    }
  };


  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {getCategoryTitle(category)}
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              {getCategoryDescription(category)}
            </p>
          </div>
          
          {/* Data Category Dropdown */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Choose Data Catgory:</label>
              <select
                value={selectedDataCategory}
                onChange={(e) => setSelectedDataCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Category</option>
                {getDataCategoryOptions(category).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              className="flex items-center gap-2 bg-sap-primary hover:bg-sap-primary/90 text-white px-4 py-2"
              onClick={handleUploadClick}
            >
              <Upload className="w-4 h-4" />
              Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50 px-4 py-2"
              onClick={handleDownloadTemplate}
            >
              <Download className="w-4 h-4" />
              Template
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-sap-success/10 text-sap-success border-sap-success/20 hover:bg-sap-success/20 px-4 py-2"
              onClick={handleDownloadSample}
            >
              <FileText className="w-4 h-4" />
              Sample
            </Button>
          </div>
        </div>
        
        {/* Horizontal Line */}
        <div className="mt-4 border-t border-gray-300"></div>


        {/* File Upload Status */}
        {uploadedFile && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">{uploadedFile.name}</p>
              <p className="text-xs text-blue-600">{fileData.length} rows • Uploaded {Math.floor(Math.random() * 5) + 1} min ago</p>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              Ready for Validation
            </Badge>
          </div>
        )}

        {/* Tabs and Validation Summary */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-blue-800 hover:text-white'
                }`}
              >
                Customer Data
              </button>
              <button
                onClick={() => setActiveTab('instructions')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'instructions'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-blue-800 hover:text-white'
                }`}
              >
                Field Instructions
              </button>
            </div>
            
            {/* Add Field Instructions Button - only show when on instructions tab */}
            {activeTab === 'instructions' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors bg-white text-gray-600 hover:bg-blue-800 hover:text-white border border-gray-300 hover:border-blue-800 flex items-center gap-2"
              >
                <Upload className="w-3 h-3" />
                Add Field Instructions
              </button>
            )}
          </div>
          
          {/* Validation Summary */}
          {validationResults && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Total Records:</span>
                <span className="font-semibold text-gray-900">{validationResults.summary.total}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">Valid:</span>
                <span className="font-semibold text-green-600">{validationResults.summary.valid}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-600">Warnings:</span>
                <span className="font-semibold text-yellow-600">{validationResults.summary.warnings}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-600">Errors:</span>
                <span className="font-semibold text-red-600">{validationResults.summary.errors}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        {activeTab === 'upload' && (
          <div className="space-y-6">
            
            {/* Validation Results */}
            {validationResults && (
              <div className="space-y-4">
                {/* Filter and Actions */}
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                    </div>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sap-primary focus:border-sap-primary"
                    >
                      <option value="all">All Records</option>
                      <option value="valid">Valid Only</option>
                      <option value="warning">Warnings Only</option>
                      <option value="error">Errors Only</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      Showing {validationResults.results.length} records
                    </span>
                  </div>
                </div>
                
                <ValidationResults results={validationResults} statusFilter={statusFilter} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'instructions' && (
          <FieldInstructions category={category} refreshTrigger={refreshInstructions} />
        )}
      </div>

      {/* Add Field Instruction Form Modal */}
      <AddFieldInstructionForm
        category={category}
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={() => {
          setRefreshInstructions(prev => prev + 1);
          setShowAddForm(false);
        }}
      />
    </div>
  );
};

export default MainContent;
