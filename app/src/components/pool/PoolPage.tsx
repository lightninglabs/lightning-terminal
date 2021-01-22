import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Badge, Column, Row } from 'components/base';
import PageHeader from 'components/common/PageHeader';
import { styled } from 'components/theme';
import AccountSection from './AccountSection';
import BatchSection from './BatchSection';
import OrderFormSection from './OrderFormSection';
import OrderListSection from './OrderListSection';

const Styled = {
  Wrapper: styled.div`
    padding: 40px 0 0;
    height: 100%;
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
      max-width: 300px;
    }
  `,
};

const PoolPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.PoolPage');
  const { accountStore, orderStore, batchStore } = useStore();

  useEffect(() => {
    accountStore.fetchAccounts();
    orderStore.fetchOrders();
    batchStore.fetchNextBatchInfo();
    if (!batchStore.batches.size) {
      // fetch batches if there aren't any in the store
      batchStore.fetchBatches();
    }
    // start polling when this component is mounted
    batchStore.startPolling();
    // stop polling when this component is unmounted
    return () => {
      batchStore.stopPolling();
    };
  }, [accountStore, orderStore, batchStore]);

  const title = (
    <>
      {l('pageTitle')}
      <sup>
        <Badge muted>{l('common.preview')}</Badge>
      </sup>
    </>
  );

  const { Wrapper, Row, Col } = Styled;
  return (
    <Wrapper>
      <PageHeader
        title={title}
        exportTip={l('exportTip')}
        onExportClick={orderStore.exportLeases}
      />
      <Row>
        <Col cols={4} colsXl={3}>
          <AccountSection />
          <OrderFormSection />
        </Col>
        <Col>
          <BatchSection />
          <OrderListSection />
        </Col>
      </Row>
    </Wrapper>
  );
};

export default observer(PoolPage);
