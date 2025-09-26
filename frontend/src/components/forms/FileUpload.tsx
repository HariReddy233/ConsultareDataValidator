import React from 'react';
import { FileText, X, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface FileUploadProps {
  uploadedFile: File | null;
  fileData: any[];
  onRemoveFile: () => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ uploadedFile, fileData, onRemoveFile, disabled }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!uploadedFile) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl">
      {/* File Info */}
      <Card className="border-sap-success/20 bg-sap-success/5">
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
                onClick={onRemoveFile}
                disabled={disabled}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUpload;
