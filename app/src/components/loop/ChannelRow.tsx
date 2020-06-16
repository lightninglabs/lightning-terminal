import React, { CSSProperties } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Channel } from 'store/models';
import { Column, HeaderFour, Row } from 'components/base';
import Checkbox from 'components/common/Checkbox';
import Tip from 'components/common/Tip';
import Unit from 'components/common/Unit';
import { styled } from 'components/theme';
import ChannelBalance from './ChannelBalance';
import ChannelIcon from './ChannelIcon';

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
        background-color: ${props.theme.colors.overlay};
      }
    `}
  `,
  Column: styled(Column)<{ last?: boolean; ellipse?: boolean }>`
    white-space: nowrap;
    line-height: ${ROW_HEIGHT}px;
    padding-left: 5px;
    padding-right: ${props => (props.last ? '15' : '5')}px;
    ${props =>
      props.ellipse &&
      `
      overflow: hidden;
      text-overflow: ellipsis;
    `}
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

export const ChannelRowHeader: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.ChannelRowHeader');
  const { Column } = Styled;
  return (
    <Row>
      <Column right>
        <HeaderFour>{l('canReceive')}</HeaderFour>
      </Column>
      <Column cols={2} colsXl={3}></Column>
      <Column>
        <HeaderFour>{l('canSend')}</HeaderFour>
      </Column>
      <Column cols={1}>
        <Tip overlay={l('feeRateTip')} capitalize={false}>
          <HeaderFour>{l('feeRate')}</HeaderFour>
        </Tip>
      </Column>
      <Column cols={1}>
        <HeaderFour>{l('upTime')}</HeaderFour>
      </Column>
      <Column cols={2}>
        <HeaderFour>{l('peer')}</HeaderFour>
      </Column>
      <Column right last>
        <HeaderFour>{l('capacity')}</HeaderFour>
      </Column>
    </Row>
  );
};

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
            <ChannelIcon channel={channel} />
          </StatusIcon>
        )}
        <Unit sats={channel.remoteBalance} suffix={false} />
      </Column>
      <Column cols={2} colsXl={3}>
        <Balance channel={channel} />
      </Column>
      <Column>
        <Unit sats={channel.localBalance} suffix={false} />
      </Column>
      <Column cols={1}>{channel.remoteFeeRate}</Column>
      <Column cols={1}>{channel.uptimePercent}</Column>
      <Column cols={2} ellipse>
        <Tip
          overlay={<ChannelAliasTip channel={channel} />}
          placement="left"
          capitalize={false}
        >
          <span>{channel.aliasLabel}</span>
        </Tip>
      </Column>
      <Column right>
        <Unit sats={channel.capacity} suffix={false} />
      </Column>
    </Row>
  );
};

export default observer(ChannelRow);
