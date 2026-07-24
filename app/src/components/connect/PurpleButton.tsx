import styled from '@emotion/styled';

interface Props {
  secondary?: boolean;
  tertiary?: boolean;
}

const PurpleButton = styled.button<Props>`
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  height: auto;
  color: white;
  background-color: ${props => props.theme.colors.iris};
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  transition: all 0.15s ease;
  letter-spacing: -0.01em;

  &:hover {
    background-color: #5355d4;
  }

  &:focus {
    outline: none;
  }

  ${props =>
    props.secondary &&
    `
    color: white;
    background-color: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `}

  ${props =>
    props.tertiary &&
    `
    background-color: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `}

  > svg {
    margin-right: 6px;
  }
`;

export default PurpleButton;
