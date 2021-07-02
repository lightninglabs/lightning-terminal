import styled from '@emotion/styled';
import Chevrons from 'assets/icons/chevrons.svg';

//
// Misc
//

export const Background = styled.div<{ gradient?: boolean }>`
  height: 100%;
  color: ${props => props.theme.colors.white};
  background: ${props =>
    props.gradient ? props.theme.colors.gradient : props.theme.colors.blue};
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
  background-color: ${props => props.theme.colors.overlay};
  border-radius: 40px;
`;

export const Badge = styled.span<{ muted?: boolean }>`
  display: inline-block;
  margin-left: 10px;
  font-family: ${props => props.theme.fonts.open.light};
  font-size: ${props => props.theme.sizes.xxs};
  font-weight: 700;
  color: ${props => props.theme.colors.pink};
  border: 1px solid ${props => props.theme.colors.pink};
  border-radius: 4px;
  padding: 3px 5px 5px;
  text-transform: lowercase;
  line-height: 1;
  letter-spacing: 1.8px;

  ${props =>
    props.muted &&
    `
    color: ${props.theme.colors.gray};
    border: 1px solid ${props.theme.colors.gray};

  `}
`;

export const Section = styled.section`
  padding: 15px;
  background-color: ${props => props.theme.colors.overlay};
  border: 1px solid ${props => props.theme.colors.blue};
  border-radius: 5px;
`;

export const SummaryItem = styled.div<{ strong?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: 10px;
  line-height: 1.2;
  font-size: ${props => props.theme.sizes.xs};
  font-weight: ${props => (props.strong ? 'bold' : 'normal')};
`;

export const Empty = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${props => props.theme.sizes.xs};
  color: ${props => props.theme.colors.gray};
`;

//
// Button
//

interface ButtonProps {
  primary?: boolean;
  danger?: boolean;
  ghost?: boolean;
  borderless?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

export const Button = styled.button<ButtonProps>`
  font-family: ${props => props.theme.fonts.work.medium};
  font-size: ${props => props.theme.sizes.s};
  min-width: ${props => (props.compact ? '0' : '120px')};
  height: ${props => (props.compact ? 'auto' : '44px')};
  padding-left: 15px;
  padding-right: 15px;
  text-align: center;
  color: ${props => props.theme.colors.offWhite};
  background-color: ${props => props.theme.colors.blue};
  border: 1px solid ${props => props.theme.colors.offWhite};
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
      color: ${props.theme.colors.offWhite};
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
    props.danger &&
    `
    border: 1px solid ${props.theme.colors.pink};
    &:hover {
      color: ${props.theme.colors.blue};
      text-decoration: none;
      background-color: ${props.theme.colors.pink};
    }
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
    margin: 0 5px 0 0;

    &:hover {
      background-color: transparent;
    }
  }
`;

export const Input = styled.input`
  font-family: ${props => props.theme.fonts.work.light};
  font-weight: 300;
  font-size: ${props => props.theme.sizes.xxl};
  color: ${props => props.theme.colors.offWhite};
  background-color: transparent;
  border-width: 0;
  border-bottom: 3px solid ${props => props.theme.colors.offWhite};
  padding: 5px;
  text-align: center;

  &:active,
  &:focus {
    outline: none;
    background-color: ${props => props.theme.colors.overlay};
    border-bottom-color: ${props => props.theme.colors.white};
  }

  &::placeholder {
    color: ${props => props.theme.colors.gray};
  }
`;

export const TextArea = styled.textarea`
  font-family: ${props => props.theme.fonts.work.light};
  font-weight: 300;
  font-size: ${props => props.theme.sizes.m};
  color: ${props => props.theme.colors.offWhite};
  background-color: ${props => props.theme.colors.overlay};
  border-width: 0;
  border-bottom: 3px solid ${props => props.theme.colors.offWhite};
  padding: 5px;

  &:active,
  &:focus {
    outline: none;
    background-color: ${props => props.theme.colors.overlay};
    border-bottom-color: ${props => props.theme.colors.white};
  }

  &::placeholder {
    color: ${props => props.theme.colors.gray};
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
  border: 1px solid ${props => props.theme.colors.offWhite};
  background-color: ${props => (props.checked ? props.theme.colors.offWhite : 'none')};

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
    background-color: ${props => props.theme.colors.offWhite};
    background-image: url(${Chevrons});
    border: 0.2rem solid ${props => props.theme.colors.darkBlue};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.pink};
    border-radius: 2rem;

    &:active,
    &:hover {
      background-color: ${props => props.theme.colors.offWhite}dd;
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
    background-color: ${props => props.theme.colors.offWhite};
    border: 0.2rem solid ${props => props.theme.colors.darkBlue};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.pink};
    border-radius: 2rem;

    &:active,
    &:hover {
      background-color: ${props => props.theme.colors.offWhite}dd;
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
    background-color: ${props => props.theme.colors.offWhite};
    border: 0.2rem solid ${props => props.theme.colors.darkBlue};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.pink};
    border-radius: 2rem;

    &:active,
    &:hover {
      background-color: ${props => props.theme.colors.offWhite}dd;
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

export const Scrollable = styled.div`
  flex: 1 1 auto;
  height: 0px;
  overflow: auto;

  // use consistent scrollbars across different platforms
  &::-webkit-scrollbar {
    width: 8px;
    background-color: rgba(0, 0, 0, 0);
    border-radius: 10px;
  }
  &::-webkit-scrollbar:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  &::-webkit-scrollbar-thumb:vertical {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:vertical:active {
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 10px;
  }
`;
