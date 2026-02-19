"use client"

import { useState } from 'react';
import { DEFAULT_FORM_DATA, JAY_PROFILE } from '@/lib/formFields';
import { getProvincialTaxRate } from '@/lib/provinceData';

const STRING_FIELDS = ['mortgageType', 'province', 'taxBracket', 'tfsaFundingSource', 'rrspFundingSource', 'optimizationMode', 'lumpSumYear'];

export const useFormData = (profileOverride = null) => {
  const [formData, setFormData] = useState(profileOverride || DEFAULT_FORM_DATA);

  const handleChange = (name, value) => {
    if (STRING_FIELDS.includes(name)) {
      const updates = { [name]: value };

      if (name === 'province' || name === 'taxBracket') {
        const province = name === 'province' ? value : formData.province;
        const bracket = name === 'taxBracket' ? value : formData.taxBracket;

        if (province !== 'custom') {
          const rate = getProvincialTaxRate(province, bracket);
          if (rate !== null) {
            updates.taxRate = rate;
          }
        }
      }

      setFormData(prev => ({ ...prev, ...updates }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    }
  };

  // Compatibility wrapper for native onChange events
  const handleInputChange = (e) => {
    handleChange(e.target.name, e.target.value);
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleInputChange,
    resetForm
  };
};
