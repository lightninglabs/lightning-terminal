import React from 'react';
import styled from '@emotion/styled';
import { Chevrons, ChevronsLeft, ChevronsRight } from '../base';

const BaseIcon = styled.span`
  padding: 0;

  &.success {
    color: ${props => props.theme.colors.green};
  }
  &.warn {
    color: ${props => props.theme.colors.gold};
  }
  &.error {
    color: ${props => props.theme.colors.pink};
  }
  &.idle {
    color: ${props => props.theme.colors.gray};
  }
`;

interface Props {
  status: 'success' | 'warn' | 'error' | 'idle';
  direction: 'in' | 'out' | 'both';
}

const DirectionIcons: Record<Props['direction'], any> = {
  both: BaseIcon.withComponent(Chevrons),
  in: BaseIcon.withComponent(ChevronsRight),
  out: BaseIcon.withComponent(ChevronsLeft),
};

const StatusArrow: React.FC<Props> = ({ status, direction }) => {
  const Icon = DirectionIcons[direction];
  return <Icon size="small" className={status} aria-label={`${status} ${direction}`} />;
};

export default StatusArrow;
