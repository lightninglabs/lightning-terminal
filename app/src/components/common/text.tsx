import { styled } from 'components/theme';

interface BlockProps {
  block?: boolean;
}

export const Title = styled.div`
  font-size: ${props => props.theme.sizes.s};
  font-family: ${props => props.theme.fonts.semiBold};
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
