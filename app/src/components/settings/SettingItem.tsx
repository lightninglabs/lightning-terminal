import React from 'react';
import styled from '@emotion/styled';
import { ArrowRight, Copy, RadioButton } from 'components/base';

const Styled = {
  Wrapper: styled.div`
    display: flex;
    align-items: center;
    height: 48px;
    cursor: pointer;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    padding: 0 12px;
    transition: background 0.15s ease;

    &:last-child {
      border-bottom-width: 0;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.04);
    }
  `,
  Name: styled.span`
    flex: 1;
    font-size: ${props => props.theme.sizes.s};
    font-weight: 500;
  `,
  Value: styled.span`
    color: ${props => props.theme.colors.gray};
    font-size: ${props => props.theme.sizes.xs};
    margin-right: 12px;
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
