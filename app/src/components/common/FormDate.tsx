import React, { ReactNode } from 'react';
import styled from '@emotion/styled';

const Styled = {
  Wrapper: styled.div`
    position: relative;
    font-family: ${props => props.theme.fonts.work.light};
    font-weight: 300;
    font-size: ${props => props.theme.sizes.s};
    color: ${props => props.theme.colors.offWhite};
  `,
  Input: styled.input`
    color: ${props => props.theme.colors.offWhite};
    background-color: ${props => props.theme.colors.overlay};
    border-width: 0;
    border-bottom: 1px solid ${props => props.theme.colors.gray};
    padding: 5px 40px 5px 5px;
    width: 100%;

    &:active,
    &:focus {
      outline: none;
      border-bottom-color: ${props => props.theme.colors.white};
    }

    &::placeholder {
      color: ${props => props.theme.colors.gray};
    }

    // Fix color of the date picker icon in chrome
    ::-webkit-calendar-picker-indicator {
      filter: invert(1);
    }
  `,
  Extra: styled.div`
    position: absolute;
    top: 0;
    right: 0;
    background-color: transparent;
    padding: 5px;
  `,
};

interface Props {
  label?: string;
  value?: string;
  extra?: ReactNode;
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
}

const FormDate: React.FC<Props> = ({
  label,
  value,
  placeholder,
  extra,
  className,
  onChange,
}) => {
  const { Wrapper, Input, Extra } = Styled;
  return (
    <Wrapper className={className}>
      <Input
        type="date"
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
      {extra && <Extra>{extra}</Extra>}
    </Wrapper>
  );
};

export default FormDate;
