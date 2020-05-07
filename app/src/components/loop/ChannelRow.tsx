import React, { CSSProperties } from 'react';
import { BalanceLevel, Channel } from 'types/state';
import { usePrefixedTranslation } from 'hooks';
import { ellipseInside } from 'util/strings';
import Checkbox from 'components/common/Checkbox';
import { Column, Row } from 'components/common/grid';
import StatusDot from 'components/common/StatusDot';
import { Title } from 'components/common/text';
import { styled } from 'components/theme';
import ChannelBalance from './ChannelBalance';

/**
 * the virtualized list requires each row to have a specified
 * height. Defining a const here because it is used in multiple places
 */
export const ROW_HEIGHT = 60;

const Styled = {
  Row: styled(Row)<{ dimmed?: boolean }>`
    border-bottom: 0.5px solid ${props => props.theme.colors.darkGray};
    opacity: ${props => (props.dimmed ? '0.4' : '1')};

    &:last-child {
      border-bottom-width: 0;
    }
  `,
  Column: styled(Column)<{ last?: boolean }>`
    overflow: hidden;
    text-overflow: ellipsis;
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
    margin-left: 15px;
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
        <Title>{l('canReceive')}</Title>
      </Column>
      <Column cols={3}></Column>
      <Column>
        <Title>{l('canSend')}</Title>
      </Column>
      <Column>
        <Title>{l('upTime')}</Title>
      </Column>
      <Column>
        <Title>{l('peer')}</Title>
      </Column>
      <Column right>
        <Title>{l('capacity')}</Title>
      </Column>
    </Row>
  );
};

const ChannelDot: React.FC<{ channel: Channel }> = ({ channel }) => {
  if (!channel.active) return <StatusDot status="idle" />;

  switch (channel.balanceLevel) {
    case BalanceLevel.good:
      return <StatusDot status="success" />;
    case BalanceLevel.warn:
      return <StatusDot status="warn" />;
    case BalanceLevel.bad:
      return <StatusDot status="error" />;
  }
};

interface Props {
  channel: Channel;
  editable?: boolean;
  checked?: boolean;
  onChange: (channel: Channel, checked: boolean) => void;
  disabled?: boolean;
  dimmed?: boolean;
  style?: CSSProperties;
}

const ChannelRow: React.FC<Props> = ({
  channel,
  editable,
  checked,
  onChange,
  disabled,
  dimmed,
  style,
}) => {
  const { Row, Column, StatusIcon, Check, Balance } = Styled;
  return (
    <Row dimmed={dimmed} style={style}>
      <Column right>
        {editable ? (
          <Check
            checked={checked}
            disabled={disabled}
            onChange={checked => onChange(channel, checked)}
          />
        ) : (
          <StatusIcon>
            <ChannelDot channel={channel} />
          </StatusIcon>
        )}
        {channel.remoteBalance.toLocaleString()}
      </Column>
      <Column cols={3}>
        <Balance channel={channel} />
      </Column>
      <Column>{channel.localBalance.toLocaleString()}</Column>
      <Column>{channel.uptime}</Column>
      <Column>{ellipseInside(channel.remotePubkey)}</Column>
      <Column right>{channel.capacity.toLocaleString()}</Column>
    </Row>
  );
};

export default ChannelRow;
