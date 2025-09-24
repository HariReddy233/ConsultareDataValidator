import React, { useState } from 'react';
import { ValidationResponse, ValidationResult } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, XCircle, Filter } from 'lucide-react';

interface ValidationResultsProps {
  results: ValidationResponse;
}

const ValidationResults: React.FC<ValidationResultsProps> = ({ results }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const totalPages = Math.ceil(results.results.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  
  // Filter results based on status
  const filteredResults = results.results.filter(result => 
    statusFilter === 'all' || result.status.toLowerCase() === statusFilter
  );
  
  const currentResults = filteredResults.slice(startIndex, endIndex);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Valid':
        return <CheckCircle className="w-4 h-4 text-sap-success" />;
      case 'Warning':
        return <AlertTriangle className="w-4 h-4 text-sap-warning" />;
      case 'Error':
        return <XCircle className="w-4 h-4 text-sap-error" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Valid':
        return <Badge className="bg-sap-success/10 text-sap-success border-sap-success/20">Valid</Badge>;
      case 'Warning':
        return <Badge className="bg-sap-warning/10 text-sap-warning border-sap-warning/20">Warning</Badge>;
      case 'Error':
        return <Badge className="bg-sap-error/10 text-sap-error border-sap-error/20">Error</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRowBackgroundColor = (status: string) => {
    switch (status) {
      case 'Valid':
        return 'bg-sap-success/5 border-l-4 border-l-sap-success';
      case 'Warning':
        return 'bg-sap-warning/5 border-l-4 border-l-sap-warning';
      case 'Error':
        return 'bg-sap-error/5 border-l-4 border-l-sap-error';
      default:
        return 'bg-white';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-6">
      {/* Results Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Row Number
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Customer Code
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Fields with Errors
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                    Error Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentResults.map((result, index) => (
                  <tr 
                    key={result.rowNumber} 
                    className={`${getRowBackgroundColor(result.status)} hover:bg-gray-50/50 transition-colors`}
                  >
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      {result.rowNumber}
                    </td>
                    <td className="py-4 px-6 text-sm font-mono text-gray-900">
                      {result.code}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        {getStatusBadge(result.status)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {result.fieldsWithIssues.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {result.fieldsWithIssues.map((field, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-xs bg-gray-100 text-gray-700 border-gray-300"
                            >
                              {field}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 max-w-md">
                      <div className="truncate" title={result.message}>
                        {result.message}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-sap-primary focus:border-sap-primary"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              <span className="text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredResults.length)} of {filteredResults.length} records
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="text-sm text-gray-600 px-3">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-gray-300 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidationResults;
