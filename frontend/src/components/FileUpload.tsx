import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import * as XLSX from 'xlsx';

interface FileUploadProps {
  onFileUpload: (data: any[], file: File) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, disabled }) => {
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
          onFileUpload(jsonData, file);
        } catch (error) {
          console.error('Error reading file:', error);
          setIsLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
    disabled,
  });

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
    <div className="w-full max-w-2xl">
      {/* Upload Section */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-sap-primary/50 transition-colors">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'scale-105'
                : 'hover:scale-102'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-sap-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-sap-primary" />
              </div>
              
              {isDragActive ? (
                <div>
                  <p className="text-xl font-semibold text-sap-primary mb-2">
                    Drop the file here...
                  </p>
                  <p className="text-gray-600">
                    Release to upload your file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xl font-semibold text-gray-900 mb-2">
                    Drag & drop your file here
                  </p>
                  <p className="text-gray-600 mb-4">
                    or click to browse files
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      .xlsx
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      .xls
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      .csv
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Info */}
      {uploadedFile && (
        <Card className="mt-4 border-sap-success/20 bg-sap-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sap-success/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-sap-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{uploadedFile.name}</h3>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(uploadedFile.size)} • {fileData.length} rows
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-sap-success/10 text-sap-success border-sap-success/20">
                  Ready for Validation
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={disabled}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="mt-4 border-sap-warning/20 bg-sap-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-sap-warning border-t-transparent rounded-full animate-spin" />
              <p className="text-sap-warning font-medium">Processing file...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
