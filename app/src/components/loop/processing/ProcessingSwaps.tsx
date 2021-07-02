import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import confirmJson from 'assets/animations/confirm.json';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Close, HeaderFour } from 'components/base';
import Animation from 'components/common/Animation';
import Tip from 'components/common/Tip';
import ProcessingSwapRow from './ProcessingSwapRow';

const Styled = {
  Wrapper: styled.section<{ sidebar?: boolean }>`
    display: flex;
    flex-direction: column;
    min-height: 360px;
    padding: 40px;
    background-color: ${props => props.theme.colors.darkBlue};
    border-radius: 35px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.5);
    margin-left: ${props => (props.sidebar ? '0' : '40px')};
  `,
  Header: styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  `,
  Content: styled.div`
    display: flex;
    flex-direction: column;
  `,
  Complete: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,
  ConfirmAnimation: styled(Animation)`
    width: 200px;
    height: 200px;
  `,
};

const ProcessingSwaps: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.processing.ProcessingSwaps');
  const { swapStore, appView, settingsStore } = useStore();

  const { Wrapper, Header, Content, Complete, ConfirmAnimation } = Styled;
  return (
    <Wrapper sidebar={settingsStore.sidebarVisible}>
      <Header>
        <HeaderFour>{l('title')}</HeaderFour>
        <Tip overlay={l('closeTip')}>
          <Close data-tour="swap-close" onClick={appView.toggleProcessingSwaps} />
        </Tip>
      </Header>
      <Content data-tour="processing-swaps">
        {swapStore.processingSwaps.map(swap => (
          <ProcessingSwapRow key={swap.id} swap={swap} />
        ))}
        {swapStore.processingSwaps.length === 0 && (
          <Complete>
            <ConfirmAnimation animationData={confirmJson} />
            <HeaderFour>{l('complete')}</HeaderFour>
          </Complete>
        )}
      </Content>
    </Wrapper>
  );
};

export default observer(ProcessingSwaps);
