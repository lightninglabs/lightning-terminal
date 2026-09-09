import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { HeaderFour, Jumbo, Small } from 'components/base';
import { Bitcoin, Bolt } from './base';
import Tip from './common/Tip';
import Unit from './common/Unit';

const Styled = {
  Wrapper: styled.div`
    line-height: 32px;
    /* preserve the spacing above the nav menu that the divider used to provide */
    padding-bottom: 40px;
  `,
  Balance: styled.span`
    display: flex;
    align-items: center;
  `,
};

const NodeStatus: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.NodeStatus');
  const { nodeStore } = useStore();

  const { Wrapper, Balance } = Styled;
  return (
    <Wrapper data-tour="node-status">
      <HeaderFour>{l('title')}</HeaderFour>
      <Tip overlay={l('offchainTip')}>
        <Jumbo>
          <Balance>
            <Bolt title="bolt" size="small" />
            <Unit sats={nodeStore.wallet.channelBalance} />
          </Balance>
        </Jumbo>
      </Tip>
      <Tip overlay={l('onchainTip')}>
        <Small>
          <Balance>
            <Bitcoin title="bitcoin" size="small" />
            <Unit sats={nodeStore.wallet.walletBalance} suffix={false} />
          </Balance>
        </Small>
      </Tip>
    </Wrapper>
  );
};

export default observer(NodeStatus);
