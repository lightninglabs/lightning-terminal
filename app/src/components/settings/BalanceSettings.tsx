import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { BalanceMode } from 'util/constants';
import { useStore } from 'store';
import { HeaderFour } from 'components/base';
import PageHeader from 'components/common/PageHeader';
import SettingItem from './SettingItem';

const Styled = {
  Wrapper: styled.section``,
  Content: styled.div`
    margin: 100px auto;
    max-width: 500px;
  `,
};

const BalanceModeItem: React.FC<{ mode: BalanceMode }> = observer(({ mode }) => {
  const { l } = usePrefixedTranslation('enums.BalanceMode');
  const { settingsStore } = useStore();

  const handleClick = useCallback(() => {
    settingsStore.setBalanceMode(mode);
  }, [mode, settingsStore]);

  return (
    <SettingItem
      name={l(mode)}
      icon="radio"
      checked={settingsStore.balanceMode === mode}
      onClick={handleClick}
    />
  );
});

const BalanceSettings: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.settings.BalanceSettings');
  const { appView } = useStore();

  const handleBack = useCallback(() => appView.showSettings(''), [appView]);

  const { Wrapper, Content } = Styled;
  return (
    <Wrapper>
      <PageHeader
        title={l('pageTitle')}
        backText={l('backText')}
        onBackClick={handleBack}
      />
      <Content>
        <HeaderFour>{l('title')}</HeaderFour>
        <BalanceModeItem mode={BalanceMode.receive} />
        <BalanceModeItem mode={BalanceMode.send} />
        <BalanceModeItem mode={BalanceMode.routing} />
      </Content>
    </Wrapper>
  );
};

export default observer(BalanceSettings);
