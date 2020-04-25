import React, { CSSProperties } from 'react';
import { Channel } from 'types/state';
import { Column, Row } from 'components/common/grid';
import { Dot } from 'components/common/icons';
import { Title } from 'components/common/text';
import { styled } from 'components/theme';

/**
 * the virtualized list requires each row to have a specified
 * height. Defining a const here because it is used in multiple places
 */
export const ROW_HEIGHT = 60;

const Styled = {
  Row: styled(Row)`
    border-bottom: 0.5px solid ${props => props.theme.colors.darkGray};

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
  Balance: styled.div`
    margin-top: ${ROW_HEIGHT / 2 - 2}px;
    height: 4px;
    width: 100%;
    background-color: ${props => props.theme.colors.pink};
    border-radius: 2px;
  `,
};

interface Props {
  channel: Channel;
  style: CSSProperties;
}

export const ChannelRowHeader: React.FC = () => (
  <Row>
    <Column right>
      <Title>Can Receive</Title>
    </Column>
    <Column cols={3}></Column>
    <Column>
      <Title>Can Send</Title>
    </Column>
    <Column>
      <Title>Up Time %</Title>
    </Column>
    <Column>
      <Title>Peer/Alias</Title>
    </Column>
    <Column right>
      <Title>Capacity</Title>
    </Column>
  </Row>
);

const ChannelRow: React.FC<Props> = ({ channel, style }) => {
  const { Row, Column, StatusIcon, Balance } = Styled;
  return (
    <Row style={style}>
      <Column right>
        <StatusIcon>
          <Dot />
        </StatusIcon>
        {channel.localBalance.toLocaleString()}
      </Column>
      <Column cols={3}>
        <Balance />
      </Column>
      <Column>{channel.remoteBalance.toLocaleString()}</Column>
      <Column>{channel.uptime}</Column>
      <Column>{channel.remotePubkey}</Column>
      <Column right>{channel.capacity.toLocaleString()}</Column>
    </Row>
  );
};

export default ChannelRow;
