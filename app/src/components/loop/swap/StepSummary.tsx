import React from 'react';
import { useStore } from 'store';
import { HeaderFive, HeaderFour, Small } from 'components/base';
import { styled } from 'components/theme';
import SelectedChannels from '../SelectedChannels';

const Styled = {
  Wrapper: styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 265px;
  `,
  Description: styled(Small)`
    opacity: 0.5;
  `,
  Channels: styled.div`
    line-height: 40px;
  `,
};

interface Props {
  title: string;
  heading: string;
  description?: string;
}

const StepSummary: React.FC<Props> = ({ title, heading, description }) => {
  const { buildSwapStore } = useStore();

  const { Wrapper, Description } = Styled;
  return (
    <Wrapper>
      <div>
        <HeaderFour>{title}</HeaderFour>
        <HeaderFive>{heading}</HeaderFive>
        {description && <Description>{description}</Description>}
      </div>
      <div>
        <SelectedChannels count={buildSwapStore.selectedChanIds.length} />
      </div>
    </Wrapper>
  );
};

export default StepSummary;
