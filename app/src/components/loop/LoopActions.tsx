import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { SwapDirection } from 'types/state';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Button, Pill } from 'components/common/base';
import { Close, Refresh } from 'components/common/icons';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.section`
    margin: 50px 0;
  `,
  Actions: styled.div`
    display: inline-block;
    margin-top: -15px;
    padding: 15px;
    background-color: ${props => props.theme.colors.darkBlue};
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.5);
    border-radius: 35px;
  `,
  CloseIcon: styled(Close)`
    cursor: pointer;
    width: 16px;
    height: 16px;
    margin-right: 25px;
  `,
  Selected: styled.span`
    display: inline-block;
    margin-right: 50px;
  `,
};

const LoopActions: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.LoopActions');
  const { buildSwapStore } = useStore();
  const handleLoopOut = useCallback(
    () => buildSwapStore.setDirection(SwapDirection.OUT),
    [buildSwapStore],
  );
  const handleLoopIn = useCallback(() => buildSwapStore.setDirection(SwapDirection.IN), [
    buildSwapStore,
  ]);

  const { Wrapper, Actions, CloseIcon, Selected } = Styled;
  return (
    <Wrapper>
      {buildSwapStore.showActions ? (
        <Actions>
          <CloseIcon onClick={buildSwapStore.cancel} />
          <Pill>{buildSwapStore.channels.length}</Pill>
          <Selected>{l('channelsSelected')}</Selected>
          <Button
            primary={buildSwapStore.direction === SwapDirection.OUT}
            borderless={buildSwapStore.direction !== SwapDirection.OUT}
            onClick={handleLoopOut}
            disabled={buildSwapStore.channels.length === 0}
          >
            Loop out
          </Button>
          <Button
            primary={buildSwapStore.direction === SwapDirection.IN}
            borderless={buildSwapStore.direction !== SwapDirection.IN}
            onClick={handleLoopIn}
            disabled={buildSwapStore.channels.length === 0}
          >
            Loop in
          </Button>
        </Actions>
      ) : (
        <Button onClick={buildSwapStore.startSwap}>
          <Refresh />
          Loop
        </Button>
      )}
    </Wrapper>
  );
};

export default observer(LoopActions);
