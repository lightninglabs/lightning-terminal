import React, { ReactNode } from 'react';
import { styled } from 'components/theme';

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
    background-color: transparent;
    border-width: 0;
    border-bottom: 1px solid ${props => props.theme.colors.offWhite};
    padding: 5px 40px 5px 5px;
    width: 100%;

    &:active,
    &:focus {
      outline: none;
      background-color: ${props => props.theme.colors.overlay};
      border-bottom-color: ${props => props.theme.colors.white};
    }

    &::placeholder {
      color: ${props => props.theme.colors.gray};
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
  onChange?: (value: string) => void;
}

const FormInput: React.FC<Props> = ({ label, value, placeholder, extra, onChange }) => {
  const { Wrapper, Input, Extra } = Styled;
  return (
    <Wrapper>
      <Input
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
      {extra && <Extra>{extra}</Extra>}
    </Wrapper>
  );
};

export default FormInput;
