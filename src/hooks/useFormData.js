import { useState } from 'react';
import { DEFAULT_FORM_DATA } from '../constants/formFields';

export const useFormData = () => {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: parseFloat(value) || 0 
    }));
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
  };

  return {
    formData,
    setFormData,
    handleChange,
    resetForm
  };
};
