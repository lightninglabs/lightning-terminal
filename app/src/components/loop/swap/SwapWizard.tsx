import React, { ReactNode, useState } from 'react';
import { Channel } from 'types/state';
import { ArrowLeft } from 'components/common/icons';
import { styled } from 'components/theme';
import SwapConfigStep from './SwapConfigStep';
import SwapProcessingStep from './SwapProcessing';
import SwapReviewStep from './SwapReviewStep';

const Styled = {
  Wrapper: styled.section`
    display: flex;
    min-height: 360px;
    padding: 30px;
    background-color: ${props => props.theme.colors.darkBlue};
    border-radius: 35px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.5);
  `,
  Nav: styled.div`
    width: 30px;
  `,
  BackIcon: styled(ArrowLeft)`
    height: 16px;
    width: 16px;
    cursor: pointer;
    color: ${props => props.theme.colors.whitish};

    &:hover {
      opacity: 20%;
    }
  `,
  Content: styled.div`
    flex-grow: 1;
    display: flex;
    align-items: stretch;
    flex-direction: row;
  `,
};

interface Props {
  channels: Channel[];
  swapType: string;
  onClose: () => void;
}

const SwapWizard: React.FC<Props> = ({ channels, swapType, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const goToNext = () => setCurrentStep(Math.min(currentStep + 1, 3));
  const goToPrev = () => setCurrentStep(Math.max(currentStep - 1, 1));
  const navBack = () => {
    if (currentStep === 1) onClose();
    else goToPrev();
  };

  const [amount, setAmount] = useState(600000);

  let cmp: ReactNode;
  switch (currentStep) {
    case 1:
      cmp = (
        <SwapConfigStep
          amount={amount}
          onAmountChange={v => setAmount(v)}
          minAmount={250000}
          maxAmount={1000000}
          channelCount={channels.length}
          onNext={goToNext}
          onCancel={onClose}
        />
      );
      break;
    case 2:
      cmp = (
        <SwapReviewStep
          amount={amount}
          fee={9000}
          type={swapType}
          channelCount={channels.length}
          onNext={goToNext}
          onCancel={onClose}
        />
      );
      break;
    case 3:
      cmp = <SwapProcessingStep onFinish={onClose} />;
      break;
  }

  const { Wrapper, Nav, BackIcon, Content } = Styled;
  return (
    <Wrapper>
      <Nav>
        <BackIcon onClick={navBack} />
      </Nav>
      <Content>{cmp}</Content>
    </Wrapper>
  );
};

export default SwapWizard;
