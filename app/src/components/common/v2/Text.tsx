import styled from '@emotion/styled';

interface TextProps {
  bold?: boolean;
  semiBold?: boolean;
  center?: boolean;
  block?: boolean;
  muted?: boolean;
  space?: 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 56 | 64 | 96 | 120 | 160 | 200;
  desktopSpace?:
    | 4
    | 8
    | 12
    | 16
    | 20
    | 24
    | 32
    | 40
    | 48
    | 56
    | 64
    | 96
    | 120
    | 160
    | 200;
}

const BaseText = styled.span<TextProps>`
  // On mobile, default to semi-bold when the bold prop is used
  font-family: ${props =>
    props.bold || props.semiBold
      ? props.theme.fonts.open.semiBold
      : props.theme.fonts.open.regular};
  font-weight: ${props => (props.bold || props.semiBold ? 600 : 400)};
  ${props => props.muted && `color: ${props.theme.colors.gray};`}
  ${props => props.space && `margin-bottom: ${props.space}px;`}
  text-align: left;

  @media (${props => props.theme.breakpoints.m}) {
    ${props => props.desktopSpace && `margin-bottom: ${props.desktopSpace}px;`}

    // On larger devices, make bold elements bold instead of semi-bold
    font-family: ${props =>
      props.bold
        ? props.theme.fonts.open.bold
        : props.semiBold
        ? props.theme.fonts.open.semiBold
        : props.theme.fonts.open.regular};

    // The text-align property is ignored on mobile
    text-align: ${props => (props.center ? 'center' : 'left')};
  }
`;

const BaseBlock = BaseText.withComponent('div');

export const Mega = styled(BaseBlock)`
  font-size: 40px;
  line-height: 48px;

  @media (${props => props.theme.breakpoints.m}) {
    font-size: 56px;
    line-height: 56px;
  }
`;

export const DisplayLarge = styled(BaseBlock)`
  font-size: 32px;
  line-height: 40px;

  @media (${props => props.theme.breakpoints.m}) {
    font-size: 40px;
    line-height: 48px;
  }
`;

export const Display = styled(BaseBlock)`
  font-size: 24px;
  line-height: 32px;

  @media (${props => props.theme.breakpoints.m}) {
    font-size: 32px;
    line-height: 40px;
  }
`;

export const DisplaySmall = styled(BaseBlock)`
  font-size: 20px;
  line-height: 24px;

  @media (${props => props.theme.breakpoints.m}) {
    font-size: 24px;
    line-height: 32px;
  }
`;

export const Title = styled(BaseBlock)`
  font-size: 18px;
  line-height: 24px;

  @media (${props => props.theme.breakpoints.m}) {
    font-size: 20px;
    line-height: 24px;
  }
`;

export const Header = styled(BaseBlock)`
  font-size: 16px;
  line-height: 24px;

  @media (${props => props.theme.breakpoints.m}) {
    font-size: 18px;
    line-height: 24px;
  }
`;

export const Paragraph = styled(BaseBlock)`
  font-size: 14px;
  line-height: 20px;

  @media (${props => props.theme.breakpoints.m}) {
    font-size: 16px;
    line-height: 24px;
  }
`;

export const Small = styled(BaseText)`
  display: ${props => (props.block ? 'block' : 'inline-block')};
  font-size: 14px;
  line-height: 20px;
`;

export const Micro = styled(BaseText)`
  display: ${props => (props.block ? 'block' : 'inline-block')};
  font-size: 12px;
  line-height: 16px;
`;

export const Label = styled(BaseText)`
  display: ${props => (props.block ? 'block' : 'inline-block')};
  font-size: 14px;
  line-height: 16px;
  text-transform: uppercase;
`;

export const Muted = styled.span`
  color: ${props => props.theme.colors.gray};
`;

export const Highlight = styled.span`
  color: ${props => props.theme.colors.white};
`;
