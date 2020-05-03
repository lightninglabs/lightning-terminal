import React, { ReactNode } from 'react';
import { Channel, SwapDirection } from 'types/state';
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
  direction: SwapDirection;
  amount: number;
  setAmount: (amount: number) => void;
  fee: number;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

const SwapWizard: React.FC<Props> = ({
  channels,
  direction,
  amount,
  setAmount,
  fee,
  currentStep,
  onNext,
  onPrev,
  onClose,
}) => {
  let cmp: ReactNode;
  switch (currentStep) {
    case 1:
      cmp = (
        <SwapConfigStep
          amount={amount}
          onAmountChange={setAmount}
          minAmount={250000}
          maxAmount={1000000}
          channelCount={channels.length}
          onNext={onNext}
          onCancel={onClose}
        />
      );
      break;
    case 2:
      cmp = (
        <SwapReviewStep
          amount={amount}
          fee={fee}
          direction={direction}
          channelCount={channels.length}
          onNext={onNext}
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
        <BackIcon onClick={onPrev} />
      </Nav>
      <Content>{cmp}</Content>
    </Wrapper>
  );
};

export default SwapWizard;
