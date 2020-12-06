import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import useSize from 'hooks/useSize';
import { useStore } from 'store';
import { styled } from 'components/theme';
import D3Chart from './chart2/D3Chart';

const Styled = {
  Wrapper: styled.div`
    /* display: none; */
    flex: 2;
    margin-bottom: 20px;
    cursor: move;

    text {
      font-family: ${props => props.theme.fonts.open.regular};
    }

    .tick {
      font-size: ${props => props.theme.sizes.xs};
    }

    .label-pct {
      &.positive {
        fill: ${props => props.theme.colors.green};
      }
      &.neutral {
        fill: ${props => props.theme.colors.gray};
      }
      &.negative {
        fill: ${props => props.theme.colors.pink};
      }
    }
  `,
};

const BatchChart: React.FC = () => {
  const { batchStore } = useStore();
  const chartArea = useRef<SVGSVGElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<D3Chart>();
  const { width, height } = useSize(wrapper);

  useEffect(() => {
    if (!chartArea.current) return;
    if (!width || !height || !batchStore.sortedBatches.length) return;

    if (!chart) {
      setChart(new D3Chart(chartArea.current, batchStore.sortedBatches, width, height));
    } else {
      chart.update(batchStore.sortedBatches);
    }
  }, [chartArea.current, batchStore.sortedBatches]);

  useEffect(() => {
    if (!chart) return;

    chart.resize(width, height);
  }, [width, height]);

  console.log(
    `D3Chart: BatchChart > render ${width} ${height}, ${batchStore.sortedBatches.length} batches`,
    chartArea.current,
  );

  const { Wrapper } = Styled;
  return (
    <Wrapper ref={wrapper}>
      <svg ref={chartArea} width={width} height={height} />
    </Wrapper>
  );
};

export default observer(BatchChart);
