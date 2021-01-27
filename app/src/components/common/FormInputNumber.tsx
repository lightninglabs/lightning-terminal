import React, { ReactNode, useCallback, useMemo } from 'react';
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

  const valueText = useMemo(() => (!value ? '' : value.toLocaleString()), [value]);

  return (
    <FormInput
      label={label}
      value={valueText}
      extra={extra}
      placeholder={placeholder}
      onChange={handleChange}
    />
  );
};

export default FormInputNumber;
