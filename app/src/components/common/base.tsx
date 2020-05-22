import Chevrons from 'assets/icons/chevrons.svg';
import { styled } from 'components/theme';

//
// Misc
//

export const Background = styled.div`
  min-height: 100vh;
  color: ${props => props.theme.colors.white};
  background-color: ${props => props.theme.colors.blue};
  font-family: ${props => props.theme.fonts.open.regular};
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

//
// Button
//

interface ButtonProps {
  primary?: boolean;
  ghost?: boolean;
  borderless?: boolean;
  disabled?: boolean;
}

export const Button = styled.button<ButtonProps>`
  font-family: ${props => props.theme.fonts.work.medium};
  font-size: ${props => props.theme.sizes.s};
  min-width: 120px;
  height: 44px;
  padding-left: 15px;
  padding-right: 15px;
  margin-left: 10px;
  text-align: center;
  color: ${props => props.theme.colors.whitish};
  background-color: ${props => props.theme.colors.blue};
  border: 1px solid ${props => props.theme.colors.whitish};
  border-radius: 22px;

  &:hover {
    color: ${props => props.theme.colors.blue};
    background-color: ${props => props.theme.colors.white};
    cursor: pointer;
  }

  &:active,
  &:focus {
    outline: none;
  }

  ${props =>
    props.ghost &&
    `
    background-color: transparent;
    &:hover {
      color: ${props.theme.colors.whitish};
      text-decoration: underline;
      background-color: transparent;
    }
  `}

  ${props =>
    props.disabled &&
    `
    opacity: 0.5;
    &:hover {
      cursor: not-allowed;
    }
  `}

  ${props =>
    props.borderless &&
    `
    border-width: 0;
  `}

  ${props =>
    props.primary &&
    `
    border: 1px solid ${props.theme.colors.green};
    &:hover {
      color: ${props.theme.colors.blue};
      text-decoration: none;
      background-color: ${props.theme.colors.green};
    }
  `}

  svg {
    margin-right: 10px;
    width: ${props => props.theme.sizes.m};
    height: ${props => props.theme.sizes.m};
  }
`;

//
// Radio Button
//

interface RadioButtonProps {
  checked?: boolean;
}

export const RadioButton = styled.span<RadioButtonProps>`
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 14px;
  border: 1px solid ${props => props.theme.colors.lightPurple};
  background-color: ${props => (props.checked ? props.theme.colors.lightPurple : 'none')};

  &:hover {
    opacity: 0.8;
  }
`;

//
// List
//

/**
 * the react-virtualized list doesn't play nice with the bootstrap row -15px
 * margin. We need to manually offset the container and remove the
 * padding from the last column to get the alignment correct
 */
export const ListContainer = styled.div`
  margin-right: -15px;

  .col:last-child {
    padding-right: 0;
  }

  *:focus {
    outline: none;
  }
`;

//
// Range
//

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
