import styled from '@emotion/styled';
import Chevrons from 'assets/icons/chevrons.svg';

//
// Misc
//

export const Background = styled.div<{ gradient?: boolean }>`
  height: 100%;
  color: ${props => props.theme.colors.offWhite};
  background: ${props =>
    props.gradient ? props.theme.colors.gradient : props.theme.colors.blue};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: ${props => props.theme.sizes.s};
  font-weight: 400;
  letter-spacing: -0.01em;
`;

export const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 8px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
`;

export const Badge = styled.span<{ muted?: boolean }>`
  display: inline-block;
  margin-left: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: ${props => props.theme.colors.iris};
  background: rgba(99, 102, 241, 0.12);
  border-radius: 4px;
  padding: 2px 6px;
  text-transform: uppercase;
  line-height: 1.2;
  letter-spacing: 0.5px;

  ${props =>
    props.muted &&
    `
    color: ${props.theme.colors.gray};
    background: rgba(107, 114, 128, 0.12);
  `}
`;

export const Section = styled.section`
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
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
  font-family: 'Inter', sans-serif;
  font-size: ${props => props.theme.sizes.xs};
  font-weight: 500;
  min-width: ${props => (props.compact ? '0' : '80px')};
  height: ${props => (props.compact ? 'auto' : '36px')};
  padding: 0 16px;
  text-align: center;
  color: ${props => props.theme.colors.offWhite};
  background-color: ${props => props.theme.colors.lightBlue};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.15s ease;
  letter-spacing: -0.01em;

  &:hover {
    color: ${props => props.theme.colors.white};
    background-color: ${props => props.theme.colors.paleBlue};
    border-color: rgba(255, 255, 255, 0.2);
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
    border-color: transparent;
    &:hover {
      color: ${props.theme.colors.white};
      background-color: rgba(255, 255, 255, 0.06);
      border-color: transparent;
    }
  `}

  ${props =>
    props.disabled &&
    `
    opacity: 0.4;
    &:hover {
      cursor: not-allowed;
      background-color: ${props.theme.colors.lightBlue};
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
    color: ${props.theme.colors.pink};
    background-color: rgba(244, 63, 94, 0.1);
    &:hover {
      color: ${props.theme.colors.white};
      background-color: ${props.theme.colors.pink};
    }
  `}

  ${props =>
    props.primary &&
    `
    border: none;
    color: ${props.theme.colors.white};
    background-color: ${props.theme.colors.green};
    &:hover {
      background-color: #0ea572;
    }
  `}

  svg {
    margin: 0 6px 0 0;

    &:hover {
      background-color: transparent;
    }
  }
`;

export const Input = styled.input`
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: ${props => props.theme.sizes.xl};
  color: ${props => props.theme.colors.offWhite};
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 14px;
  text-align: center;
  transition: border-color 0.15s ease;
  letter-spacing: -0.02em;

  &:active,
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.iris};
    background-color: rgba(255, 255, 255, 0.06);
  }

  &::placeholder {
    color: ${props => props.theme.colors.gray};
  }
`;

export const TextArea = styled.textarea`
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: ${props => props.theme.sizes.s};
  color: ${props => props.theme.colors.offWhite};
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 14px;
  transition: border-color 0.15s ease;

  &:active,
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.iris};
    background-color: rgba(255, 255, 255, 0.06);
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

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
`;
