import React from 'react';
import InfoTooltip from '../common/InfoTooltip';

const FormInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = "number", 
  step, 
  tooltipContent,
  className = "",
  ...props 
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="mb-2 font-semibold text-gray-700 flex items-center">
        {label}
        {tooltipContent && (
          <InfoTooltip>
            {tooltipContent}
          </InfoTooltip>
        )}
      </label>
      <input 
        type={type}
        step={step}
        name={name}
        value={value}
        onChange={onChange}
        className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
        {...props}
      />
    </div>
  );
};

export default FormInput;
