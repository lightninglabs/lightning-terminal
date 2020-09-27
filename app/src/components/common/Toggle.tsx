import React, { useCallback } from 'react';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.div`
    display: inline-block;
  `,
  Item: styled.span<{ selected?: boolean }>`
    padding: 5px 15px;
    border: 1px solid ${props => props.theme.colors.offWhite};
    color: ${props =>
      props.selected ? props.theme.colors.blue : props.theme.colors.offWhite};
    background-color: ${props =>
      props.selected ? props.theme.colors.white : props.theme.colors.blue};
    cursor: pointer;

    &:hover {
      color: ${props =>
        props.selected ? props.theme.colors.blue : props.theme.colors.offWhite};
      background-color: ${props =>
        props.selected ? props.theme.colors.offWhite : props.theme.colors.blue};
      border: 1px solid ${props => props.theme.colors.offWhite}33;
    }
  `,
};

export interface ToggleOption {
  label: string;
  value: string;
}

interface Props {
  options: ToggleOption[];
  value?: string;
  onChange: (value: string) => void;
}

const Toggle: React.FC<Props> = ({ options, value, onChange }) => {
  const handleClick = useCallback((v: string) => () => onChange(v), [onChange]);

  const { Wrapper, Item } = Styled;
  return (
    <Wrapper>
      {options.map(o => (
        <Item key={o.value} selected={o.value === value} onClick={handleClick(o.value)}>
          {o.label}
        </Item>
      ))}
    </Wrapper>
  );
};

export default Toggle;
