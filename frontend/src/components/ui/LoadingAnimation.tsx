import React from 'react';

interface LoadingAnimationProps {
  message?: string;
  className?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  message = "Loading...", 
  className = '' 
}) => {
  return (
    <div className={`content-loading flex flex-col items-center justify-center min-h-[400px] ${className}`}>
      <div className="relative">
        {/* Main loading spinner */}
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        
        {/* Outer glow effect */}
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
        
        {/* Inner pulse */}
        <div className="absolute inset-2 w-12 h-12 bg-blue-100 rounded-full animate-pulse"></div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-lg font-semibold text-gray-700 mb-2">{message}</p>
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
