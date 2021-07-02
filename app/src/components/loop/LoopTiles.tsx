import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Column, Row } from 'components/base';
import Tile from 'components/common/Tile';
import Unit from 'components/common/Unit';
import LoopHistory from './LoopHistory';

const Styled = {
  TileSection: styled.section`
    margin-top: 90px;
  `,
};

const LoopTiles: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.LoopTiles');
  const { channelStore, appView } = useStore();

  const { TileSection } = Styled;
  return (
    <TileSection>
      <Row>
        <Column>
          <Tile
            tour="history"
            title={l('history')}
            onMaximizeClick={appView.toggleProcessingSwaps}
          >
            <LoopHistory />
          </Tile>
        </Column>
        <Column cols={4}>
          <Tile
            tour="inbound"
            title={l('inbound')}
            text={<Unit sats={channelStore.totalInbound} />}
          />
        </Column>
        <Column cols={4}>
          <Tile
            tour="outbound"
            title={l('outbound')}
            text={<Unit sats={channelStore.totalOutbound} />}
          />
        </Column>
      </Row>
    </TileSection>
  );
};

export default observer(LoopTiles);
