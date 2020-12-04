import React, { useMemo, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useSize } from 'hooks';
import { useStore } from 'store';
import LoaderLines from 'components/common/LoaderLines';
import { styled } from 'components/theme';
import BarChart from './chart/BarChart';
import BlocksGroup from './chart/BlocksGroup';
import BottomAxis from './chart/BottomAxis';
import { convertData, getDimensions } from './chart/chartUtils';
import LeftAxis from './chart/LeftAxis';
import RightAxis from './chart/RightAxis';

const Styled = {
  Wrapper: styled.div`
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  `,
};

const BatchD3Chart: React.FC = () => {
  const { batchStore } = useStore();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { width, height } = useSize(wrapperRef);

  const data = useMemo(() => convertData(batchStore.sortedBatches), [
    batchStore.sortedBatches,
  ]);

  const dimensions = useMemo(() => getDimensions(width, height), [width, height]);

  const svg = (
    <svg width={width} height={height}>
      <g transform={`translate(${dimensions.margin.left}, ${dimensions.margin.top})`}>
        <BlocksGroup data={data} dimensions={dimensions} />
        <LeftAxis data={data} dimensions={dimensions} />
        <RightAxis data={data} dimensions={dimensions} />
        <BottomAxis data={data} dimensions={dimensions} />
        <BarChart data={data} dimensions={dimensions} />
      </g>
    </svg>
  );

  const { Wrapper } = Styled;
  return (
    <Wrapper ref={wrapperRef}>
      {width === 0 || height === 0 ? <LoaderLines /> : svg}
    </Wrapper>
  );
};

export default observer(BatchD3Chart);
