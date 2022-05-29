import React, { useCallback, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { BitcoinExplorerPresets, LightningExplorerPresets } from 'util/constants';
import { useStore } from 'store';
import { Button } from 'components/base';
import FormField from 'components/common/FormField';
import FormInput from 'components/common/FormInput';
import PageHeader from 'components/common/PageHeader';

const Styled = {
  Wrapper: styled.section``,
  Content: styled.div`
    margin: 100px auto;
    max-width: 800px;
  `,
  Actions: styled.div`
    text-align: center;
  `,
  Field: styled.div`
    margin-bottom: 60px;
  `,
  FormInput: styled(FormInput)`
    font-family: ${props => props.theme.fonts.open.regular};
    font-size: ${props => props.theme.sizes.m};

    input {
      padding: 10px 40px 10px 10px;
    }
  `,
  Info: styled.div`
    display: flex;
    justify-content: space-between;
  `,
};

const ExplorerField: React.FC<{
  label: string;
  value: string;
  info: string;
  error?: string;
  presets: Record<string, string>;
  onChange: (value: string) => void;
}> = observer(({ label, value, info, error, presets, onChange }) => {
  const handleClick = useCallback((url: string) => onChange(url), [onChange]);

  const { Field, FormInput, Info } = Styled;
  const infoCmp = (
    <Info>
      <span>{info}</span>
      <span>
        {Object.entries(presets).map(([text, url]) => (
          <Button key={text} ghost borderless compact onClick={() => handleClick(url)}>
            {text}
          </Button>
        ))}
      </span>
    </Info>
  );

  return (
    <Field>
      <FormField label={label} error={error} info={infoCmp}>
        <FormInput label={label} value={value} onChange={onChange} />
      </FormField>
    </Field>
  );
});

const ExplorerSettings: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.settings.ExplorerSettings');
  const { appView, settingsStore } = useStore();

  const [bitcoinTx, setBitcoinTx] = useState(settingsStore.bitcoinTxUrl);
  const [lnNode, setLnNode] = useState(settingsStore.lnNodeUrl);

  const bitcoinTxError = useMemo(
    () => settingsStore.validateExplorerUrl(bitcoinTx, '{txid}'),
    [bitcoinTx],
  );
  const lnNodeError = useMemo(
    () => settingsStore.validateExplorerUrl(lnNode, '{pubkey}'),
    [lnNode],
  );

  const canSave =
    bitcoinTxError === '' &&
    lnNodeError === '' &&
    (bitcoinTx !== settingsStore.bitcoinTxUrl || lnNode !== settingsStore.lnNodeUrl);

  const handleBack = useCallback(() => appView.showSettings(''), [appView]);
  const handleSave = useCallback(() => settingsStore.setExplorerUrls(bitcoinTx, lnNode), [
    bitcoinTx,
    lnNode,
  ]);

  const { Wrapper, Content, Actions } = Styled;
  return (
    <Wrapper>
      <PageHeader
        title={l('pageTitle')}
        backText={l('backText')}
        onBackClick={handleBack}
      />
      <Content>
        <ExplorerField
          label={l('bitcoinTxUrl')}
          value={bitcoinTx}
          info={l('bitcoinTxInfo')}
          error={bitcoinTxError}
          presets={BitcoinExplorerPresets}
          onChange={setBitcoinTx}
        />
        <ExplorerField
          label={l('lnNodeUrl')}
          value={lnNode}
          info={l('lnNodeInfo')}
          error={lnNodeError}
          presets={LightningExplorerPresets}
          onChange={setLnNode}
        />
        <Actions>
          <Button primary disabled={!canSave} onClick={handleSave}>
            {l('save')}
          </Button>
        </Actions>
      </Content>
    </Wrapper>
  );
};

export default observer(ExplorerSettings);
