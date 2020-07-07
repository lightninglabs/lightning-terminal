import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { SwapDirection } from 'types/state';
import { usePrefixedTranslation } from 'hooks';
import { formatSats } from 'util/formatters';
import { useStore } from 'store';
import { Button, Close, Refresh } from 'components/base';
import { styled } from 'components/theme';
import SelectedChannels from './SelectedChannels';

const Styled = {
  Wrapper: styled.section`
    margin: 50px 0;
  `,
  Actions: styled.div`
    display: flex;
    align-items: center;
    margin-top: -15px;
  `,
  ActionBar: styled.div`
    display: flex;
    align-items: center;
    min-width: 595px;
    padding: 15px;
    background-color: ${props => props.theme.colors.darkBlue};
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.5);
    border-radius: 35px;

    > button {
      margin-left: 10px;
      background-color: ${props => props.theme.colors.overlay};
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
};

const LoopActions: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.LoopActions');
  const { buildSwapStore } = useStore();
  const {
    setDirection,
    inferredDirection,
    isLoopOutMinimumMet,
    isLoopInMinimumMet,
    hasValidLoopInPeers,
  } = buildSwapStore;
  const handleLoopOut = useCallback(() => setDirection(SwapDirection.OUT), [
    setDirection,
  ]);
  const handleLoopIn = useCallback(() => setDirection(SwapDirection.IN), [setDirection]);
  const selectedCount = buildSwapStore.selectedChanIds.length;

  let note =
    !isLoopOutMinimumMet || !isLoopInMinimumMet
      ? l('loopMinimumNote', { min: formatSats(buildSwapStore.termsForDirection.min) })
      : '';
  if (!hasValidLoopInPeers) {
    note = l('loopInNote');
  }

  const { Wrapper, Actions, ActionBar, CloseIcon, Selected, Note } = Styled;
  return (
    <Wrapper>
      {buildSwapStore.showActions ? (
        <Actions>
          <ActionBar>
            <CloseIcon onClick={buildSwapStore.cancel} />
            <Selected count={selectedCount} />
            <Button
              primary={isLoopOutMinimumMet && inferredDirection === SwapDirection.OUT}
              borderless
              onClick={handleLoopOut}
              disabled={!isLoopOutMinimumMet}
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
        <Button onClick={buildSwapStore.startSwap}>
          <Refresh />
          {l('common.loop')}
        </Button>
      )}
    </Wrapper>
  );
};

export default observer(LoopActions);
