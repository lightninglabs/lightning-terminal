import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import Stat from 'components/common/Stat';
import Unit from 'components/common/Unit';
import { styled } from 'components/theme';
import BatchCountdown from './BatchCountdown';

const Styled = {
  Wrapper: styled.div`
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    background-color: ${props => props.theme.colors.overlay};
    border: 1px solid ${props => props.theme.colors.overlay};
    border-radius: 5px;
    margin: -15px 0 15px;
  `,
  Stat: styled(Stat)`
    margin: 0 30px;
  `,
  BatchCountdown: styled(BatchCountdown)`
    margin: 0 30px;
  `,
};

const BatchStats: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.batches.BatchStats');
  const { batchStore, orderStore } = useStore();

  const { Wrapper, Stat, BatchCountdown } = Styled;
  return (
    <Wrapper>
      <div>
        <BatchCountdown
          label={l('nextBatch')}
          timestamp={batchStore.nextBatchTimestamp}
        />
        <Stat label={l('prevRate')} value={`${batchStore.currentRate}`} />
        <Stat
          label={l('rateChange')}
          value={`${batchStore.currentRateChange}%`}
          positive={batchStore.currentRateChange > 0}
          negative={batchStore.currentRateChange < 0}
        />
      </div>
      <div>
        <Stat
          label={l('earned')}
          value={<Unit sats={orderStore.earnedSats} suffix={false} />}
        />
        <Stat
          label={l('paid')}
          value={<Unit sats={orderStore.paidSats} suffix={false} />}
        />
      </div>
    </Wrapper>
  );
};

export default observer(BatchStats);
