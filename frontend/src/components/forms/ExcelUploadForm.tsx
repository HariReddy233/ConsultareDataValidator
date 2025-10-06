import React, { useState, useRef } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelUploadFormProps {
  category: string;
  subcategory?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ExcelUploadForm: React.FC<ExcelUploadFormProps> = ({
  category,
  subcategory,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          selectedFile.type === 'application/vnd.ms-excel' ||
          selectedFile.name.endsWith('.xlsx') ||
          selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setError(null);
        setSuccess(null);
        parseExcelFile(selectedFile);
      } else {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        setFile(null);
      }
    }
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 0) {
          const headers = (jsonData[0] as any[]) as string[];
          const dataRows = (jsonData.slice(1) as any[]).filter((row: any[]) => 
            row.some((cell: any) => cell !== null && cell !== '')
          );
          setHeaders(headers);
          setPreviewData(dataRows.slice(0, 5)); // Show first 5 rows as preview
        } else {
          setError('Excel file appears to be empty');
        }
      } catch (err) {
        setError('Error parsing Excel file. Please ensure it\'s a valid Excel file.');
        console.error('Excel parsing error:', err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    console.log('ExcelUploadForm: Starting upload for category:', category, 'subcategory:', subcategory);
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      if (subcategory) {
        formData.append('subcategory', subcategory);
      }

      console.log('=== FRONTEND UPLOAD DEBUG ===');
      console.log('ExcelUploadForm: File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      console.log('ExcelUploadForm: FormData contents:');
      // Log FormData contents in a TypeScript-compatible way
      console.log('  file:', file);
      console.log('  category:', category);
      console.log('  subcategory:', subcategory);
      console.log('ExcelUploadForm: Sending request to API...');
      console.log('=====================================');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3002'}/api/excel/upload-schema`, {
        method: 'POST',
        body: formData,
      });

      console.log('ExcelUploadForm: Response status:', response.status);
      const result = await response.json();
      console.log('ExcelUploadForm: Response data:', result);

      if (response.ok) {
        setSuccess(`Excel schema uploaded successfully! ${result.message || ''}`);
        console.log('ExcelUploadForm: Upload successful, calling onSuccess...');
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else {
        setError(result.message || 'Upload failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setSuccess(null);
    setPreviewData([]);
    setHeaders([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Upload Excel Schema
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* File Upload Button */}
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name}
                </p>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Preview Data */}
            {previewData.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Preview</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <p className="text-sm text-gray-600">
                      Headers: {headers.join(', ')}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          {headers.map((header, index) => (
                            <th key={index} className="px-3 py-2 text-left font-medium text-gray-700">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {previewData.map((row: any[], rowIndex: number) => (
                          <tr key={rowIndex}>
                            {headers.map((_, colIndex: number) => (
                              <td key={colIndex} className="px-3 py-2 text-gray-900">
                                {row[colIndex] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Upload an Excel file with headers in the first row</li>
                <li>• The system will create or update a database table based on the category</li>
                <li>• Headers will become field names in the database</li>
                <li>• Data rows will be inserted into the table</li>
                <li>• If a table already exists for this category, it will be updated with new data</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Schema
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelUploadForm;
