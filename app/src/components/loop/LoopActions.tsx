import React, { useState } from 'react';
import { Channel } from 'types/state';
import { usePrefixedTranslation } from 'hooks';
import { Button, Pill } from 'components/common/base';
import { Close, Refresh } from 'components/common/icons';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.section`
    margin: 50px 0;
  `,
  Actions: styled.div`
    display: inline-block;
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
  swapType: string;
  onLoop: (swapType: string) => void;
}

const LoopActions: React.FC<Props> = ({ channels, swapType, onLoop }) => {
  const { l } = usePrefixedTranslation('cmps.loop.LoopActions');
  const [showTypes, setShowTypes] = useState(false);

  const handleLoopClick = (type: string) => {
    setShowTypes(false);
    onLoop(type);
  };

  const { Wrapper, Actions, CloseIcon, Selected } = Styled;
  return (
    <Wrapper>
      {showTypes ? (
        <Actions>
          <CloseIcon onClick={() => setShowTypes(false)} />
          <Pill>{channels.length}</Pill>
          <Selected>{l('channelsSelected')}</Selected>
          <Button
            primary={swapType === 'Loop Out'}
            borderless={swapType !== 'Loop Out'}
            onClick={() => handleLoopClick('Loop Out')}
          >
            Loop out
          </Button>
          <Button
            primary={swapType === 'Loop In'}
            borderless={swapType !== 'Loop In'}
            onClick={() => handleLoopClick('Loop In')}
          >
            Loop in
          </Button>
        </Actions>
      ) : (
        <Button onClick={() => setShowTypes(true)}>
          <Refresh />
          Loop
        </Button>
      )}
    </Wrapper>
  );
};

export default LoopActions;
