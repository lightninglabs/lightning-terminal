import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { formatUnit } from 'util/formatters';
import { extractDomain } from 'util/strings';
import { useStore } from 'store';
import { HeaderFour } from 'components/base';
import PageHeader from 'components/common/PageHeader';
import SettingItem from './SettingItem';

const Styled = {
  Wrapper: styled.section``,
  Content: styled.div`
    margin: 100px 50px;
  `,
};

const GeneralSettings: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.settings.GeneralSettings');
  const { appView, settingsStore, nodeStore } = useStore();

  const handleUnit = useCallback(() => appView.showSettings('unit'), [appView]);
  const handleBalance = useCallback(() => appView.showSettings('balance'), [appView]);
  const handleExplorers = useCallback(() => appView.showSettings('explorers'), [appView]);
  const handleCopyPubkey = useCallback(() => nodeStore.copy('pubkey'), [nodeStore]);
  const handleCopyAlias = useCallback(() => nodeStore.copy('alias'), [nodeStore]);
  const handleCopyUrl = useCallback(() => nodeStore.copy('url'), [nodeStore]);

  const { Wrapper, Content } = Styled;
  return (
    <Wrapper>
      <PageHeader title={l('pageTitle')} />
      <Content>
        <HeaderFour>{l('general')}</HeaderFour>
        <SettingItem
          name={l('bitcoinUnit')}
          value={formatUnit(settingsStore.unit)}
          onClick={handleUnit}
          icon="arrow"
        />
        <SettingItem
          name={l('balances')}
          value={l('balancesValue', {
            mode: l(`enums.BalanceMode.${settingsStore.balanceMode}`),
          })}
          onClick={handleBalance}
          icon="arrow"
        />
      </Content>
      <Content>
        <HeaderFour>{l('explorers')}</HeaderFour>
        <SettingItem
          name={l('bitcoinTx')}
          value={extractDomain(settingsStore.bitcoinTxUrl)}
          onClick={handleExplorers}
          icon="arrow"
        />
        <SettingItem
          name={l('lightningNode')}
          value={extractDomain(settingsStore.lnNodeUrl)}
          onClick={handleExplorers}
          icon="arrow"
        />
      </Content>
      <Content>
        <HeaderFour>{l('myNode')}</HeaderFour>
        <SettingItem
          name={l('pubkey')}
          value={nodeStore.pubkeyLabel}
          onClick={handleCopyPubkey}
          icon="copy"
        />
        <SettingItem
          name={l('alias')}
          value={nodeStore.alias}
          onClick={handleCopyAlias}
          icon="copy"
        />
        {nodeStore.urlLabel && (
          <SettingItem
            name={l('url')}
            value={nodeStore.urlLabel}
            onClick={handleCopyUrl}
            icon="copy"
          />
        )}
      </Content>
    </Wrapper>
  );
};

export default observer(GeneralSettings);
