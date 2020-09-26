import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { HeaderFour } from 'components/base';
import Tip from 'components/common/Tip';
import Unit from 'components/common/Unit';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.section`
    flex: 1;
    min-height: 325px;
    padding: 15px;
    margin: 15px 0;
    background-color: ${props => props.theme.colors.overlay};
    border-radius: 4px;
  `,
  Stat: styled.div`
    font-size: ${props => props.theme.sizes.xl};
    line-height: 37px;
    letter-spacing: 0.43px;
    margin: 10px 0;
  `,
};

const AccountSection: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.AccountSection');
  const { accountStore, orderStore } = useStore();

  const { Wrapper, Stat } = Styled;
  return (
    <Wrapper>
      <HeaderFour>{l('account')}</HeaderFour>
      <Stat>
        <Tip
          overlay={accountStore.activeAccount.traderKey}
          placement="right"
          capitalize={false}
        >
          <span>{accountStore.activeAccount.traderKeyEllipsed}</span>
        </Tip>
      </Stat>
      <HeaderFour>{l('total')}</HeaderFour>
      <Stat>
        <Unit sats={accountStore.activeAccount.totalBalance} />
      </Stat>
      <HeaderFour>{l('avail')}</HeaderFour>
      <Stat>
        <Unit sats={accountStore.activeAccount.availableBalance} />
      </Stat>
      <HeaderFour>{l('pending', { count: orderStore.pendingOrdersCount })}</HeaderFour>
      <Stat>
        <Unit sats={orderStore.pendingOrdersAmount} />
      </Stat>
    </Wrapper>
  );
};

export default observer(AccountSection);
