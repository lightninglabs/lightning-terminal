import React, { ReactNode, useState } from 'react';
import { styled } from 'components/theme';
import SwapConfigStep from './SwapConfigStep';
import SwapProcessingStep from './SwapProcessing';
import SwapReviewStep from './SwapReviewStep';

const Styled = {
  Wrapper: styled.section`
    display: flex;
    height: 360px;
    padding: 30px;
    background-color: ${props => props.theme.colors.darkBlue};
    border-radius: 35px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.5);
  `,
};

interface Props {
  channelIds: string[];
  onClose: () => void;
}

const SwapWizard: React.FC<Props> = ({ channelIds, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const goToNext = () => setCurrentStep(Math.min(currentStep + 1, 3));
  const goToPrev = () => setCurrentStep(Math.max(currentStep - 1, 1));

  let cmp: ReactNode;
  switch (currentStep) {
    case 1:
      cmp = <SwapConfigStep onNext={goToNext} onBack={onClose} />;
      break;
    case 2:
      cmp = <SwapReviewStep onBack={goToPrev} onNext={goToNext} />;
      break;
    case 3:
      cmp = <SwapProcessingStep onBack={goToPrev} onFinish={onClose} />;
      break;
  }

  const { Wrapper } = Styled;
  return <Wrapper>{cmp}</Wrapper>;
};

export default SwapWizard;
