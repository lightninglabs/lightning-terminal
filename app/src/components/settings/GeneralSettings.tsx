import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { formatUnit } from 'util/formatters';
import { useStore } from 'store';
import PageHeader from 'components/common/PageHeader';
import { Title } from 'components/common/text';
import { styled } from 'components/theme';
import SettingItem from './SettingItem';

const Styled = {
  Wrapper: styled.section``,
  Content: styled.div`
    margin: 100px 50px;
  `,
};

const GeneralSettings: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.settings.GeneralSettings');
  const { uiStore, settingsStore } = useStore();

  const handleUnitClick = useCallback(() => uiStore.showSettings('unit'), [uiStore]);
  const handleColorsClick = useCallback(() => uiStore.showSettings('colors'), [uiStore]);

  const { Wrapper, Content } = Styled;
  return (
    <Wrapper>
      <PageHeader title={l('pageTitle')} />
      <Content>
        <Title>{l('title')}</Title>
        <SettingItem
          name={l('bitcoinUnit')}
          value={formatUnit(settingsStore.unit)}
          onClick={handleUnitClick}
          arrow
        />
        <SettingItem
          name={l('balances')}
          value="Receive Optimized"
          onClick={handleColorsClick}
          arrow
        />
      </Content>
    </Wrapper>
  );
};

export default observer(GeneralSettings);
