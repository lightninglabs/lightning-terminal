import { styled } from 'components/theme';

export const Background = styled.div`
  min-height: 100vh;
  color: ${props => props.theme.colors.white};
  background-color: ${props => props.theme.colors.blue};
  font-family: ${props => props.theme.fonts.regular};
  font-size: ${props => props.theme.sizes.m};
`;
