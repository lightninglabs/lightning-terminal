import React, { ReactNode } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { HeaderFour } from 'components/base';
import Tip from './Tip';

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
  tip?: ReactNode;
  tipPlacement?: string;
  tipCapitalize?: boolean;
}

const Stat: React.FC<Props> = ({
  label,
  value,
  positive,
  negative,
  warn,
  className,
  tip,
  tipPlacement,
  tipCapitalize,
}) => {
  const theme = useTheme();

  let color = '';
  if (negative) color = theme.colors.pink;
  if (warn) color = theme.colors.gold;
  if (positive) color = theme.colors.green;

  const { Wrapper, Value } = Styled;
  let cmp = (
    <Wrapper className={className}>
      <Value color={color}>{value}</Value>
      <HeaderFour>{label}</HeaderFour>
    </Wrapper>
  );

  if (tip) {
    cmp = (
      <Tip overlay={tip} placement={tipPlacement} capitalize={tipCapitalize}>
        {cmp}
      </Tip>
    );
  }

  return cmp;
};

export default Stat;
