import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Column, Row } from 'components/base';
import PageHeader from 'components/common/PageHeader';
import { styled } from 'components/theme';
import AccountSection from './AccountSection';
import ChartSection from './ChartSection';
import DetailsSection from './DetailsSection';
import OrderFormSection from './OrderFormSection';

const Styled = {
  Wrapper: styled.div`
    padding: 40px 0 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  `,
  Row: styled(Row)`
    flex: 1;
    margin-top: 10px;
  `,
  Col: styled(Column)`
    display: flex;
    flex-direction: column;
    padding: 0;

    &:first-of-type {
      max-width: 400px;
    }
  `,
};

const PoolPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.PoolPage');
  const { accountStore, orderStore } = useStore();

  useEffect(() => {
    accountStore.fetchAccounts();
    orderStore.fetchOrders();
  }, [accountStore, orderStore]);

  const { Wrapper, Row, Col } = Styled;
  return (
    <Wrapper>
      <PageHeader title={l('pageTitle')} />
      {accountStore.activeTraderKey && (
        <Row>
          <Col cols={4} colsXl={3}>
            <AccountSection />
            <OrderFormSection />
          </Col>
          <Col>
            <ChartSection />
            <DetailsSection />
          </Col>
        </Row>
      )}
    </Wrapper>
  );
};

export default observer(PoolPage);
