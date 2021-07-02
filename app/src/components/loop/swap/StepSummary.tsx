import React from 'react';
import styled from '@emotion/styled';
import { useStore } from 'store';
import { HeaderFive, HeaderFour, Small } from 'components/base';
import SelectedChannels from '../SelectedChannels';

const Styled = {
  Wrapper: styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 300px;
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
  const { buildSwapView } = useStore();

  const { Wrapper, Description } = Styled;
  return (
    <Wrapper>
      <div>
        <HeaderFour>{title}</HeaderFour>
        <HeaderFive>{heading}</HeaderFive>
        {description && <Description>{description}</Description>}
      </div>
      <div>
        <SelectedChannels count={buildSwapView.selectedChanIds.length} />
      </div>
    </Wrapper>
  );
};

export default StepSummary;
