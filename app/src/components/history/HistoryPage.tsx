import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import PageHeader from 'components/common/PageHeader';
import SubServerRequired from 'components/common/SubServerRequired';
import HistoryList from './HistoryList';

const Styled = {
  Wrapper: styled.div`
    padding: 40px 0;
  `,
};

const HistoryPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.history.HistoryPage');
  const { swapStore, subServerStore } = useStore();

  const { Wrapper } = Styled;
  return (
    <SubServerRequired status={subServerStore.subServers.loop}>
      <Wrapper>
        <PageHeader title={l('pageTitle')} onExportClick={swapStore.exportSwaps} />
        <HistoryList />
      </Wrapper>
    </SubServerRequired>
  );
};

export default observer(HistoryPage);
