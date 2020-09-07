import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { SwapDirection } from 'types/state';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Button, HeaderFour, HelpCircle, Input, Settings } from 'components/base';
import Range from 'components/common/Range';
import Tip from 'components/common/Tip';
import StepButtons from './StepButtons';
import StepSummary from './StepSummary';

const Styled = {
  Wrapper: styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    padding-top: 5px;
  `,
  Summary: styled.div`
    flex-grow: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,
  Config: styled.div`
    flex-grow: 3;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,
  Options: styled.div<{ visible: boolean }>`
    padding: ${props => (props.visible ? '30px 0' : '0')};
    margin: 30px 0;
    background-color: #27273c;
    box-shadow: inset rgba(0, 0, 0, 0.5) 0px 0px 5px 0px;
    border-radius: 15px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    height: ${props => (props.visible ? '125px' : '0')};
    transition: all 0.3s;

    > div {
      flex: 1;
      margin: 0 30px;
    }
  `,
  SmallInput: styled(Input)`
    width: 100%;
    font-size: ${props => props.theme.sizes.s};
    text-align: left;
    border-bottom-width: 1px;
  `,
};

const SwapConfigStep: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.swap.SwapConfigStep');
  const { buildSwapStore, uiStore } = useStore();
  const [confTarget, setConfTarget] = useState(
    (buildSwapStore.confTarget || '').toString(),
  );
  const [destAddress, setDestAddress] = useState(buildSwapStore.loopOutAddress || '');

  const handleNext = useCallback(() => {
    try {
      if (buildSwapStore.addlOptionsVisible) {
        const target = confTarget !== '' ? parseInt(confTarget) : undefined;
        buildSwapStore.setConfTarget(target);
        buildSwapStore.setLoopOutAddress(destAddress);
      }
      buildSwapStore.goToNextStep();
    } catch (error) {
      uiStore.handleError(error);
    }
  }, [buildSwapStore, confTarget, destAddress, uiStore]);

  const { Wrapper, Summary, Config, Options, SmallInput } = Styled;
  return (
    <Wrapper data-tour="loop-amount">
      <Summary>
        <StepSummary
          title={l('title')}
          heading={l('heading', { type: buildSwapStore.direction })}
          description={
            buildSwapStore.direction === SwapDirection.IN
              ? l('loopInDesc')
              : l('loopOutDesc')
          }
        />
      </Summary>
      <Config>
        <Range
          showRadios
          value={buildSwapStore.amountForSelected}
          min={buildSwapStore.termsForDirection.min}
          max={buildSwapStore.termsForDirection.max}
          step={buildSwapStore.AMOUNT_INCREMENT}
          onChange={buildSwapStore.setAmount}
        />
        <Options visible={buildSwapStore.addlOptionsVisible}>
          <div>
            <HeaderFour>
              {l('confTargetLabel')}
              <Tip overlay={l('confTargetTip')} capitalize={false} maxWidth={400}>
                <HelpCircle />
              </Tip>
            </HeaderFour>
            <SmallInput
              placeholder={l('confTargetHint')}
              value={confTarget}
              onChange={e => setConfTarget(e.target.value)}
            />
          </div>
          {buildSwapStore.direction === SwapDirection.OUT && (
            <div>
              <HeaderFour>
                {l('destAddrLabel')}
                <Tip overlay={l('destAddrTip')} capitalize={false} maxWidth={400}>
                  <HelpCircle />
                </Tip>
              </HeaderFour>
              <SmallInput
                placeholder={l('destAddrHint')}
                value={destAddress}
                onChange={e => setDestAddress(e.target.value)}
              />
            </div>
          )}
        </Options>
        <StepButtons
          onCancel={buildSwapStore.cancel}
          onNext={handleNext}
          extra={
            <Button ghost borderless onClick={buildSwapStore.toggleAddlOptions}>
              <Settings />
              {buildSwapStore.addlOptionsVisible ? l('hideOptions') : l('addlOptions')}
            </Button>
          }
        />
      </Config>
    </Wrapper>
  );
};

export default observer(SwapConfigStep);
