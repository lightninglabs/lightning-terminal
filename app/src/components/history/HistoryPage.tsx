import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { PageTitle } from 'components/common/text';
import { styled } from 'components/theme';
import HistoryList from './HistoryList';

const Styled = {
  Wrapper: styled.div`
    padding: 40px 0;
  `,
};

const HistoryPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.history.HistoryPage');

  const { Wrapper } = Styled;
  return (
    <Wrapper>
      <PageTitle>{l('pageTitle')}</PageTitle>
      <HistoryList />
    </Wrapper>
  );
};

export default observer(HistoryPage);
