import React, { ReactNode } from 'react';
import styled from '@emotion/styled';
import { HeaderFour, HelpCircle } from 'components/base';
import Tip from './Tip';

const Styled = {
  Wrapper: styled.div``,
  Info: styled.div<{ error?: boolean }>`
    width: 100%;
    margin: 0 0 15px;
    padding: 5px 0;
    font-size: ${props => props.theme.sizes.xs};
    background-color: ${props => (props.error ? props.theme.colors.pink : 'transparent')};
    color: ${props =>
      props.error ? props.theme.colors.offWhite : props.theme.colors.gray};
    text-align: ${props => (props.error ? 'center' : 'right')};
  `,
};

interface Props {
  label?: string;
  info?: ReactNode;
  error?: ReactNode;
  tip?: string;
  className?: string;
}

const FormField: React.FC<Props> = ({ label, info, error, tip, children, className }) => {
  const { Wrapper, Info } = Styled;
  return (
    <Wrapper className={className}>
      {label && (
        <HeaderFour>
          {label}
          {tip && (
            <Tip overlay={tip} placement="right" capitalize={false}>
              <HelpCircle size="medium" />
            </Tip>
          )}
        </HeaderFour>
      )}
      {children}
      <Info error={!!error}>{error || info}</Info>
    </Wrapper>
  );
};

export default FormField;
