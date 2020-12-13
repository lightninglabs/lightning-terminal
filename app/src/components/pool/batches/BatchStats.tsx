import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { BarChart, List } from 'components/base';
import Stat from 'components/common/Stat';
import Unit from 'components/common/Unit';
import { styled } from 'components/theme';
import BatchCountdown from './BatchCountdown';

const StyledStat = styled.div`
  margin: 0 20px;

  > h4 {
    margin-bottom: 0;
  }

  @media (max-width: 1200px) {
    margin: 0 10px;

    > div {
      font-size: ${props => props.theme.sizes.l};
    }
  }
`;

const Styled = {
  Wrapper: styled.div`
    display: flex;
    justify-content: space-between;
    position: relative;
    padding: 5px 0;
    background-color: ${props => props.theme.colors.overlay};
    border: 1px solid ${props => props.theme.colors.overlay};
    border-radius: 5px;
    margin: -15px 0 15px;
  `,
  Stat: StyledStat.withComponent(Stat),
  BatchCountdown: StyledStat.withComponent(BatchCountdown),
  ViewMode: styled.div`
    position: absolute;
    bottom: -40px;
    right: 0;
    z-index: 1;
    opacity: 0.6;

    &:hover {
      opacity: 1;
    }
  `,
};

const BatchStats: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.batches.BatchStats');
  const { batchesView } = useStore();

  const handleViewChart = useCallback(() => batchesView.setViewMode('chart'), []);
  const handleViewList = useCallback(() => batchesView.setViewMode('list'), []);

  const tipProps = { tipPlacement: 'bottom', tipCapitalize: false };

  const { Wrapper, Stat, BatchCountdown, ViewMode } = Styled;
  return (
    <Wrapper>
      <div>
        <BatchCountdown
          label={l('nextBatch')}
          timestamp={batchesView.nextBatchTimestamp}
          tip={l('nextBatchTip')}
        />
        <Stat
          label={l('prevFee')}
          value={`${batchesView.currentFee}`}
          tip={l('prevFeeTip')}
          {...tipProps}
        />
        <Stat
          label={l('prevRate')}
          value={`${batchesView.currentRate}`}
          tip={l('prevRateTip', { fixedRate: batchesView.currentFixedRate })}
          {...tipProps}
        />
        <Stat
          label={l('rateChange')}
          value={`${batchesView.currentRateChange}%`}
          positive={batchesView.currentRateChange > 0}
          negative={batchesView.currentRateChange < 0}
          tip={l('rateChangeTip')}
          {...tipProps}
        />
      </div>
      <div>
        <Stat
          label={l('earned')}
          value={<Unit sats={batchesView.earnedSats} suffix={false} />}
        />
        <Stat
          label={l('paid')}
          value={<Unit sats={batchesView.paidSats} suffix={false} />}
        />
      </div>
      <ViewMode>
        <BarChart size="large" onClick={handleViewChart} />
        <List size="large" onClick={handleViewList} />
      </ViewMode>
    </Wrapper>
  );
};

export default observer(BatchStats);
