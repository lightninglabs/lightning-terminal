import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Column, Row } from 'components/common/grid';
import { PageTitle } from 'components/common/text';
import Tile from 'components/common/Tile';
import { styled } from 'components/theme';
import ChannelList from './ChannelList';
import LoopActions from './LoopActions';
import LoopHistory from './LoopHistory';
import SwapWizard from './swap/SwapWizard';

const Styled = {
  PageWrap: styled.div`
    padding: 40px 0;
  `,
  TileSection: styled.section`
    margin-top: 90px;
  `,
};

const LoopPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.LoopPage');
  const store = useStore();
  const build = store.buildSwapStore;

  const { PageWrap, TileSection } = Styled;
  return (
    <PageWrap>
      {build.showWizard ? (
        <SwapWizard
          direction={build.direction}
          channels={build.channels}
          amount={build.amount}
          setAmount={build.setAmount}
          minAmount={build.termsMinMax.min}
          maxAmount={build.termsMinMax.max}
          fee={build.fee}
          currentStep={build.currentStep}
          swapError={build.swapError}
          onNext={build.goToNextStep}
          onPrev={build.goToPrevStep}
          onClose={build.cancel}
        />
      ) : (
        <>
          <PageTitle>{l('pageTitle')}</PageTitle>
          <TileSection>
            <Row>
              <Column>
                <Tile title={l('history')} onArrowClick={() => null}>
                  <LoopHistory swaps={store.swapStore.sortedSwaps} />
                </Tile>
              </Column>
              <Column cols={4}>
                <Tile
                  title={l('inbound')}
                  text={`${store.channelStore.totalInbound.toLocaleString()} SAT`}
                />
              </Column>
              <Column cols={4}>
                <Tile
                  title={l('outbound')}
                  text={`${store.channelStore.totalOutbound.toLocaleString()} SAT`}
                />
              </Column>
            </Row>
          </TileSection>
          <LoopActions
            channels={build.channels}
            direction={build.direction}
            onLoopClick={build.startSwap}
            onDirectionClick={build.setDirection}
            onCancelClick={build.cancel}
          />
        </>
      )}
      <ChannelList
        channels={store.channelStore.sortedChannels}
        enableSelection={build.listEditable}
        selectedChannels={build.channels}
        onSelectionChange={build.setSelectedChannels}
        disabled={build.showWizard}
      />
    </PageWrap>
  );
};

export default observer(LoopPage);
