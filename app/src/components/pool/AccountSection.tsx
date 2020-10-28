import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { HeaderFour, Section } from 'components/base';
import Tip from 'components/common/Tip';
import Unit from 'components/common/Unit';
import { styled } from 'components/theme';

const Styled = {
  Section: styled(Section)`
    flex: 1;
    min-height: 325px;
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

  const { Section, Stat } = Styled;
  return (
    <Section>
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
    </Section>
  );
};

export default observer(AccountSection);
