import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Column, Row } from 'components/common/grid';
import Tile from 'components/common/Tile';
import { styled } from 'components/theme';
import LoopHistory from './LoopHistory';

const Styled = {
  TileSection: styled.section`
    margin-top: 90px;
  `,
};

const LoopTiles: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.LoopTiles');
  const store = useStore();

  const { TileSection } = Styled;
  return (
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
  );
};

export default observer(LoopTiles);
