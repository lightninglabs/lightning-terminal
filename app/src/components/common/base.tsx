import Chevrons from 'assets/icons/chevrons.svg';
import { styled } from 'components/theme';

export const Background = styled.div`
  min-height: 100vh;
  color: ${props => props.theme.colors.white};
  background-color: ${props => props.theme.colors.blue};
  font-family: ${props => props.theme.fonts.regular};
  font-size: ${props => props.theme.sizes.m};
`;

export const Pill = styled.span`
  display: inline-block;
  width: 40px;
  height: 40px;
  padding: 5px;
  margin-right: 10px;
  text-align: center;
  background-color: ${props => props.theme.colors.tileBack};
  border-radius: 40px;
`;

interface ButtonProps {
  primary?: boolean;
  ghost?: boolean;
  borderless?: boolean;
}

export const Button = styled.button<ButtonProps>`
  min-width: 120px;
  height: 44px;
  padding-left: 15px;
  padding-right: 15px;
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

  svg {
    margin-right: 10px;
  }
`;

/**
 * the input[type=range] element. Vendor-specific rules for pseudo
 * elements cannot be mixed. As such, there are no shared styles for focus or
 * active states on prefixed selectors.
 */
export const RangeInput = styled.input`
  &:focus {
    outline: none;

    /* 
     * Pseudo-elements must be split across multiple rule sets to have an effect.
     */
    &::-webkit-slider-thumb {
      border: 0.2rem solid ${props => props.theme.colors.darkBlue};
      box-shadow: 0 0 0 2px ${props => props.theme.colors.pink};
    }
    &::-moz-range-thumb {
      border: 0.2rem solid ${props => props.theme.colors.darkBlue};
      box-shadow: 0 0 0 2px ${props => props.theme.colors.pink};
    }
    &::-ms-thumb {
      border: 0.2rem solid ${props => props.theme.colors.darkBlue};
      box-shadow: 0 0 0 2px ${props => props.theme.colors.pink};
    }
  }
  &::-webkit-slider-thumb {
    width: 2rem;
    height: 2rem;
    margin-top: -0.9rem; /* (track-height - thumb-height) / 2 */
    color: ${props => props.theme.colors.darkBlue};
    background-color: ${props => props.theme.colors.whitish};
    background-image: url(${Chevrons});
    border: 0.2rem solid ${props => props.theme.colors.darkBlue};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.pink};
    border-radius: 2rem;

    &:active,
    &:hover {
      background-color: ${props => props.theme.colors.whitish}dd;
    }
  }

  &::-webkit-slider-runnable-track {
    background-color: ${props => props.theme.colors.pink};
    height: 0.2rem;
    border-radius: 2px;
  }

  &::-moz-range-thumb {
    width: 2rem;
    height: 2rem;
    color: ${props => props.theme.colors.darkBlue};
    background-color: ${props => props.theme.colors.whitish};
    border: 0.2rem solid ${props => props.theme.colors.darkBlue};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.pink};
    border-radius: 2rem;

    &:active,
    &:hover {
      background-color: ${props => props.theme.colors.whitish}dd;
    }
  }

  &::-moz-range-track {
    background-color: ${props => props.theme.colors.pink};
    height: 0.2rem;
    border-radius: 2px;
  }

  &::-ms-thumb {
    width: 2rem;
    height: 2rem;
    color: ${props => props.theme.colors.darkBlue};
    background-color: ${props => props.theme.colors.whitish};
    border: 0.2rem solid ${props => props.theme.colors.darkBlue};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.pink};
    border-radius: 2rem;

    &:active,
    &:hover {
      background-color: ${props => props.theme.colors.whitish}dd;
    }
  }

  &::-ms-track {
    height: 0.2rem;
    height: 1rem;
  }

  &::-ms-fill-lower {
    background-color: ${props => props.theme.colors.pink};
    border-radius: 2px;
  }

  &::-ms-fill-upper {
    background-color: ${props => props.theme.colors.pink};
    border-radius: 2px;
  }
`;
