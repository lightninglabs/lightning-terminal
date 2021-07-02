import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { Check } from '../base';

const Styled = {
  Box: styled.span<{ disabled?: boolean }>`
    display: inline-block;
    width: 26px;
    height: 26px;
    line-height: 18px;
    border-width: ${props => (props.disabled ? '0' : '3px')};
    border-style: solid;
    border-color: ${props => props.theme.colors.pink};
    cursor: ${props => (props.disabled ? 'default' : 'pointer')};

    &:hover {
      border-color: ${props => props.theme.colors.pink}bb;
    }
  `,
  CheckIcon: styled(Check)`
    padding: 0;
    width: 20px;
    height: 20px;
  `,
};

interface Props {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

const Checkbox: React.FC<Props> = ({ checked, disabled, onChange, className }) => {
  const handleClick = useCallback(() => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  }, [disabled, checked, onChange]);

  const { Box, CheckIcon } = Styled;
  return (
    <Box
      role="checkbox"
      aria-checked={!!checked}
      aria-disabled={!!disabled}
      className={className}
      disabled={disabled}
      onClick={handleClick}
    >
      {checked && <CheckIcon size="small" />}
    </Box>
  );
};

export default Checkbox;
