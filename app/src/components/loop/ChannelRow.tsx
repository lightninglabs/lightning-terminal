import React, { CSSProperties } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Channel } from 'store/models';
import { Cancel, Column, HeaderFour, Row } from 'components/base';
import Checkbox from 'components/common/Checkbox';
import ExternalLink from 'components/common/ExternalLink';
import SortableHeader from 'components/common/SortableHeader';
import Tip from 'components/common/Tip';
import Unit from 'components/common/Unit';
import ChannelBalance from './ChannelBalance';
import ChannelIcon from './ChannelIcon';

/**
 * the virtualized list requires each row to have a specified
 * height. Defining a const here because it is used in multiple places
 */
export const ROW_HEIGHT = 60;

const BaseColumn = styled(Column)`
  white-space: nowrap;
  line-height: ${ROW_HEIGHT}px;
  padding-left: 5px;
  padding-right: 5px;
`;

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
        background-color: ${props.theme.colors.overlay};
      }
    `}
  `,
  Column: styled(BaseColumn)<{ last?: boolean }>`
    padding-right: ${props => (props.last ? '15' : '5')}px;
  `,
  ActionColumn: styled(BaseColumn)`
    max-width: 50px;
    padding-left: 24px;
  `,
  WideColumn: styled(BaseColumn)`
    overflow: hidden;
    text-overflow: ellipsis;

    @media (min-width: 1200px) and (max-width: 1300px) {
      max-width: 20%;
    }
  `,
  ClearSortIcon: styled(Cancel)`
    padding: 2px;
    margin-left: 4px;
  `,
  StatusIcon: styled.span`
    color: ${props => props.theme.colors.pink};
  `,
  Check: styled(Checkbox)`
    margin-top: 17px;
  `,
  Balance: styled(ChannelBalance)`
    margin-top: ${ROW_HEIGHT / 2 - 2}px;
  `,
  AliasTip: styled.div`
    text-align: right;
  `,
};

const ChannelAliasTip: React.FC<{ channel: Channel }> = ({ channel }) => {
  return (
    <Styled.AliasTip>
      {channel.aliasDetail.split('\n').map(text => (
        <div key={text}>{text}</div>
      ))}
    </Styled.AliasTip>
  );
};

const RowHeader: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.ChannelRowHeader');
  const { settingsStore } = useStore();

  const { Column, ActionColumn, WideColumn, ClearSortIcon } = Styled;
  return (
    <Row>
      <ActionColumn>
        {settingsStore.channelSort.field && (
          <Tip overlay={l('resetSort')} placement="right">
            <HeaderFour>
              <ClearSortIcon size="x-small" onClick={settingsStore.resetChannelSort} />
            </HeaderFour>
          </Tip>
        )}
      </ActionColumn>
      <Column right>
        <SortableHeader<Channel>
          field="remoteBalance"
          sort={settingsStore.channelSort}
          onSort={settingsStore.setChannelSort}
        >
          <span data-tour="channel-list-receive">{l('canReceive')}</span>
        </SortableHeader>
      </Column>
      <WideColumn cols={2} colsXl={3} />
      <Column>
        <SortableHeader<Channel>
          field="localBalance"
          sort={settingsStore.channelSort}
          onSort={settingsStore.setChannelSort}
        >
          <span data-tour="channel-list-send">{l('canSend')}</span>
        </SortableHeader>
      </Column>
      <Column>
        <SortableHeader<Channel>
          field="remoteFeeRate"
          sort={settingsStore.channelSort}
          onSort={settingsStore.setChannelSort}
        >
          <Tip overlay={l('feeRateTip')} capitalize={false}>
            <span data-tour="channel-list-fee">{l('feeRate')}</span>
          </Tip>
        </SortableHeader>
      </Column>
      <Column>
        <SortableHeader<Channel>
          field="uptimePercent"
          sort={settingsStore.channelSort}
          onSort={settingsStore.setChannelSort}
        >
          <span data-tour="channel-list-uptime">{l('upTime')}</span>
        </SortableHeader>
      </Column>
      <WideColumn cols={2}>
        <SortableHeader<Channel>
          field="aliasLabel"
          sort={settingsStore.channelSort}
          onSort={settingsStore.setChannelSort}
        >
          <span data-tour="channel-list-peer">{l('peer')}</span>
        </SortableHeader>
      </WideColumn>
      <Column right last>
        <SortableHeader<Channel>
          field="capacity"
          sort={settingsStore.channelSort}
          onSort={settingsStore.setChannelSort}
        >
          <span data-tour="channel-list-capacity">{l('capacity')}</span>
        </SortableHeader>
      </Column>
    </Row>
  );
};

export const ChannelRowHeader = observer(RowHeader);

interface Props {
  channel: Channel;
  style?: CSSProperties;
}

const ChannelRow: React.FC<Props> = ({ channel, style }) => {
  const { buildSwapView } = useStore();

  const editable = buildSwapView.listEditable;
  const disabled = buildSwapView.showWizard;
  const checked = buildSwapView.selectedChanIds.includes(channel.chanId);
  const dimmed = editable && disabled && !checked;

  const handleRowChecked = () => {
    buildSwapView.toggleSelectedChannel(channel.chanId);
  };

  const { Row, Column, ActionColumn, WideColumn, StatusIcon, Check, Balance } = Styled;
  return (
    <Row
      dimmed={dimmed}
      style={style}
      selectable={editable && !disabled}
      onClick={editable && !disabled ? handleRowChecked : undefined}
    >
      <ActionColumn>
        {editable ? (
          <Check checked={checked} disabled={disabled} />
        ) : (
          <StatusIcon>
            <ChannelIcon channel={channel} />
          </StatusIcon>
        )}
      </ActionColumn>
      <Column right>
        <Unit sats={channel.remoteBalance} suffix={false} />
      </Column>
      <WideColumn cols={2} colsXl={3}>
        <Balance channel={channel} />
      </WideColumn>
      <Column>
        <Unit sats={channel.localBalance} suffix={false} />
      </Column>
      <Column>
        <Tip overlay={`${channel.remoteFeeRate} ppm`} placement="left" capitalize={false}>
          <span>{channel.remoteFeePct}</span>
        </Tip>
      </Column>
      <Column>{channel.uptimePercent}</Column>
      <WideColumn cols={2}>
        <Tip
          overlay={<ChannelAliasTip channel={channel} />}
          placement="left"
          capitalize={false}
        >
          <span>
            <ExternalLink href={channel.remoteNodeUrl}>{channel.aliasLabel}</ExternalLink>
          </span>
        </Tip>
      </WideColumn>
      <Column right>
        <Unit sats={channel.capacity} suffix={false} />
      </Column>
    </Row>
  );
};

export default observer(ChannelRow);
