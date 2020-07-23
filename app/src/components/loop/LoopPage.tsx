import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Badge } from 'components/base';
import PageHeader from 'components/common/PageHeader';
import { styled } from 'components/theme';
import ChannelList from './ChannelList';
import LoopActions from './LoopActions';
import LoopTiles from './LoopTiles';
import ProcessingSwaps from './processing/ProcessingSwaps';
import SwapWizard from './swap/SwapWizard';

const Styled = {
  PageWrap: styled.div`
    padding: 40px 0;
  `,
};

const LoopPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.LoopPage');
  const { uiStore, buildSwapStore, channelStore, nodeStore } = useStore();

  const title = (
    <>
      {l('pageTitle')}
      {nodeStore.network !== 'mainnet' && (
        <div>
          <Badge>{nodeStore.network}</Badge>
        </div>
      )}
    </>
  );

  const { PageWrap } = Styled;
  return (
    <PageWrap>
      {uiStore.processingSwapsVisible ? (
        <ProcessingSwaps />
      ) : buildSwapStore.showWizard ? (
        <SwapWizard />
      ) : (
        <>
          <PageHeader
            title={title}
            onHelpClick={uiStore.showTour}
            onExportClick={channelStore.exportChannels}
          />
          <LoopTiles />
          <LoopActions />
        </>
      )}
      <ChannelList />
    </PageWrap>
  );
};

export default observer(LoopPage);
