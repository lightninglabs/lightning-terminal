import React, { CSSProperties } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { BalanceStatus } from 'util/constants';
import { ellipseInside } from 'util/strings';
import { useStore } from 'store';
import { Channel } from 'store/models';
import Checkbox from 'components/common/Checkbox';
import { Column, Row } from 'components/common/grid';
import StatusDot from 'components/common/StatusDot';
import { HeaderFour } from 'components/common/text';
import Unit from 'components/common/Unit';
import { styled } from 'components/theme';
import ChannelBalance from './ChannelBalance';

/**
 * the virtualized list requires each row to have a specified
 * height. Defining a const here because it is used in multiple places
 */
export const ROW_HEIGHT = 60;

const Styled = {
  Row: styled(Row)<{ dimmed?: boolean; selectable?: boolean }>`
    border-bottom: 0.5px solid ${props => props.theme.colors.darkGray};
    opacity: ${props => (props.dimmed ? '0.4' : '1')};

    &:last-child {
      border-bottom-width: 0;
    }

    ${props =>
      props.selectable &&
      `
      &:hover {
        cursor: pointer;
        background-color: ${props.theme.colors.tileBack};
      }
    `}
  `,
  Column: styled(Column)<{ last?: boolean }>`
    white-space: nowrap;
    line-height: ${ROW_HEIGHT}px;
  `,
  StatusIcon: styled.span`
    float: left;
    margin-top: -1px;
    margin-left: 15px;
    color: ${props => props.theme.colors.pink};
  `,
  Check: styled(Checkbox)`
    float: left;
    margin-top: 18px;
    margin-left: 10px;
  `,
  Balance: styled(ChannelBalance)`
    margin-top: ${ROW_HEIGHT / 2 - 2}px;
  `,
};

export const ChannelRowHeader: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.ChannelRowHeader');
  return (
    <Row>
      <Column right>
        <HeaderFour>{l('canReceive')}</HeaderFour>
      </Column>
      <Column cols={3}></Column>
      <Column>
        <HeaderFour>{l('canSend')}</HeaderFour>
      </Column>
      <Column>
        <HeaderFour>{l('upTime')}</HeaderFour>
      </Column>
      <Column>
        <HeaderFour>{l('peer')}</HeaderFour>
      </Column>
      <Column right>
        <HeaderFour>{l('capacity')}</HeaderFour>
      </Column>
    </Row>
  );
};

const ChannelDot: React.FC<{ channel: Channel }> = observer(({ channel }) => {
  if (!channel.active) return <StatusDot status="idle" />;

  switch (channel.balanceStatus) {
    case BalanceStatus.ok:
      return <StatusDot status="success" />;
    case BalanceStatus.warn:
      return <StatusDot status="warn" />;
    case BalanceStatus.danger:
      return <StatusDot status="error" />;
  }
});

interface Props {
  channel: Channel;
  style?: CSSProperties;
}

const ChannelRow: React.FC<Props> = ({ channel, style }) => {
  const store = useStore();

  const editable = store.buildSwapStore.listEditable;
  const disabled = store.buildSwapStore.showWizard;
  const checked = store.buildSwapStore.selectedChanIds.includes(channel.chanId);
  const dimmed = editable && disabled && !checked;

  const handleRowChecked = () => {
    store.buildSwapStore.toggleSelectedChannel(channel.chanId);
  };

  const { Row, Column, StatusIcon, Check, Balance } = Styled;
  return (
    <Row
      dimmed={dimmed}
      style={style}
      selectable={editable && !disabled}
      onClick={editable && !disabled ? handleRowChecked : undefined}
    >
      <Column right>
        {editable ? (
          <Check checked={checked} disabled={disabled} />
        ) : (
          <StatusIcon>
            <ChannelDot channel={channel} />
          </StatusIcon>
        )}
        <Unit sats={channel.remoteBalance} suffix={false} />
      </Column>
      <Column cols={3}>
        <Balance channel={channel} />
      </Column>
      <Column>
        <Unit sats={channel.localBalance} suffix={false} />
      </Column>
      <Column>{channel.uptimePercent}</Column>
      <Column>{ellipseInside(channel.remotePubkey)}</Column>
      <Column right>
        <Unit sats={channel.capacity} suffix={false} />
      </Column>
    </Row>
  );
};

export default observer(ChannelRow);
