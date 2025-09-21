import React, { useState, useEffect } from 'react';
import { DataCategory, ValidationResponse, ValidationResult } from '../types';
import { api } from '../services/api';
import FileUpload from './FileUpload';
import ValidationResults from './ValidationResults';
import FieldInstructions from './FieldInstructions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { Button } from './ui/Button';
import { Upload, Download, FileText, AlertTriangle } from 'lucide-react';

interface MainContentProps {
  category: DataCategory;
}

const MainContent: React.FC<MainContentProps> = ({ category }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'instructions'>('upload');
  const [validationResults, setValidationResults] = useState<ValidationResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileData, setFileData] = useState<any[]>([]);

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
        return 'Upload and validate customer data with comprehensive field validation.';
      case 'ItemMasterData':
        return 'Upload and validate item master data with field validation.';
      case 'FinancialData':
        return 'Upload and validate financial data with field validation.';
      case 'SetupData':
        return 'Upload and validate setup data with field validation.';
      default:
        return 'Upload and validate data with comprehensive field validation.';
    }
  };

  const handleFileUpload = async (data: any[]) => {
    setFileData(data);
    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await api.validateData(category, data);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setValidationResults(result);
        setIsProcessing(false);
        setProgress(0);
      }, 500);
    } catch (error) {
      console.error('Validation failed:', error);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Valid':
        return <Badge variant="success">Valid</Badge>;
      case 'Warning':
        return <Badge variant="warning">Warning</Badge>;
      case 'Error':
        return <Badge variant="error">Error</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getCategoryTitle(category)}
            </h1>
            <p className="text-gray-600 mt-1">
              {getCategoryDescription(category)}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload File
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Template
            </Button>
            <Button variant="outline" className="flex items-center gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
              <FileText className="w-4 h-4" />
              Download Sample File
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upload & Validation
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'instructions'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Field Instructions
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {isProcessing && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Processing...</h3>
                  <span className="text-sm text-gray-500">{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600">
                  Validating your data against business rules...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-6">
            <FileUpload 
              category={category} 
              onFileUpload={handleFileUpload}
              disabled={isProcessing}
            />
            
            {/* File Information */}
            {fileData.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  customer_data_v2.xlsx
                </Badge>
                <span className="text-sm text-gray-600">{fileData.length} rows</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">Uploaded 2 min ago</span>
              </div>
            )}

            {/* Validation Summary Boxes */}
            {validationResults && (
              <div className="flex gap-4">
                <div className="flex-1 border-2 border-yellow-300 rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800">Common Errors</h3>
                  </div>
                  <p className="text-sm text-yellow-700">12 recurring issues</p>
                </div>
                <div className="flex-1 border-2 border-yellow-300 rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800">Validation Summary</h3>
                  </div>
                  <p className="text-sm text-yellow-700">3 errors, 7 warnings found</p>
                </div>
              </div>
            )}

            {/* Validation Status & Actions */}
            {validationResults && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Valid: {validationResults.summary.valid}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Warning: {validationResults.summary.warnings}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">Error: {validationResults.summary.errors}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option>Data Category</option>
                    <option>General Info</option>
                    <option>Contact Details</option>
                    <option>Financial Info</option>
                  </select>
                  
                  {isProcessing && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                      <span className="text-sm text-yellow-800">Processing... 85% complete</span>
                    </div>
                  )}
                  
                  <Button className="bg-green-600 hover:bg-green-700">
                    Start Validation
                  </Button>
                </div>
              </div>
            )}
            
            {validationResults && (
              <ValidationResults results={validationResults} />
            )}
          </div>
        )}

        {activeTab === 'instructions' && (
          <FieldInstructions category={category} />
        )}
      </div>
    </div>
  );
};

export default MainContent;
