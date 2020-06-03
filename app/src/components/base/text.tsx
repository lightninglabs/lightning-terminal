import { styled } from 'components/theme';

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
