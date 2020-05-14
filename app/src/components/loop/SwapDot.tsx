import React from 'react';
import { observer } from 'mobx-react-lite';
import { Swap } from 'store/models';
import StatusDot from 'components/common/StatusDot';

interface Props {
  swap: Swap;
}

const SwapDot: React.FC<Props> = ({ swap }) => {
  switch (swap.stateLabel) {
    case 'Success':
      return <StatusDot status="success" />;
    case 'Failed':
      return <StatusDot status="error" />;
    default:
      return <StatusDot status="warn" />;
  }
};

export default observer(SwapDot);
