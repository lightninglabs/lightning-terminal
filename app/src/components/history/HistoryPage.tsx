import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import PageHeader from 'components/common/PageHeader';
import { styled } from 'components/theme';
import HistoryList from './HistoryList';

const Styled = {
  Wrapper: styled.div`
    padding: 40px 0;
  `,
};

const HistoryPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.history.HistoryPage');
  const { uiStore } = useStore();

  const { Wrapper } = Styled;
  return (
    <Wrapper>
      <PageHeader
        title={l('pageTitle')}
        backText={l('backText')}
        onBackClick={uiStore.goToLoop}
        onExportClick={() => alert('TODO: Export CSV of Swaps')}
      />
      <HistoryList />
    </Wrapper>
  );
};

export default observer(HistoryPage);
