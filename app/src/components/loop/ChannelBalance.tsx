import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { statusToColor } from 'util/balances';
import { BalanceStatus } from 'util/constants';
import { Channel } from 'store/models';

const Styled = {
  Wrapper: styled.div<{ pct: number; status: BalanceStatus; active: boolean }>`
    display: flex;
    width: 100%;
    padding: 0 5%;

    > div {
      min-width: 6px;

      &:first-of-type {
        flex-grow: 1;
        background-color: ${props =>
          statusToColor(props.status, props.active, props.theme)};
      }

      &:last-of-type {
        width: ${props => props.pct}%;
        background-color: ${props =>
          statusToColor(props.status, props.active, props.theme)};
      }
    }
  `,
  Section: styled.div`
    height: 4px;
    border-radius: 2px;
  `,
  Gap: styled.div`
    width: 10px;
    background-color: transparent;
  `,
};

interface Props {
  channel: Channel;
  className?: string;
}

const ChannelBalance: React.FC<Props> = ({ channel, className }) => {
  const { Wrapper, Section, Gap } = Styled;
  return (
    <Wrapper
      pct={channel.localPercent}
      status={channel.balanceStatus}
      active={channel.active}
      className={className}
    >
      <Section />
      <Gap />
      <Section />
    </Wrapper>
  );
};

export default observer(ChannelBalance);
