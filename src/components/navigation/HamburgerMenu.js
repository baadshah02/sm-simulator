import React, { useState } from 'react';

const HamburgerMenu = ({ onPageChange, currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'calculator', label: '🧮 Calculator', icon: '📊' },
    { id: 'tracker', label: '📝 SM Tracker', icon: '📈' },
  ];

  const handleItemClick = (pageId) => {
    onPageChange(pageId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-lg transition-all duration-300 ${
          isOpen 
            ? 'bg-blue-600 text-white shadow-lg' 
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
        aria-label="Toggle menu"
      >
        <div className="w-6 h-6 relative">
          <span 
            className={`absolute block w-6 h-0.5 bg-current transition-all duration-300 ${
              isOpen ? 'rotate-45 top-3' : 'top-1'
            }`}
          />
          <span 
            className={`absolute block w-6 h-0.5 bg-current transition-all duration-300 ${
              isOpen ? 'opacity-0' : 'top-2.5'
            }`}
          />
          <span 
            className={`absolute block w-6 h-0.5 bg-current transition-all duration-300 ${
              isOpen ? '-rotate-45 top-3' : 'top-4'
            }`}
          />
        </div>
      </button>

      {/* Menu Dropdown */}
      <div className={`absolute top-16 left-0 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 transition-all duration-300 z-50 ${
        isOpen ? 'opacity-100 visible transform scale-100' : 'opacity-0 invisible transform scale-95'
      }`}>
        <div className="p-2">
          <div className="mb-3 px-4 py-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Navigation</h3>
          </div>
          
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                currentPage === item.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {currentPage === item.id && (
                <span className="ml-auto">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="border-t border-gray-100 p-4">
          <p className="text-xs text-gray-500 text-center">
            Smith Manoeuvre Analysis Tool
          </p>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default HamburgerMenu;
