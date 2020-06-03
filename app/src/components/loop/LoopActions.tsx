import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { SwapDirection } from 'types/state';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Button, Close, Pill, Refresh } from 'components/base';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.section`
    margin: 50px 0;
  `,
  Actions: styled.div`
    margin-top: -15px;
  `,
  ActionBar: styled.div`
    display: inline-block;
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
  Selected: styled.span`
    display: inline-block;
    margin-right: 50px;
  `,
  Note: styled.span`
    margin-left: 20px;
    font-size: ${props => props.theme.sizes.s};
    color: ${props => props.theme.colors.gray};
  `,
};

const LoopActions: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.LoopActions');
  const { buildSwapStore } = useStore();
  const { setDirection, inferredDirection } = buildSwapStore;
  const handleLoopOut = useCallback(() => setDirection(SwapDirection.OUT), [
    setDirection,
  ]);
  const handleLoopIn = useCallback(() => setDirection(SwapDirection.IN), [setDirection]);
  const selectedCount = buildSwapStore.selectedChanIds.length;

  const { Wrapper, Actions, ActionBar, CloseIcon, Selected, Note } = Styled;
  return (
    <Wrapper>
      {buildSwapStore.showActions ? (
        <Actions>
          <ActionBar>
            <CloseIcon onClick={buildSwapStore.cancel} />
            <Pill>{selectedCount}</Pill>
            <Selected>{l('channelsSelected')}</Selected>
            <Button
              primary={inferredDirection === SwapDirection.OUT}
              borderless
              onClick={handleLoopOut}
            >
              {l('common.loopOut')}
            </Button>
            <Button
              primary={
                buildSwapStore.loopInAllowed && inferredDirection === SwapDirection.IN
              }
              borderless
              onClick={handleLoopIn}
              disabled={!buildSwapStore.loopInAllowed}
            >
              {l('common.loopIn')}
            </Button>
          </ActionBar>
          {!buildSwapStore.loopInAllowed && <Note>{l('loopInNote')}</Note>}
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
