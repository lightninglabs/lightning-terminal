import React from 'react';
import styled from '@emotion/styled';
import Tooltip from 'rc-tooltip';
import { TooltipProps } from 'rc-tooltip/lib/Tooltip';

/**
 * Returns an offset array to create a 10px gap between the
 * tooltip arrow and the target element
 * @param placement the placement of the tooltip
 */
const getOffset = (placement: string) => {
  let offset: number[] | undefined = undefined;

  switch (placement) {
    case 'top':
    case 'topLeft':
    case 'topRight':
      offset = [0, 10];
      break;
    case 'bottom':
    case 'bottomLeft':
    case 'bottomRight':
      offset = [0, -10];
      break;
    case 'left':
      offset = [10, 0];
      break;
    case 'right':
      offset = [-10, 0];
      break;
  }

  return offset;
};

interface Props extends TooltipProps {
  className?: string;
}

/**
 * Wrap the Tooltip component to add some reusable configuration
 * for all tooltips throughout the entire site and to pass
 * className as overlayClassName to the Tooltip component
 */
const TooltipWrapper: React.FC<Props> = ({
  className,
  placement = 'top',
  children,
  ...props
}) => {
  const targetOffset = getOffset(placement);
  return (
    <Tooltip
      {...props}
      placement={placement}
      align={{ targetOffset }}
      overlayClassName={className}
      mouseEnterDelay={0.5}
    >
      {children}
    </Tooltip>
  );
};

/**
 * Style our wrapper component so that our styles can be passed into the
 * `overlayClassName` prop of the Tooltip component. We cannot style the
 * Tooltip component directly because it does not accept a `className`
 * prop. So we basically proxy the className using the TooltipWrapper
 * above, then export this styled component for the rest of the app to use
 */
const Tip = styled(TooltipWrapper)<{ capitalize?: boolean; maxWidth?: number }>`
  max-width: ${props => (props.maxWidth ? `${props.maxWidth}px` : 'auto')};
  color: ${props => props.theme.colors.blue};
  font-family: ${props => props.theme.fonts.open.semiBold};
  font-size: ${props => props.theme.sizes.xs};
  text-transform: ${props => (props.capitalize === false ? 'none' : 'uppercase')};
  opacity: 0.95;

  &.rc-tooltip-placement-bottom .rc-tooltip-arrow,
  &.rc-tooltip-placement-bottomLeft .rc-tooltip-arrow,
  &.rc-tooltip-placement-bottomRight .rc-tooltip-arrow {
    border-bottom-color: ${props => props.theme.colors.white};
  }

  &.rc-tooltip-placement-top .rc-tooltip-arrow,
  &.rc-tooltip-placement-topLeft .rc-tooltip-arrow,
  &.rc-tooltip-placement-topRight .rc-tooltip-arrow {
    border-top-color: ${props => props.theme.colors.white};
  }

  &.rc-tooltip-placement-left .rc-tooltip-arrow {
    border-left-color: ${props => props.theme.colors.white};
  }

  &.rc-tooltip-placement-right .rc-tooltip-arrow {
    border-right-color: ${props => props.theme.colors.white};
  }

  .rc-tooltip-inner {
    text-align: center;
    border: 1px solid ${props => props.theme.colors.white};
  }
`;

export default Tip;
