import { styled } from 'components/theme';

interface BlockProps {
  block?: boolean;
}

export const HeaderOne = styled.h1`
  font-family: ${props => props.theme.fonts.work.medium};
  font-size: ${props => props.theme.sizes.xxl};
  line-height: 52px;
`;

export const HeaderTwo = styled.h2`
  font-family: ${props => props.theme.fonts.open.regular};
  font-size: ${props => props.theme.sizes.m};
  line-height: 26px;
`;

export const HeaderThree = styled.h3`
  font-family: ${props => props.theme.fonts.open.regular};
  font-size: ${props => props.theme.sizes.l};
  line-height: 30px;
  letter-spacing: 2.7px;
  text-transform: uppercase;
`;

export const HeaderFour = styled.h4`
  font-family: ${props => props.theme.fonts.open.semiBold};
  font-size: ${props => props.theme.sizes.s};
  line-height: 20px;
  text-transform: uppercase;
`;

export const Small = styled.p`
  font-size: ${props => props.theme.sizes.s};
  line-height: 19px;
`;

export const Jumbo = styled.span`
  font-size: ${props => props.theme.sizes.xl};
  line-height: 38px;
`;

export const Title = styled.div`
  font-size: ${props => props.theme.sizes.s};
  font-family: ${props => props.theme.fonts.open.semiBold};
  text-transform: uppercase;
  letter-spacing: 0;
  line-height: 19px;
  color: ${props => props.theme.colors.gray};
`;

export const SmallText = styled.span<BlockProps>`
  ${props => props.block && 'display: block;'}
  font-size: ${props => props.theme.sizes.s};
  letter-spacing: 0.22px;
`;

export const LargeText = styled.span<BlockProps>`
  ${props => props.block && 'display: block;'}
  font-size: ${props => props.theme.sizes.l};
  letter-spacing: 0.43px;
`;

export const XLargeText = styled.span<BlockProps>`
  ${props => props.block && 'display: block;'}
  font-size: ${props => props.theme.sizes.xl};
  letter-spacing: 0.43px;
`;

export const PageTitle = styled.h2`
  font-family: ${props => props.theme.fonts.open.light};
  font-size: ${props => props.theme.sizes.l};
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2.7px;
  line-height: 30px;
`;

export const H3Text = styled.h3`
  font-family: ${props => props.theme.fonts.open.bold};
  font-size: ${props => props.theme.sizes.m};
`;
