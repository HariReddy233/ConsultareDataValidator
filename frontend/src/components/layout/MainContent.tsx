import React, { useState, useRef, useEffect } from 'react';
import { DataCategory, ValidationResponse, SAPSubCategory, SAPMainCategory } from '../../types';
import { api } from '../../services/api';
import { useSAPCategories } from '../../hooks/useSAPCategories';
import ValidationResults from '../display/ValidationResults';
import FieldInstructions from '../display/FieldInstructions';
import AddFieldInstructionForm from '../forms/AddFieldInstructionForm';
import ExcelUploadForm from '../forms/ExcelUploadForm';
import AIHelper from '../ui/AIHelper';
import LoadingAnimation from '../ui/LoadingAnimation';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Upload, Download, FileText, Filter, Plus, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface MainContentProps {
  category: DataCategory;
}

const MainContent: React.FC<MainContentProps> = ({ category }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'instructions' | 'data'>('upload');
  const [validationResults, setValidationResults] = useState<ValidationResponse | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedDataCategory, setSelectedDataCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<SAPSubCategory | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showExcelUpload, setShowExcelUpload] = useState<boolean>(false);
  const [refreshInstructions, setRefreshInstructions] = useState<number>(0);
  const [subcategories, setSubcategories] = useState<SAPSubCategory[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [showDropdownHighlight, setShowDropdownHighlight] = useState(false);
  const [hasInteractedWithDropdown, setHasInteractedWithDropdown] = useState(false);
  const [isClearingOutput, setIsClearingOutput] = useState(false);
  const [mainCategories, setMainCategories] = useState<SAPMainCategory[]>([]);
  const [loadingMainCategories, setLoadingMainCategories] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [isLargeDataset, setIsLargeDataset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { categories, downloadFile } = useSAPCategories();

  // Load main categories on component mount
  useEffect(() => {
    const loadMainCategories = async () => {
      setLoadingMainCategories(true);
      try {
        const response = await api.getMainCategories();
        if (response.success) {
          setMainCategories(response.data || []);
        }
      } catch (error) {
        console.error('Error loading main categories:', error);
      } finally {
        setLoadingMainCategories(false);
      }
    };

    loadMainCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!category) return;
      
      setLoadingSubcategories(true);
      try {
        // First try to find in the already loaded categories
        let mainCategory = categories?.find(cat => 
          cat.MainCategoryName.replace(/\s+/g, '') === category
        );
        
        // If not found, try to find in mainCategories
        if (!mainCategory) {
          mainCategory = mainCategories?.find(cat => 
            cat.MainCategoryName.replace(/\s+/g, '') === category
          );
        }
        
        if (mainCategory) {
          setSubcategories(mainCategory.SubCategories);
        } else {
          // If still not found, try to fetch subcategories directly
          try {
            const response = await api.getSubcategoriesByMainCategoryName(category);
            if (response.success) {
              setSubcategories(response.data || []);
            } else {
              setSubcategories([]);
            }
          } catch (fetchError) {
            console.error('Error fetching subcategories directly:', fetchError);
            setSubcategories([]);
          }
        }
      } catch (error) {
        console.error('Error loading subcategories:', error);
        setSubcategories([]);
      } finally {
        setLoadingSubcategories(false);
      }
    };

    loadSubcategories();
  }, [category, categories, mainCategories]);

  // Trigger dropdown highlight on page load
  useEffect(() => {
    if (subcategories && subcategories.length > 0 && !hasInteractedWithDropdown) {
      setShowDropdownHighlight(true);
      
      // Don't auto-select any subcategory - let user choose
      // Keep selectedDataCategory empty to show "Select Category" as default
    }
  }, [subcategories, hasInteractedWithDropdown, selectedDataCategory]);

  const getCategoryTitle = (category: DataCategory) => {
    // If main categories are still loading, show a loading state
    if (loadingMainCategories) {
      return 'Loading...';
    }

    // Find the main category that matches the current category
    // The category prop should match the MainCategoryName (with spaces removed)
    const mainCategory = mainCategories?.find(cat => 
      cat.MainCategoryName.replace(/\s+/g, '') === category
    );

    if (mainCategory) {
      return mainCategory.MainCategoryName;
    }

    // If not found in API data, return the category as is (it might be a new category)
    return category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  };


  // Get dynamic tab name based on selected subcategory
  const getTabName = () => {
    if (selectedDataCategory) {
      return selectedDataCategory;
    }
    return 'Customer Data'; // Default fallback
  };

  const getCategoryDescription = (category: DataCategory) => {
    // Return a generic description for all categories
    return '';
  };

  // Handle subcategory selection
  const handleSubCategoryChange = (subCategoryName: string) => {
    const subCategory = subcategories?.find(sub => sub.SubCategoryName === subCategoryName);
    setSelectedSubCategory(subCategory || null);
    setSelectedDataCategory(subCategoryName);
    
    // Clear output when user selects a different category
    if (selectedDataCategory && selectedDataCategory !== subCategoryName) {
      setIsClearingOutput(true);
      // Add a small delay for smooth transition
      setTimeout(() => {
        setValidationResults(null);
        setFileData([]);
        setUploadedFile(null);
        setIsClearingOutput(false);
      }, 300);
    }
    
    // Remove highlight when user interacts with dropdown
    if (!hasInteractedWithDropdown) {
      setHasInteractedWithDropdown(true);
      setShowDropdownHighlight(false);
    }
  };

  const handleFileUpload = async (data: any[], file: File) => {
    console.log('handleFileUpload called with:', { dataLength: data.length, fileName: file.name });
    setFileData(data);
    setUploadedFile(file);
    setIsValidating(true);
    setValidationProgress({ current: 0, total: 0, percentage: 0 });

    // Check if it's a large dataset (more than 500 rows)
    const LARGE_DATASET_THRESHOLD = 500;
    const isLarge = data.length > LARGE_DATASET_THRESHOLD;
    setIsLargeDataset(isLarge);

    try {
      if (isLarge) {
        console.log(`Large dataset detected (${data.length} rows). Processing in batches...`);
        await handleBatchValidation(data);
      } else {
        console.log('Small dataset, processing normally...');
      const result = await api.validateData(category, data);
      console.log('Validation result:', result);
      setValidationResults(result);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleBatchValidation = async (data: any[]) => {
    const BATCH_SIZE = 500;
    const totalBatches = Math.ceil(data.length / BATCH_SIZE);
    const allResults: any[] = [];
    let totalValid = 0;
    let totalWarnings = 0;
    let totalErrors = 0;

    console.log(`Processing ${data.length} rows in ${totalBatches} batches of ${BATCH_SIZE} rows each`);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, data.length);
      const batch = data.slice(start, end);
      
      console.log(`Processing batch ${i + 1}/${totalBatches} (rows ${start + 1}-${end})`);
      
      // Update progress
      const percentage = Math.round(((i + 1) / totalBatches) * 100);
      setValidationProgress({
        current: i + 1,
        total: totalBatches,
        percentage: percentage
      });

      try {
        // Validate this batch
        const batchResult = await api.validateData(category, batch);
        
        // Adjust row numbers to match original data
        const adjustedResults = batchResult.results.map((result: any) => ({
          ...result,
          rowNumber: result.rowNumber + start
        }));

        allResults.push(...adjustedResults);
        
        // Update summary counts
        totalValid += batchResult.summary.valid;
        totalWarnings += batchResult.summary.warnings;
        totalErrors += batchResult.summary.errors;


        // Add a small delay to prevent overwhelming the server
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`Error processing batch ${i + 1}:`, error);
        // Continue with next batch even if one fails
      }
    }

    // Create final aggregated result
    const finalResult: ValidationResponse = {
      success: true,
      category: category,
      results: allResults,
      summary: {
        total: data.length,
        valid: totalValid,
        warnings: totalWarnings,
        errors: totalErrors
      }
    };

    console.log('Batch validation completed:', finalResult);
    setValidationResults(finalResult);
    setValidationProgress({ current: totalBatches, total: totalBatches, percentage: 100 });
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
    
    // Clear validation results if any are already loaded
    if (validationResults) {
      setValidationResults(null);
      setFileData([]);
      setUploadedFile(null);
    }
    
    console.log('File input ref:', fileInputRef.current);
    fileInputRef.current?.click();
  };


  const handleDownloadTemplate = async () => {
    if (!selectedSubCategory) {
      alert('Please select a subcategory first');
      return;
    }
    
    try {
      await downloadFile(selectedSubCategory.SubCategoryID, 'template');
    } catch (error) {
      console.error('Failed to download template:', error);
      alert('Failed to download template file');
    }
  };

  const handleDownloadSample = async () => {
    if (!selectedSubCategory) {
      alert('Please select a subcategory first');
      return;
    }
    
    try {
      await downloadFile(selectedSubCategory.SubCategoryID, 'sample');
    } catch (error) {
      console.error('Failed to download sample:', error);
      alert('Failed to download sample file');
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
              <label className={`text-sm font-medium ${showDropdownHighlight ? 'text-blue-600' : 'text-gray-700'}`}>
                Choose Data Category:
              </label>
              {loadingSubcategories ? (
                <div className="flex items-center gap-2 px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : (
                <select
                  value={selectedDataCategory}
                  onChange={(e) => handleSubCategoryChange(e.target.value)}
                  className={`px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48 ${
                    showDropdownHighlight ? 'dropdown-highlight' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  {subcategories?.map((subcategory) => (
                    <option key={subcategory.SubCategoryID} value={subcategory.SubCategoryName}>
                      {subcategory.SubCategoryName}
                    </option>
                  ))}
                </select>
              )}
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
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDownloadTemplate}
              disabled={!selectedSubCategory}
            >
              <Download className="w-4 h-4" />
              Template
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-sap-success/10 text-sap-success border-sap-success/20 hover:bg-sap-success/20 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDownloadSample}
              disabled={!selectedSubCategory}
            >
              <FileText className="w-4 h-4" />
              Sample
            </Button>
          </div>
        </div>
        
        {/* Horizontal Line */}
        <div className="mt-4 border-t border-gray-300"></div>


        {/* Single Line Layout: Tabs, File Info, and Validation Summary */}
        <div className="mt-3 flex items-center justify-between gap-4">
          {/* Left side: Tabs */}
          <div className="flex items-center gap-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                  activeTab === 'upload'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <span className="transition-all duration-300">{getTabName()}</span>
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
            
            {/* AI Helper message beside Field Instructions tab */}
            {activeTab === 'instructions' && (
              <div className="flex items-center gap-2 px-2 py-1.5 bg-blue-50 border border-blue-200 rounded-md">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-800">
                  Selected "{selectedDataCategory || 'Field Instructions'}" - Upload Excel for validation. AI ready.
                </span>
              </div>
            )}
          </div>

          {/* Center: File Upload Status */}
          {uploadedFile && (
            <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg flex-1 max-w-md">
              <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900 truncate">{uploadedFile.name}</p>
                <p className="text-xs text-blue-600">{fileData.length} rows • Uploaded {Math.floor(Math.random() * 5) + 1} min ago</p>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 flex-shrink-0">
                Ready for Validation
              </Badge>
            </div>
          )}
          
          {/* Right side: Action Buttons or Validation Summary */}
          {activeTab === 'instructions' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors bg-white text-gray-600 hover:bg-blue-800 hover:text-white border border-gray-300 hover:border-blue-800 flex items-center gap-2"
              >
                <Plus className="w-3 h-3" />
                Add Row
              </button>
              <button
                onClick={() => setShowExcelUpload(true)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors bg-white text-gray-600 hover:bg-blue-800 hover:text-white border border-gray-300 hover:border-blue-800 flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Upload Excel
              </button>
            </div>
          ) : (
            /* Validation Summary - only show when on upload tab */
            validationResults && !isValidating && (
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
            )
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Show loading animation while subcategories are loading */}
            {loadingSubcategories ? (
              <LoadingAnimation message="Loading categories..." />
            ) : isValidating ? (
              /* Show validation loading state */
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-lg font-semibold text-gray-700 mb-4">Please wait the data is validating</p>
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                {isLargeDataset && (
                  <div className="mt-4 text-sm text-gray-600">
                    {validationProgress.current} of {validationProgress.total} batches completed
                  </div>
                )}
              </div>
            ) : (
              /* AI Helper - Show in empty content area or when no validation results */
              (!uploadedFile || !validationResults) && (
                <div className="flex justify-center items-center min-h-[400px]">
                  <AIHelper 
                    selectedCategory={selectedDataCategory}
                    hasUploadedFile={!!uploadedFile}
                    className="fade-in-up w-full max-w-2xl"
                  />
                </div>
              )
            )}
            


            {/* Final Validation Results */}
            {validationResults && !isClearingOutput && !isValidating && (
              <div className={`space-y-2 transition-opacity duration-300 ${isClearingOutput ? 'opacity-0' : 'opacity-100'}`}>
                {/* Filter and Actions */}
                <div className="flex items-center justify-between bg-white p-2 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                    </div>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-sap-primary focus:border-sap-primary"
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
                      {isLargeDataset && (
                        <span className="ml-2 text-blue-600">
                          (Processed in batches)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                
                <ValidationResults results={validationResults} statusFilter={statusFilter} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'instructions' && (
          <div className="h-full">
            <FieldInstructions 
              category={category} 
              subcategory={selectedDataCategory} 
              refreshTrigger={refreshInstructions} 
            />
          </div>
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

      {/* Excel Upload Form Modal */}
      <ExcelUploadForm
        category={category}
        subcategory={selectedDataCategory}
        isOpen={showExcelUpload}
        onClose={() => setShowExcelUpload(false)}
        onSuccess={() => {
          console.log('MainContent: Excel upload successful, refreshing instructions...');
          setRefreshInstructions(prev => {
            const newValue = prev + 1;
            console.log('MainContent: Refresh trigger updated to:', newValue);
            return newValue;
          });
          setShowExcelUpload(false);
        }}
      />
    </div>
  );
};

export default MainContent;
