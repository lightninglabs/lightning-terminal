import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { PageTitle } from 'components/common/text';
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
  const { uiStore, buildSwapStore } = useStore();

  const { PageWrap } = Styled;
  return (
    <PageWrap>
      {uiStore.processingSwapsVisible ? (
        <ProcessingSwaps />
      ) : buildSwapStore.showWizard ? (
        <SwapWizard />
      ) : (
        <>
          <PageTitle>{l('pageTitle')}</PageTitle>
          <LoopTiles />
          <LoopActions />
        </>
      )}
      <ChannelList />
    </PageWrap>
  );
};

export default observer(LoopPage);
