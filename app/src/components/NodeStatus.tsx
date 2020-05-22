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
};

const NodeStatus: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.NodeStatus');
  const { nodeStore } = useStore();

  const { Wrapper, Divider } = Styled;
  return (
    <Wrapper>
      <HeaderFour>{l('title')}</HeaderFour>
      <Jumbo>
        <Bolt title="bolt" size="small" />
        <Unit sats={nodeStore.wallet.channelBalance} />
      </Jumbo>
      <Small>
        <Bitcoin title="bitcoin" size="small" />
        <Unit sats={nodeStore.wallet.walletBalance} suffix={false} />
      </Small>
      <Divider />
    </Wrapper>
  );
};

export default observer(NodeStatus);
