import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import useSize from 'hooks/useSize';
import { useStore } from 'store';
import { styled } from 'components/theme';
import D3Chart from './chart/D3Chart';

const Styled = {
  Wrapper: styled.div`
    display: none;
    flex: 1;
  `,
};

const BatchChart: React.FC = () => {
  const { batchStore } = useStore();
  const chartArea = useRef<SVGSVGElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<D3Chart>();
  const [div, setDiv] = useState<SVGSVGElement>();
  const { width, height } = useSize(wrapper);

  useEffect(() => {
    if (!chartArea.current) return;
    if (!width || !height) return;

    if (!chart || div !== chartArea.current) {
      setChart(new D3Chart(chartArea.current, batchStore.sortedBatches, width, height));
    } else {
      chart.update(batchStore.sortedBatches);
      chart.updateSize(width, height);
    }
    setDiv(chartArea.current);
  }, [chartArea.current, batchStore.sortedBatches, width, height]);

  console.log(
    `D3Chart: render ${width} ${height}, ${batchStore.sortedBatches.length} batches`,
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
