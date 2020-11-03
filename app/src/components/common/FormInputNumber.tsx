import React, { ReactNode, useCallback, useState } from 'react';
import FormInput from './FormInput';

interface Props {
  value?: number;
  extra?: ReactNode;
  placeholder?: string;
  onChange: (value: number) => void;
}

const FormInputNumber: React.FC<Props> = ({ value, extra, placeholder, onChange }) => {
  const [displayValue, setDisplayValue] = useState(value ? value.toString() : '');

  const handleChange = useCallback(
    (v: string) => {
      // only allow numbers and periods
      const stripped = v.replace(/[^\d.]/g, '');
      // update the value displayed in the field
      setDisplayValue(stripped);

      // bubble up the numeric value
      const num = parseFloat(stripped);
      onChange(isNaN(num) ? 0 : num);
    },
    [onChange],
  );

  return (
    <FormInput
      value={value ? value.toString() : displayValue}
      extra={extra}
      placeholder={placeholder}
      onChange={handleChange}
    />
  );
};

export default FormInputNumber;
