import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useActions, useStore } from 'store';
import { Column, Row } from 'components/common/grid';
import { PageTitle } from 'components/common/text';
import Tile from 'components/common/Tile';
import { styled } from 'components/theme';
import LoopHistory from './LoopHistory';

const Styled = {
  PageWrap: styled.div`
    padding: 40px 50px;
  `,
  TileSection: styled.section`
    margin-top: 90px;
  `,
};

const LoopPage: React.FC = () => {
  const store = useStore();
  const { node, channel, swap } = useActions();
  const { l } = usePrefixedTranslation('cmps.loop.LoopPage');

  useEffect(() => {
    // fetch RPC data when the component mounts if there is no
    if (store.channels.length === 0) {
      channel.getChannels();
      node.getBalances();
      swap.listSwaps();
    }
  }, [store, node, channel, swap]);

  const { PageWrap, TileSection } = Styled;
  return (
    <PageWrap>
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
    </PageWrap>
  );
};

export default observer(LoopPage);
