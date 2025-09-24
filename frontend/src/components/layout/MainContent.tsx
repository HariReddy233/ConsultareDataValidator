import React, { useState, useEffect } from 'react';
import { DataCategory, ValidationResponse, ValidationResult } from '../../types';
import { api } from '../../services/api';
import FileUpload from '../forms/FileUpload';
import ValidationResults from '../display/ValidationResults';
import FieldInstructions from '../display/FieldInstructions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Button } from '../ui/Button';
import { Upload, Download, FileText, AlertTriangle, CheckCircle, AlertCircle, XCircle, Filter } from 'lucide-react';

interface MainContentProps {
  category: DataCategory;
}

const MainContent: React.FC<MainContentProps> = ({ category }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'instructions'>('upload');
  const [validationResults, setValidationResults] = useState<ValidationResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileData, setFileData] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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

  const handleFileUpload = async (data: any[], file: File) => {
    setFileData(data);
    setUploadedFile(file);
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
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {getCategoryTitle(category)}
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              {getCategoryDescription(category)}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              className="flex items-center gap-2 bg-sap-primary hover:bg-sap-primary/90 text-white px-6 py-3"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="w-5 h-5" />
              Upload File
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50 px-6 py-3"
              onClick={handleDownloadTemplate}
            >
              <Download className="w-5 h-5" />
              Download Template
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-sap-success/10 text-sap-success border-sap-success/20 hover:bg-sap-success/20 px-6 py-3"
              onClick={handleDownloadSample}
            >
              <FileText className="w-5 h-5" />
              Download Sample File
            </Button>
          </div>
        </div>

        {/* Status Summary Cards */}
        {validationResults && (
          <div className="mt-6 grid grid-cols-4 gap-4">
            <Card className="bg-white border-l-4 border-l-sap-success">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Records</p>
                    <p className="text-2xl font-bold text-gray-900">{validationResults.summary.total}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-sap-success" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-l-4 border-l-sap-success">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valid</p>
                    <p className="text-2xl font-bold text-sap-success">{validationResults.summary.valid}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-sap-success" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-l-4 border-l-sap-warning">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Warnings</p>
                    <p className="text-2xl font-bold text-sap-warning">{validationResults.summary.warnings}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-sap-warning" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-l-4 border-l-sap-error">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Errors</p>
                    <p className="text-2xl font-bold text-sap-error">{validationResults.summary.errors}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-sap-error" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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

        {/* Tabs */}
        <div className="mt-6 flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Customer Data
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
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
          <Card className="mb-6 border-sap-warning/20 bg-sap-warning/5">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-sap-warning">Processing...</h3>
                  <span className="text-sm text-sap-warning font-medium">{progress}%</span>
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
            {/* File Upload Section */}
            <div className="flex justify-center">
              <FileUpload 
                onFileUpload={handleFileUpload}
                disabled={isProcessing}
              />
            </div>
            
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
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sap-primary focus:border-sap-primary">
                      <option value="all">All Records</option>
                      <option value="valid">Valid Only</option>
                      <option value="warning">Warnings Only</option>
                      <option value="error">Errors Only</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      Showing 1-{Math.min(10, validationResults.results.length)} of {validationResults.results.length} records
                    </span>
                    <Button 
                      className="bg-sap-success hover:bg-sap-success/90 text-white"
                      disabled={isProcessing}
                    >
                      Start Validation
                    </Button>
                  </div>
                </div>
                
                <ValidationResults results={validationResults} />
              </div>
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
