import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { SwapDirection } from 'types/state';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { formatSats } from 'util/formatters';
import { useStore } from 'store';
import { Button, Close, CloudLightning, Refresh } from 'components/base';
import SelectedChannels from './SelectedChannels';

const Styled = {
  Wrapper: styled.section`
    margin: 20px 0 8px;
  `,
  Actions: styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
  `,
  ActionBar: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background-color: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;

    > button {
      margin-left: 0;
    }
  `,
  CloseIcon: styled(Close)`
    margin-right: 25px;
  `,
  Selected: styled(SelectedChannels)`
    flex: 1;
  `,
  Note: styled.span`
    display: inline-block;
    margin-left: 20px;
    font-size: ${props => props.theme.sizes.s};
    color: ${props => props.theme.colors.gray};
  `,
  Buttons: styled.span`
    button:last-of-type {
      margin-left: 10px;
    }
  `,
};

const LoopActions: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.LoopActions');
  const { buildSwapView, registerSidecarView } = useStore();
  const {
    setDirection,
    inferredDirection,
    isLoopOutMinimumMet,
    isLoopInMinimumMet,
    hasValidLoopInPeers,
  } = buildSwapView;
  const handleLoopOut = useCallback(() => setDirection(SwapDirection.OUT), [
    setDirection,
  ]);
  const handleLoopIn = useCallback(() => setDirection(SwapDirection.IN), [setDirection]);
  const selectedCount = buildSwapView.selectedChanIds.length;

  let note =
    !isLoopOutMinimumMet || !isLoopInMinimumMet
      ? l('loopMinimumNote', { min: formatSats(buildSwapView.termsForDirection.min) })
      : '';
  if (!hasValidLoopInPeers) {
    note = l('loopInNote');
  }

  const { Wrapper, Actions, ActionBar, CloseIcon, Selected, Note, Buttons } = Styled;
  return (
    <Wrapper data-tour="loop-actions">
      {buildSwapView.showActions ? (
        <Actions>
          <ActionBar>
            <CloseIcon onClick={buildSwapView.cancel} />
            <Selected count={selectedCount} />
            <Button
              primary={isLoopOutMinimumMet && inferredDirection === SwapDirection.OUT}
              borderless
              onClick={handleLoopOut}
              disabled={!isLoopOutMinimumMet}
              data-tour="loop-out"
            >
              {l('common.loopOut')}
            </Button>
            <Button
              primary={
                hasValidLoopInPeers &&
                isLoopInMinimumMet &&
                inferredDirection === SwapDirection.IN
              }
              borderless
              onClick={handleLoopIn}
              disabled={!hasValidLoopInPeers || !isLoopInMinimumMet}
            >
              {l('common.loopIn')}
            </Button>
          </ActionBar>
          {note && <Note>{note}</Note>}
        </Actions>
      ) : (
        <Buttons>
          <Button data-tour="loop" onClick={buildSwapView.startSwap}>
            <Refresh />
            {l('common.loop')}
          </Button>
          <Button borderless onClick={registerSidecarView.startRegister}>
            <CloudLightning />
            {l('registerSidecar')}
          </Button>
        </Buttons>
      )}
    </Wrapper>
  );
};

export default observer(LoopActions);
