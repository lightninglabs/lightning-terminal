import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { Unit } from 'util/constants';
import { formatUnit } from 'util/formatters';
import { useStore } from 'store';
import PageHeader from 'components/common/PageHeader';
import SettingItem from './SettingItem';

const Styled = {
  Wrapper: styled.section``,
  Content: styled.div`
    margin: 100px auto;
    max-width: 500px;
  `,
};

const UnitItem: React.FC<{ unit: Unit }> = observer(({ unit }) => {
  const { settingsStore } = useStore();

  const handleClick = useCallback(() => {
    settingsStore.setUnit(unit);
  }, [unit, settingsStore]);

  return (
    <SettingItem
      name={formatUnit(unit)}
      icon="radio"
      checked={settingsStore.unit === unit}
      onClick={handleClick}
    />
  );
});

const UnitSettings: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.settings.UnitSettings');
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
        <UnitItem unit={Unit.sats} />
        <UnitItem unit={Unit.bits} />
        <UnitItem unit={Unit.btc} />
      </Content>
    </Wrapper>
  );
};

export default observer(UnitSettings);
