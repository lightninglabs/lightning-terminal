import React from 'react';
import { HeaderFour } from 'components/base';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.div``,
  Info: styled.div<{ error?: boolean }>`
    min-height: 34px;
    width: 100%;
    margin: 0 0 30px;
    padding: 5px 0;
    font-size: ${props => props.theme.sizes.s};
    background-color: ${props => (props.error ? props.theme.colors.pink : 'transparent')};
    color: ${props =>
      props.error ? props.theme.colors.offWhite : props.theme.colors.gray};
    text-align: ${props => (props.error ? 'center' : 'right')};
  `,
};

interface Props {
  label: string;
  info?: string;
  error?: string;
}

const FormField: React.FC<Props> = ({ label, info, error, children }) => {
  const { Wrapper, Info } = Styled;
  return (
    <Wrapper>
      <HeaderFour>{label}</HeaderFour>
      {children}
      <Info error={!!error}>{error || info}</Info>
    </Wrapper>
  );
};

export default FormField;
