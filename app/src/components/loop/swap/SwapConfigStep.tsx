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
  const { buildSwapView, appView } = useStore();
  const [confTarget, setConfTarget] = useState(
    (buildSwapView.confTarget || '').toString(),
  );
  const [destAddress, setDestAddress] = useState(buildSwapView.loopOutAddress || '');

  const handleNext = useCallback(() => {
    try {
      if (buildSwapView.addlOptionsVisible) {
        const target = confTarget !== '' ? parseInt(confTarget) : undefined;
        buildSwapView.setConfTarget(target);
        buildSwapView.setLoopOutAddress(destAddress);
      }
      buildSwapView.goToNextStep();
    } catch (error) {
      appView.handleError(error);
    }
  }, [buildSwapView, confTarget, destAddress, appView]);

  const { Wrapper, Summary, Config, Options, SmallInput } = Styled;
  return (
    <Wrapper data-tour="loop-amount">
      <Summary>
        <StepSummary
          title={l('title')}
          heading={l('heading', { type: buildSwapView.direction })}
          description={
            buildSwapView.direction === SwapDirection.IN
              ? l('loopInDesc')
              : l('loopOutDesc')
          }
        />
      </Summary>
      <Config>
        <Range
          showRadios
          value={buildSwapView.amountForSelected}
          min={buildSwapView.termsForDirection.min}
          max={buildSwapView.termsForDirection.max}
          step={buildSwapView.AMOUNT_INCREMENT}
          onChange={buildSwapView.setAmount}
        />
        <Options visible={buildSwapView.addlOptionsVisible}>
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
          {buildSwapView.direction === SwapDirection.OUT && (
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
          onCancel={buildSwapView.cancel}
          onNext={handleNext}
          extra={
            <Button ghost borderless onClick={buildSwapView.toggleAddlOptions}>
              <Settings />
              {buildSwapView.addlOptionsVisible ? l('hideOptions') : l('addlOptions')}
            </Button>
          }
        />
      </Config>
    </Wrapper>
  );
};

export default observer(SwapConfigStep);
