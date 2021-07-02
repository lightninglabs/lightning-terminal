import React, { ReactNode } from 'react';
import styled from '@emotion/styled';
import { Small } from '../base';

const Styled = {
  Wrapper: styled.div<{ right?: boolean }>`
    width: auto;
    display: flex;
    flex-direction: column;
    align-items: ${props => (props.right ? 'flex-end' : 'flex-start')};
  `,
  RadioBlock: styled.span<{ active?: boolean }>`
    display: inline-block;
    padding: 5px 15px;
    margin-bottom: 10px;
    border: 1px solid ${props => props.theme.colors.offWhite};
    color: ${props =>
      props.active ? props.theme.colors.darkBlue : props.theme.colors.offWhite};
    background-color: ${props =>
      props.active ? props.theme.colors.white : props.theme.colors.darkBlue};
    cursor: pointer;

    &:hover {
      color: ${props => props.theme.colors.offWhite};
      background-color: ${props => props.theme.colors.darkBlue};
      border: 1px solid ${props => props.theme.colors.offWhite}33;
    }
  `,
};

interface Props {
  text: string;
  description?: ReactNode;
  active?: boolean;
  right?: boolean;
  onClick?: () => void;
}

const Radio: React.FC<Props> = ({ text, description, active, right, onClick }) => {
  const { Wrapper, RadioBlock } = Styled;
  return (
    <Wrapper right={right}>
      <RadioBlock active={active} onClick={onClick} role="switch" aria-checked={!!active}>
        {text}
      </RadioBlock>
      <Small>{description}</Small>
    </Wrapper>
  );
};

export default Radio;
