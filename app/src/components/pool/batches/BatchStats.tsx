import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import LoaderLines from 'components/common/LoaderLines';
import Stat from 'components/common/Stat';
import Unit from 'components/common/Unit';
import BatchCountdown from './BatchCountdown';

const StyledStat = styled.div`
  margin: 0 20px;

  > h4 {
    margin-bottom: 0;
  }

  @media (max-width: 1200px) {
    margin: 0 10px;

    > div {
      font-size: ${props => props.theme.sizes.m};
    }

    > h4 {
      font-size: ${props => props.theme.sizes.xxs};
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
  LoaderLines: styled(LoaderLines)`
    .line {
      margin: 10px 1px;
      height: 10px;
    }
  `,
};

const BatchStats: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.batches.BatchStats');
  const { batchesView } = useStore();

  const tipProps = { tipPlacement: 'bottom', tipCapitalize: false };

  const { Wrapper, Stat, BatchCountdown, LoaderLines } = Styled;
  return (
    <Wrapper>
      <div>
        <BatchCountdown
          label={l('nextBatch')}
          timestamp={batchesView.nextBatchTimestamp.toNumber()}
          tip={l('nextBatchTip')}
        />
        <Stat
          label={l('nextFeeRate')}
          value={`${batchesView.nextFeeRate}`}
          tip={l('nextFeeRateTip')}
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
          label={l('tier')}
          value={batchesView.tier || <LoaderLines />}
          tip={l('tierTip')}
          {...tipProps}
        />
        <Stat
          label={l('earned')}
          value={<Unit sats={batchesView.earnedSats} suffix={false} />}
          tip={l('earnedTip')}
          {...tipProps}
        />
        <Stat
          label={l('paid')}
          value={<Unit sats={batchesView.paidSats} suffix={false} />}
          tip={l('paidTip')}
          {...tipProps}
          tipPlacement="bottomRight"
        />
      </div>
    </Wrapper>
  );
};

export default observer(BatchStats);
