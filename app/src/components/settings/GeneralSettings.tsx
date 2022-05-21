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
import { Layout } from 'components/layout';
import { useNavigate } from 'react-router-dom';

const Styled = {
  Wrapper: styled.section``,
  Content: styled.div`
    margin: 100px 50px;
  `,
};

const GeneralSettings: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.settings.GeneralSettings');
  const { appView, log, nodeStore, settingsStore } = useStore();
  const navigate = useNavigate();
  const navigateTo = (path: string) => {
    log.info('Switch to Setting screen', path);
    navigate(`/settings/${path}`);
  };

  const handleUnit = useCallback(() => navigateTo('unit'), [appView]);
  const handleBalance = useCallback(() => navigateTo('balance'), [appView]);
  const handleExplorers = useCallback(() => navigateTo('explorers'), [appView]);
  const handleCopyPubkey = useCallback(() => nodeStore.copy('pubkey'), [nodeStore]);
  const handleCopyAlias = useCallback(() => nodeStore.copy('alias'), [nodeStore]);
  const handleCopyUrl = useCallback(() => nodeStore.copy('url'), [nodeStore]);

  const { Wrapper, Content } = Styled;
  return (
    <Layout>
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
    </Layout>
  );
};

export default observer(GeneralSettings);
