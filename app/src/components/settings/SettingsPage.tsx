import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import PageHeader from 'components/common/PageHeader';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.div`
    padding: 40px 0;
  `,
};

const HistoryPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.settings.SettingsPage');

  const { Wrapper } = Styled;
  return (
    <Wrapper>
      <PageHeader title={l('pageTitle')} />
    </Wrapper>
  );
};

export default observer(HistoryPage);
