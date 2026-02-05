import React, { useState } from 'react';

const InfoTooltip = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block ml-2">
      <button
        type="button"
        className="w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-label="More information"
      >
        ?
      </button>
      
      {isVisible && (
        <div 
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10 pointer-events-none"
          role="tooltip"
        >
          <div className="relative">
            {children}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
