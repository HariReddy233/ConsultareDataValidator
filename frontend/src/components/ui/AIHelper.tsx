import React from 'react';
import { Bot, Sparkles, Upload } from 'lucide-react';

interface AIHelperProps {
  selectedCategory: string | null;
  hasUploadedFile: boolean;
  className?: string;
}

const AIHelper: React.FC<AIHelperProps> = ({ 
  selectedCategory, 
  hasUploadedFile, 
  className = '' 
}) => {
  const getMessage = () => {
    if (hasUploadedFile) {
      return "Great! Your file has been uploaded and is ready for validation.";
    }
    
    if (selectedCategory) {
      return `Hey buddy, now you've selected "${selectedCategory}". Upload the correct Excel file for validation.`;
    }
    
    return "Please select a category from the dropdown above to view field instructions and upload the correct Excel file for validation.";
  };

  const getIcon = () => {
    if (hasUploadedFile) {
      return <Upload className="w-6 h-6 text-green-600" />;
    }
    
    if (selectedCategory) {
      return <Sparkles className="w-6 h-6 text-blue-600" />;
    }
    
    return <Bot className="w-6 h-6 text-blue-600" />;
  };

  const getAnimationClass = () => {
    if (hasUploadedFile) {
      return 'ai-helper uploaded';
    }
    
    if (selectedCategory) {
      return 'ai-helper selected';
    }
    
    return 'ai-helper';
  };

  if (hasUploadedFile) {
    return null; // Hide AI helper after file upload
  }

  return (
    <div className={`ai-helper-container ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-4 relative z-10">
          <div className={`${getAnimationClass()} text-blue-600 animate-bounce`}>
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-gray-800 font-semibold text-lg mb-1">
              {getMessage()}
            </p>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>AI Assistant is ready to help you</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHelper;
