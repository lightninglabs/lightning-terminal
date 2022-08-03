import styled from '@emotion/styled';

interface Props {
  secondary?: boolean;
  tertiary?: boolean;
}

const PurpleButton = styled.button<Props>`
  font-family: ${props => props.theme.fonts.open.regular};
  font-size: ${props => props.theme.sizes.m};
  font-weight: 600;
  height: auto;
  color: white;
  background-color: #5d5fef;
  border-width: 0;
  border-radius: 4px;
  padding: 14px 24px;

  &:hover {
    background-color: #3d40e7;
  }

  &:focus {
    outline: none;
  }

  ${props =>
    props.secondary &&
    `
    color: #252F4A;
    background-color: ${props.theme.colors.white};

    &:hover {
      opacity: 0.8;
      background-color: ${props.theme.colors.white};
    }
  `}

  ${props =>
    props.tertiary &&
    `
    background-color: #384770;

    &:hover {
      background-color: #2E3A5C;
    }
  `}

  > svg {
    margin-right: 6px;
  }
`;

export default PurpleButton;
