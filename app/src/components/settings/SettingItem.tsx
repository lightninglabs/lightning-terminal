import React from 'react';
import styled from '@emotion/styled';
import { ArrowRight, Copy, RadioButton } from 'components/base';

const Styled = {
  Wrapper: styled.div`
    display: flex;
    align-items: center;
    height: 80px;
    cursor: pointer;
    border-bottom: 0.5px solid ${props => props.theme.colors.lightBlue};

    &:last-child {
      border-bottom-width: 0;
    }

    &:hover {
      opacity: 0.8;
    }
  `,
  Name: styled.span`
    flex: 1;
    font-size: ${props => props.theme.sizes.l};
  `,
  Value: styled.span`
    color: ${props => props.theme.colors.gray};
    margin-right: 20px;
  `,
};

interface Props {
  name: string;
  value?: string;
  icon: 'arrow' | 'radio' | 'copy';
  checked?: boolean;
  onClick: () => void;
}

const SettingItem: React.FC<Props> = ({ name, value, icon, checked, onClick }) => {
  const { Wrapper, Name, Value } = Styled;
  return (
    <Wrapper onClick={onClick}>
      <Name>{name}</Name>
      {value && <Value>{value}</Value>}
      {icon === 'radio' && (
        <RadioButton role="switch" checked={checked} aria-checked={checked} />
      )}
      {icon === 'arrow' && <ArrowRight size="large" />}
      {icon === 'copy' && <Copy size="large" />}
    </Wrapper>
  );
};

export default SettingItem;
