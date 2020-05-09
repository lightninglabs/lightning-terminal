import React from 'react';
import { observer } from 'mobx-react-lite';
import { SwapDirection } from 'types/state';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Channel } from 'store/models';
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

interface Props {
  channels: Channel[];
  direction: SwapDirection;
  onLoopClick: () => void;
  onDirectionClick: (direction: SwapDirection) => void;
  onCancelClick: () => void;
}

const LoopActions: React.FC<Props> = ({
  channels,
  direction,
  onLoopClick,
  onDirectionClick,
  onCancelClick,
}) => {
  const { l } = usePrefixedTranslation('cmps.loop.LoopActions');
  const { buildSwapStore } = useStore();

  const { Wrapper, Actions, CloseIcon, Selected } = Styled;
  return (
    <Wrapper>
      {buildSwapStore.showActions ? (
        <Actions>
          <CloseIcon onClick={onCancelClick} />
          <Pill>{channels.length}</Pill>
          <Selected>{l('channelsSelected')}</Selected>
          <Button
            primary={direction === SwapDirection.OUT}
            borderless={direction !== SwapDirection.OUT}
            onClick={() => onDirectionClick(SwapDirection.OUT)}
            disabled={channels.length === 0}
          >
            Loop out
          </Button>
          <Button
            primary={direction === SwapDirection.IN}
            borderless={direction !== SwapDirection.IN}
            onClick={() => onDirectionClick(SwapDirection.IN)}
            disabled={channels.length === 0}
          >
            Loop in
          </Button>
        </Actions>
      ) : (
        <Button onClick={onLoopClick}>
          <Refresh />
          Loop
        </Button>
      )}
    </Wrapper>
  );
};

export default observer(LoopActions);
