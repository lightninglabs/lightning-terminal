import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useActions, useStore } from 'store';
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
  const { node, channel, swap } = useActions();
  const [showSwap, setShowSwap] = useState(false);
  const [swapType, setSwapType] = useState('Loop Out');
  const [selectedChannels] = useState(store.channels.slice(0, 3));

  useEffect(() => {
    // fetch RPC data when the component mounts if there is no
    if (store.channels.length === 0) {
      channel.getChannels();
      node.getBalances();
      swap.listSwaps();
    }
  }, [store, node, channel, swap]);

  const handleLoop = (swapType: string) => {
    setSwapType(swapType);
    setShowSwap(true);
  };

  const { PageWrap, TileSection } = Styled;
  return (
    <PageWrap>
      {showSwap ? (
        <SwapWizard
          swapType={swapType}
          channels={selectedChannels}
          onClose={() => setShowSwap(false)}
        />
      ) : (
        <>
          <PageTitle>{l('pageTitle')}</PageTitle>
          <TileSection>
            <Row>
              <Column>
                <Tile title={l('history')} onArrowClick={() => null}>
                  <LoopHistory swaps={store.swaps} />
                </Tile>
              </Column>
              <Column cols={4}>
                <Tile
                  title={l('inbound')}
                  text={`${store.totalInbound.toLocaleString()} SAT`}
                />
              </Column>
              <Column cols={4}>
                <Tile
                  title={l('outbound')}
                  text={`${store.totalOutbound.toLocaleString()} SAT`}
                />
              </Column>
            </Row>
          </TileSection>
          <LoopActions
            channels={selectedChannels}
            swapType={swapType}
            onLoop={handleLoop}
          />
        </>
      )}
      <ChannelList channels={store.channels} />
    </PageWrap>
  );
};

export default observer(LoopPage);
