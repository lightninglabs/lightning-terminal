import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { SmallText, Title, XLargeText } from 'components/common/text';
import { Bitcoin, Bolt } from './common/icons';
import { styled } from './theme';

const Styled = {
  Wrapper: styled.div`
    line-height: 32px;
  `,
  Divider: styled.div`
    height: 2px;
    background-color: ${props => props.theme.colors.gray};
    margin: 20px 0;
    opacity: 0.5;
  `,
  StatusTitle: styled(Title)`
    margin-bottom: 10px;
  `,
  BoltIcon: styled(Bolt)`
    width: 10px;
    height: 10px;
    margin-right: 5px;
  `,
  BitcoinIcon: styled(Bitcoin)`
    width: 10px;
    height: 10px;
    margin-right: 5px;
  `,
};

const NodeStatus: React.FC = () => {
  const { Wrapper, StatusTitle, BoltIcon, BitcoinIcon, Divider } = Styled;

  const { l } = usePrefixedTranslation('cmps.NodeStatus');

  const store = useStore();
  const { channelBalance, walletBalance } = store.balances || {
    channelBalance: 0,
    walletBalance: 0,
  };

  return (
    <Wrapper>
      <StatusTitle>{l('title')}</StatusTitle>
      <XLargeText block>
        <BoltIcon title="bolt" />
        {channelBalance.toLocaleString()} SAT
      </XLargeText>
      <SmallText block>
        <BitcoinIcon title="bitcoin" />
        {walletBalance.toLocaleString()}
      </SmallText>
      <Divider />
    </Wrapper>
  );
};

export default observer(NodeStatus);
