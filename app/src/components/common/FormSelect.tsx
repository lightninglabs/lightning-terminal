import React, { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import Select from 'rc-select';

export interface SelectOption {
  label: string;
  value: string;
}

const Styled = {
  Wrapper: styled.div`
    font-family: ${props => props.theme.fonts.work.light};
    font-weight: 300;
    font-size: ${props => props.theme.sizes.s};
    color: ${props => props.theme.colors.offWhite};
    position: relative;
  `,
  Select: styled(Select)`
    color: ${props => props.theme.colors.offWhite};
    background-color: ${props => props.theme.colors.overlay};
    border-width: 0;
    border-bottom: 1px solid ${props => props.theme.colors.gray};
    padding: 5px 40px 8px 0;
    width: 100%;
    cursor: pointer;

    &:active,
    &:focus {
      outline: none;
      border-bottom-color: ${props => props.theme.colors.white};
    }

    .rc-select-arrow {
      top: 6px;
      right: 10px;
    }

    .rc-select-selection-item {
      padding-left: 5px;
      font-size: ${props => props.theme.sizes.s};
    }

    input {
      cursor: pointer;
    }

    input::placeholder {
      color: ${props => props.theme.colors.gray};
    }
  `,
};

interface Props {
  options: SelectOption[];
  label?: string;
  value?: string;
  extra?: ReactNode;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const FormSelect: React.FC<Props> = ({
  options,
  label,
  value,
  placeholder,
  onChange,
  className,
}) => {
  const { Wrapper, Select } = Styled;
  return (
    <Wrapper className={className}>
      <Select
        value={value}
        onChange={v => onChange && onChange(v as string)}
        placeholder={placeholder}
        aria-label={label}
        options={options}
      />
    </Wrapper>
  );
};

export default observer(FormSelect);
