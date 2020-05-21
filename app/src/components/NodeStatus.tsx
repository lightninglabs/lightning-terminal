import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { HeaderFour, Jumbo, Small } from 'components/common/text';
import { Bitcoin, Bolt } from './common/icons';
import Unit from './common/Unit';
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
  const { l } = usePrefixedTranslation('cmps.NodeStatus');
  const { nodeStore } = useStore();

  const { Wrapper, BoltIcon, BitcoinIcon, Divider } = Styled;
  return (
    <Wrapper>
      <HeaderFour>{l('title')}</HeaderFour>
      <Jumbo>
        <BoltIcon title="bolt" />
        <Unit sats={nodeStore.wallet.channelBalance} />
      </Jumbo>
      <Small>
        <BitcoinIcon title="bitcoin" />
        <Unit sats={nodeStore.wallet.walletBalance} suffix={false} />
      </Small>
      <Divider />
    </Wrapper>
  );
};

export default observer(NodeStatus);
