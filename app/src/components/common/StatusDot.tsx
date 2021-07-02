import React from 'react';
import styled from '@emotion/styled';
import { Dot } from '../base';

const Styled = {
  DotIcon: styled(Dot)`
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
  `,
};

interface Props {
  status: 'success' | 'warn' | 'error' | 'idle';
  className?: string;
}

const StatusDot: React.FC<Props> = ({ status, className }) => {
  const { DotIcon } = Styled;
  const cn = `${status} ${className || ''}`;
  return <DotIcon size="small" className={cn} aria-label={status} />;
};

export default StatusDot;
