import * as React from 'react';

/** Select component placeholder. Will be implemented with Radix UI Select. */
export interface SelectProps {
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

const Select: React.FC<SelectProps> = ({ options, placeholder, label }) => {
  return (
    <div>
      {label && <label>{label}</label>}
      <select>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

Select.displayName = 'Select';

export default Select;
