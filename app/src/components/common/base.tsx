import { styled } from 'components/theme';

export const Background = styled.div`
  min-height: 100vh;
  color: ${props => props.theme.colors.white};
  background-color: ${props => props.theme.colors.blue};
  font-family: ${props => props.theme.fonts.regular};
  font-size: ${props => props.theme.sizes.m};
`;

interface ButtonProps {
  primary?: boolean;
  ghost?: boolean;
  borderless?: boolean;
}

export const Button = styled.button<ButtonProps>`
  min-width: 120px;
  height: 44px;
  line-height: 44px;
  padding: 0;
  margin-left: 10px;
  text-align: center;
  color: ${props => props.theme.colors.white};
  background-color: ${props =>
    props.ghost ? 'transparent' : props.theme.colors.tileBack};
  border-width: ${props => (props.borderless ? '0' : '1px')};
  border-color: ${props =>
    props.primary ? props.theme.colors.green : props.theme.colors.white};
  border-style: solid;
  border-radius: 22px;

  &:hover {
    opacity: 80%;
  }
`;
