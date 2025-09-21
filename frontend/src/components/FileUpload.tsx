import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Download, FileText, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { DataCategory } from '../types';
import { api } from '../services/api';
import * as XLSX from 'xlsx';

interface FileUploadProps {
  category: DataCategory;
  onFileUpload: (data: any[]) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ category, onFileUpload, disabled }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setIsLoading(true);
      
      // Read Excel file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          setFileData(jsonData);
          setIsLoading(false);
        } catch (error) {
          console.error('Error reading file:', error);
          setIsLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    disabled,
  });

  const handleStartValidation = () => {
    if (fileData.length > 0) {
      onFileUpload(fileData);
    }
  };

  const handleDownloadSample = async () => {
    try {
      const response = await api.getSampleData(category);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(response.sampleData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample Data');
      
      // Download file
      XLSX.writeFile(workbook, `${category}_sample.xlsx`);
    } catch (error) {
      console.error('Error downloading sample:', error);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileData([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload File
          </CardTitle>
          <CardDescription>
            Upload an Excel file (.xlsx) to validate your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium text-blue-600">
                Drop the file here...
              </p>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drag & drop your Excel file here
                </p>
                <p className="text-gray-500">
                  or click to browse files
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Supports .xlsx and .xls files
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleDownloadSample}
          variant="outline"
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Sample File
        </Button>
        
        <Button
          onClick={handleDownloadSample}
          variant="outline"
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Download Template
        </Button>
      </div>

      {/* File Info */}
      {uploadedFile && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold">{uploadedFile.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(uploadedFile.size)} • {fileData.length} rows
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Ready</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={handleStartValidation}
                disabled={disabled || isLoading || fileData.length === 0}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Start Validation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
