import styled from '@emotion/styled';

interface HeaderProps {
  marginless?: boolean;
}

export const HeaderOne = styled.h1`
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: ${props => props.theme.sizes.xxl};
  line-height: 1.2;
  letter-spacing: -0.03em;
`;

export const HeaderTwo = styled.h2`
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: ${props => props.theme.sizes.m};
  line-height: 1.4;
`;

export const HeaderThree = styled.h3`
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: ${props => props.theme.sizes.l};
  line-height: 1.3;
  letter-spacing: -0.02em;
`;

export const HeaderFour = styled.h4<HeaderProps>`
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: ${props => props.theme.sizes.xxs};
  line-height: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${props => props.theme.colors.gray};
  margin-bottom: ${props => (props.marginless ? '0' : '0.5rem')};
`;

export const HeaderFive = styled.h5`
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: ${props => props.theme.sizes.m};
`;

export const Small = styled.span`
  font-size: ${props => props.theme.sizes.xs};
  line-height: 18px;
`;

export const Jumbo = styled.span`
  font-size: ${props => props.theme.sizes.xl};
  line-height: 32px;
  font-weight: 600;
  letter-spacing: -0.02em;
`;

interface TextProps {
  bold?: boolean;
  semiBold?: boolean;
  center?: boolean;
  block?: boolean;
  muted?: boolean;
  space?: 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 56 | 64 | 96 | 120 | 160 | 200;
  desktopSpace?: 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 56 | 64 | 96 | 120 | 160 | 200;
}

const BaseText = styled.span<TextProps>`
  font-family: 'Inter', sans-serif;
  font-weight: ${props => (props.bold ? 700 : props.semiBold ? 600 : 400)};

  ${props => props.muted && `color: ${props.theme.colors.gray};`}
  ${props => props.space && `margin-bottom: ${props.space}px;`}
  text-align: ${props => (props.center ? 'center' : 'left')};
`;

const BaseBlock = BaseText.withComponent('div');

export const DisplayLarge = styled(BaseBlock)`
  font-size: 32px;
  line-height: 40px;
  letter-spacing: -0.03em;
`;

export const Display = styled(BaseBlock)`
  font-size: 24px;
  line-height: 32px;
  letter-spacing: -0.02em;
`;

export const Paragraph = styled(BaseBlock)`
  font-size: 14px;
  line-height: 22px;
`;
