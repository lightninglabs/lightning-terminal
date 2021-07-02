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
  `,
  Balance: styled.span`
    display: flex;
    align-items: center;
  `,
  Divider: styled.div`
    height: 2px;
    background-color: ${props => props.theme.colors.darkGray};
    margin: 20px 0;
    opacity: 0.5;
  `,
};

const NodeStatus: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.NodeStatus');
  const { nodeStore } = useStore();

  const { Wrapper, Balance, Divider } = Styled;
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
      <Divider />
    </Wrapper>
  );
};

export default observer(NodeStatus);
