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
  swapType: string;
  onLoopClick: () => void;
  onTypeClick: (swapType: string) => void;
  onCancelClick: () => void;
}

const LoopActions: React.FC<Props> = ({
  channels,
  swapType,
  onLoopClick,
  onTypeClick,
  onCancelClick,
}) => {
  const { l } = usePrefixedTranslation('cmps.loop.LoopActions');
  const [showTypes, setShowTypes] = useState(false);

  const handleLoopClick = () => {
    setShowTypes(true);
    onLoopClick();
  };

  const handleTypeClick = (type: string) => {
    setShowTypes(false);
    onTypeClick(type);
  };

  const handleCancelClick = () => {
    onCancelClick();
    setShowTypes(false);
  };

  const { Wrapper, Actions, CloseIcon, Selected } = Styled;
  return (
    <Wrapper>
      {showTypes ? (
        <Actions>
          <CloseIcon onClick={handleCancelClick} />
          <Pill>{channels.length}</Pill>
          <Selected>{l('channelsSelected')}</Selected>
          <Button
            primary={swapType === 'Loop Out'}
            borderless={swapType !== 'Loop Out'}
            onClick={() => handleTypeClick('Loop Out')}
            disabled={channels.length === 0}
          >
            Loop out
          </Button>
          <Button
            primary={swapType === 'Loop In'}
            borderless={swapType !== 'Loop In'}
            onClick={() => handleTypeClick('Loop In')}
            disabled={channels.length === 0}
          >
            Loop in
          </Button>
        </Actions>
      ) : (
        <Button onClick={handleLoopClick}>
          <Refresh />
          Loop
        </Button>
      )}
    </Wrapper>
  );
};

export default LoopActions;
