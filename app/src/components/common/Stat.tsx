import React, { ReactNode } from 'react';
import { useTheme } from 'emotion-theming';
import { HeaderFour } from 'components/base';
import { styled, Theme } from 'components/theme';

const Styled = {
  Wrapper: styled.div`
    display: inline-flex;
    flex-direction: column;
    align-items: center;
  `,
  Value: styled.div<{ color?: string }>`
    font-size: ${props => props.theme.sizes.xl};
    ${props => props.color && `color: ${props.color}`}
  `,
};

interface Props {
  label: string;
  value: ReactNode;
  positive?: boolean;
  negative?: boolean;
  warn?: boolean;
  className?: string;
}

const Stat: React.FC<Props> = ({ label, value, positive, negative, warn, className }) => {
  const theme = useTheme<Theme>();

  let color = '';
  if (negative) color = theme.colors.pink;
  if (warn) color = theme.colors.gold;
  if (positive) color = theme.colors.green;

  const { Wrapper, Value } = Styled;
  return (
    <Wrapper className={className}>
      <Value color={color}>{value}</Value>
      <HeaderFour>{label}</HeaderFour>
    </Wrapper>
  );
};

export default Stat;
