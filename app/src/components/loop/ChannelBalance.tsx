import React from 'react';
import { observer } from 'mobx-react-lite';
import { BalanceLevel } from 'types/state';
import { Channel } from 'store/models';
import { levelToColor, styled } from 'components/theme';

const Styled = {
  Wrapper: styled.div<{ pct: number; level: BalanceLevel; active: boolean }>`
    display: flex;
    width: 100%;

    > div {
      min-width: 10px;

      &:first-of-type {
        flex-grow: 1;
        background-color: ${props =>
          levelToColor(props.level, props.active, props.theme)};
      }

      &:last-of-type {
        width: ${props => props.pct}%;
        background-color: ${props =>
          levelToColor(props.level, props.active, props.theme)};
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
      level={channel.balanceLevel}
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
