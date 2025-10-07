import React, { useState, useEffect } from 'react';
import { ValidationResponse } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ValidationResultsProps {
  results: ValidationResponse;
  statusFilter?: string;
}

const ValidationResults: React.FC<ValidationResultsProps> = ({ results, statusFilter = 'all' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25); // Show 25 records by default

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Safety check for results
  if (!results || !results.results || !Array.isArray(results.results)) {
    return (
      <div className="space-y-6">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">No Validation Results</h3>
                <p className="text-yellow-800 text-sm">No validation results available to display.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter results based on status
  const filteredResults = results.results.filter(result => 
    statusFilter === 'all' || result.status.toLowerCase() === statusFilter
  );
  
  const totalPages = Math.ceil(filteredResults.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  
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
          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">
                    Row Number
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">
                    Customer Code
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">
                    Fields with Errors
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">
                    Error Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentResults && Array.isArray(currentResults) ? currentResults.map((result, index) => (
                  <tr 
                    key={result.rowNumber || index} 
                    className={`${getRowBackgroundColor(result.status || 'Unknown')} hover:bg-gray-50/50 transition-colors`}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {result.rowNumber || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-gray-900">
                      {result.code || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status || 'Unknown')}
                        {getStatusBadge(result.status || 'Unknown')}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {result.fieldsWithIssues && Array.isArray(result.fieldsWithIssues) && result.fieldsWithIssues.length > 0 ? (
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
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-md">
                      <div className="space-y-2">
                        <div className="break-words" title={result.message || 'No message'}>
                          {result.message || 'No message'}
                        </div>
                        {result.aiInsights && (
                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border-l-2 border-blue-200">
                            <strong>AI Insight:</strong> {result.aiInsights}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-8 px-6 text-center text-gray-500">
                      No validation results to display
                    </td>
                  </tr>
                )}
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
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                  <option value={1000}>All Records</option>
                </select>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredResults.length)} of {filteredResults.length} records
                </span>
                
                {/* Navigation Controls */}
                <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="border-gray-300 hover:bg-gray-50"
                title="First page"
              >
                First
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-gray-300 hover:bg-gray-50"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Go to:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        handlePageChange(page);
                      }
                    }}
                    className="w-12 px-1 py-1 text-xs border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    title="Enter page number"
                  />
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-gray-300 hover:bg-gray-50"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="border-gray-300 hover:bg-gray-50"
                title="Last page"
              >
                Last
              </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidationResults;
