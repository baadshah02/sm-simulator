import React from 'react';
import FormInput from './FormInput';
import { FORM_FIELDS } from '../../constants/formFields';

const FinancialForm = ({ formData, onChange, onSubmit }) => {
  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-6 p-6 bg-white rounded-xl shadow-md">
      {FORM_FIELDS.map((field) => (
        <FormInput
          key={field.name}
          label={field.label}
          name={field.name}
          value={formData[field.name]}
          onChange={onChange}
          step={field.step}
          tooltipContent={field.tooltipContent}
        />
      ))}
    </form>
  );
};

export default FinancialForm;
