import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import useSize from 'hooks/useSize';
import { useStore } from 'store';
import LoaderLines from 'components/common/LoaderLines';
import { ChartConfig, D3Chart } from './chart';

const Styled = {
  Wrapper: styled.div`
    flex: 2;
    position: relative;
    cursor: move;

    text {
      font-family: ${props => props.theme.fonts.open.regular};
    }

    .tick {
      font-size: ${props => props.theme.sizes.xs};
    }

    .block {
      fill: ${props => props.theme.colors.blue};
    }

    .block-label-rate {
      fill: ${props => props.theme.colors.white};
    }

    .block-label-suffix {
      fill: ${props => props.theme.colors.gray};
      display: none;
    }

    .block-group:first-of-type {
      .block-label-suffix {
        display: block;
      }
    }

    .block-label-pct {
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
  LoaderLines: styled(LoaderLines)`
    position: absolute;
    top: 10px;
    left: 50%;
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
      const config: ChartConfig = {
        element: chartArea.current,
        outerWidth: width,
        outerHeight: height,
        batches: batchStore.sortedBatches,
        market: batchStore.selectedLeaseDuration,
        fetchBatches: batchStore.fetchBatches,
      };
      setChart(new D3Chart(config));
    } else {
      chart.update(batchStore.sortedBatches, batchStore.selectedLeaseDuration);
    }
  }, [chartArea.current, batchStore.sortedBatches, batchStore.selectedLeaseDuration]);

  useEffect(() => {
    // resize the chart when the dimensions of the wrapper change
    if (chart) chart.resize(width, height);
  }, [width, height]);

  const { Wrapper, LoaderLines } = Styled;
  return (
    <Wrapper ref={wrapper}>
      {batchStore.loading && <LoaderLines />}
      <svg ref={chartArea} width={width} height={height} />
    </Wrapper>
  );
};

export default observer(BatchChart);
