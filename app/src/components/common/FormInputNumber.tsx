import React, { ReactNode, useCallback } from 'react';
import FormInput from './FormInput';

interface Props {
  label?: string;
  value?: number;
  extra?: ReactNode;
  placeholder?: string;
  onChange: (value: number) => void;
}

const FormInputNumber: React.FC<Props> = ({
  label,
  value,
  extra,
  placeholder,
  onChange,
}) => {
  const handleChange = useCallback(
    (v: string) => {
      // only allow numbers and periods
      const stripped = v.replace(/[^\d.]/g, '');
      // bubble up the numeric value
      const num = parseFloat(stripped);
      onChange(isNaN(num) ? 0 : num);
    },
    [onChange],
  );

  return (
    <FormInput
      label={label}
      value={!value ? '' : value.toString()}
      extra={extra}
      placeholder={placeholder}
      onChange={handleChange}
    />
  );
};

export default FormInputNumber;
