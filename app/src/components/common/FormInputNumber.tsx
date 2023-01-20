import React, { ReactNode, useCallback, useMemo } from 'react';
import { formatSats } from 'util/formatters';
import FormInput from './FormInput';

interface Props {
  label?: string;
  value?: number;
  extra?: ReactNode;
  placeholder?: string;
  className?: string;
  onChange: (value: number) => void;
}

const FormInputNumber: React.FC<Props> = ({
  label,
  value,
  extra,
  placeholder,
  className,
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

  const valueText = useMemo(
    () => (!value ? '' : formatSats(value, { withSuffix: false })),
    [value],
  );

  return (
    <FormInput
      className={className}
      label={label}
      value={valueText}
      extra={extra}
      placeholder={placeholder}
      onChange={handleChange}
    />
  );
};

export default FormInputNumber;
