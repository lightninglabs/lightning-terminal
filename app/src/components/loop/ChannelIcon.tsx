import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { BalanceStatus } from 'util/constants';
import { Channel } from 'store/models';
import StatusArrow from 'components/common/StatusArrow';
import StatusDot from 'components/common/StatusDot';
import Tip from 'components/common/Tip';

type Status = 'success' | 'warn' | 'error' | 'idle';

const StatusMap: Record<BalanceStatus, Status> = {
  [BalanceStatus.ok]: 'success',
  [BalanceStatus.warn]: 'warn',
  [BalanceStatus.danger]: 'error',
};

interface Props {
  channel: Channel;
}

const ChannelIcon: React.FC<Props> = ({ channel }) => {
  const { l } = usePrefixedTranslation('cmps.loop.ChannelIcon.processing');
  let status = StatusMap[channel.balanceStatus];
  if (!channel.active) status = 'idle';

  if (channel.processingSwapsDirection !== 'none') {
    return (
      <Tip
        overlay={l(channel.processingSwapsDirection)}
        capitalize={false}
        placement="right"
      >
        <span>
          <StatusArrow status={status} direction={channel.processingSwapsDirection} />
        </span>
      </Tip>
    );
  }

  return <StatusDot status={status} />;
};

export default observer(ChannelIcon);
