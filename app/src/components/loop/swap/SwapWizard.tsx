import React, { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { BuildSwapSteps } from 'types/state';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { ArrowLeft } from 'components/base';
import Tip from 'components/common/Tip';
import SwapConfigStep from './SwapConfigStep';
import SwapProcessingStep from './SwapProcessing';
import SwapReviewStep from './SwapReviewStep';

const Styled = {
  Wrapper: styled.section<{ sidebar?: boolean }>`
    display: flex;
    min-height: 360px;
    padding: 30px;
    background-color: ${props => props.theme.colors.darkBlue};
    border-radius: 35px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.5);
    margin-left: ${props => (props.sidebar ? '0' : '40px')};
  `,
  Nav: styled.div`
    width: 36px;
  `,
  Content: styled.div`
    flex-grow: 1;
    display: flex;
    align-items: stretch;
    flex-direction: row;
  `,
};

const SwapWizard: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.swap.SwapWizard');

  const { buildSwapView, settingsStore } = useStore();

  let cmp: ReactNode;
  switch (buildSwapView.currentStep) {
    case BuildSwapSteps.ChooseAmount:
      cmp = <SwapConfigStep />;
      break;
    case BuildSwapSteps.ReviewQuote:
      cmp = <SwapReviewStep />;
      break;
    case BuildSwapSteps.Processing:
      cmp = <SwapProcessingStep />;
      break;
    default:
      return null;
  }

  const { Wrapper, Nav, Content } = Styled;
  return (
    <Wrapper sidebar={settingsStore.sidebarVisible}>
      <Nav>
        <Tip overlay={l('backTip')}>
          <ArrowLeft onClick={buildSwapView.goToPrevStep} />
        </Tip>
      </Nav>
      <Content>{cmp}</Content>
    </Wrapper>
  );
};

export default observer(SwapWizard);
