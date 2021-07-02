import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { BarChart, HeaderFour, List } from 'components/base';
import BadgeList from 'components/common/BadgeList';

const Styled = {
  Wrapper: styled.div`
    display: flex;
    justify-content: space-between;
  `,
  Title: styled(HeaderFour)`
    display: inline-block;
  `,
  ViewMode: styled.div`
    opacity: 0.6;

    &:hover {
      opacity: 1;
    }
  `,
};

const BatchControls: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.batches.BatchControls');
  const { batchesView } = useStore();

  const handleViewChart = useCallback(() => batchesView.setViewMode('chart'), []);
  const handleViewList = useCallback(() => batchesView.setViewMode('list'), []);

  const { Wrapper, Title, ViewMode } = Styled;
  return (
    <Wrapper>
      <div>
        {batchesView.showMarketBadges && (
          <>
            <Title>{l('markets')}</Title>
            <BadgeList
              options={batchesView.marketOptions}
              value={batchesView.selectedMarket}
              onChange={batchesView.changeMarket}
            />
          </>
        )}
      </div>
      <ViewMode>
        <BarChart size="large" onClick={handleViewChart} />
        <List size="large" onClick={handleViewList} />
      </ViewMode>
    </Wrapper>
  );
};

export default observer(BatchControls);
