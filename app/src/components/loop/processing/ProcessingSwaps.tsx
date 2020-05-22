import React from 'react';
import { observer } from 'mobx-react-lite';
import confirmJson from 'assets/animations/confirm.json';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import Animation from 'components/common/Animation';
import { Minimize } from 'components/common/icons';
import { HeaderFour } from 'components/common/text';
import { styled } from 'components/theme';
import ProcessingSwapRow from './ProcessingSwapRow';

const Styled = {
  Wrapper: styled.section`
    display: flex;
    flex-direction: column;
    min-height: 360px;
    padding: 40px;
    background-color: ${props => props.theme.colors.darkBlue};
    border-radius: 35px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.5);
  `,
  Header: styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  `,
  MinimizeIcon: styled(Minimize)`
    display: inline-block;
    padding: 4px;
    cursor: pointer;

    &:hover {
      border-radius: 24px;
      background-color: ${props => props.theme.colors.purple};
    }
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
  const { swapStore, uiStore } = useStore();

  const { Wrapper, Header, MinimizeIcon, Content, Complete, ConfirmAnimation } = Styled;
  return (
    <Wrapper>
      <Header>
        <HeaderFour>{l('title')}</HeaderFour>
        <MinimizeIcon onClick={uiStore.toggleProcessingSwaps} />
      </Header>
      <Content>
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
