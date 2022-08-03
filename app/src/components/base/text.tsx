import styled from '@emotion/styled';

interface HeaderProps {
  marginless?: boolean;
}

export const HeaderOne = styled.h1`
  font-family: ${props => props.theme.fonts.work.light};
  font-weight: 300;
  font-size: ${props => props.theme.sizes.xxl};
  line-height: 52px;
`;

export const HeaderTwo = styled.h2`
  font-family: ${props => props.theme.fonts.open.regular};
  font-size: ${props => props.theme.sizes.m};
  line-height: 26px;
`;

export const HeaderThree = styled.h3`
  font-family: ${props => props.theme.fonts.open.light};
  font-size: ${props => props.theme.sizes.l};
  line-height: 30px;
  letter-spacing: 2.7px;
  text-transform: uppercase;
`;

export const HeaderFour = styled.h4<HeaderProps>`
  font-family: ${props => props.theme.fonts.open.semiBold};
  font-size: ${props => props.theme.sizes.xs};
  line-height: 20px;
  text-transform: uppercase;
  color: ${props => props.theme.colors.gray};
  margin-bottom: ${props => (props.marginless ? '0' : '0.5rem')};
`;

export const HeaderFive = styled.h5`
  font-family: ${props => props.theme.fonts.open.bold};
  font-size: ${props => props.theme.sizes.m};
`;

export const Small = styled.span`
  font-size: ${props => props.theme.sizes.xs};
  line-height: 20px;
`;

export const Jumbo = styled.span`
  font-size: ${props => props.theme.sizes.xl};
  line-height: 38px;
`;

//
// v2 Text Styles
//

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
  // On larger devices, make bold elements bold instead of semi-bold
  font-family: ${props =>
    props.bold
      ? props.theme.fonts.open.bold
      : props.semiBold
      ? props.theme.fonts.open.semiBold
      : props.theme.fonts.open.regular};

  // The text-align property is ignored on mobile
  ${props => props.muted && `color: ${props.theme.colors.gray};`}
  ${props => props.space && `margin-bottom: ${props.space}px;`}
  text-align: ${props => (props.center ? 'center' : 'left')};
`;

const BaseBlock = BaseText.withComponent('div');

export const DisplayLarge = styled(BaseBlock)`
  font-size: 40px;
  line-height: 48px;
`;

export const Display = styled(BaseBlock)`
  font-size: 32px;
  line-height: 40px;
`;

export const Paragraph = styled(BaseBlock)`
  font-size: 16px;
  line-height: 24px;
`;
