import React, { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { SwapDirection } from 'types/state';
import { Channel } from 'store/models';
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
  minAmount: number;
  maxAmount: number;
  fee: number;
  currentStep: number;
  swapError?: Error;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

const SwapWizard: React.FC<Props> = ({
  channels,
  direction,
  amount,
  setAmount,
  minAmount,
  maxAmount,
  fee,
  currentStep,
  swapError,
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
          minAmount={minAmount}
          maxAmount={maxAmount}
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
      cmp = <SwapProcessingStep swapError={swapError} />;
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

export default observer(SwapWizard);
