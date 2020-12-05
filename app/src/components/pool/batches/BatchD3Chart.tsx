import React, { useEffect, useMemo, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import * as d3 from 'd3';
import { useSize } from 'hooks';
import { useStore } from 'store';
import LoaderLines from 'components/common/LoaderLines';
import { styled } from 'components/theme';
import BarChart from './chart/BarChart';
import BlocksGroup from './chart/BlocksGroup';
import BottomAxis from './chart/BottomAxis';
import { BatchChartData, convertData, getDimensions } from './chart/chartUtils';
import LeftAxis from './chart/LeftAxis';
import RightAxis from './chart/RightAxis';

const Styled = {
  Wrapper: styled.div`
    flex: 1;
    display: none;
    justify-content: center;
    align-items: center;
  `,
};

const BatchD3Chart: React.FC = () => {
  const { batchStore } = useStore();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { width, height } = useSize(wrapperRef);

  const data = useMemo(() => convertData(batchStore.sortedBatches), [
    batchStore.sortedBatches,
  ]);

  const dimensions = useMemo(() => getDimensions(width, height), [width, height]);
  // scale for the x-axis
  const xScale = d3
    .scaleBand()
    .range([0, data.length * 100])
    .domain(data.map(b => b.id))
    .padding(0.4);

  useEffect(() => {
    if (!svgRef.current) return;

    const zoomChart = (e: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      xScale.range([0, width].map(d => e.transform.applyX(d)));
      console.log('D3Chart: zoomChart', e, xScale.range());
      d3.select(svgRef.current)
        .selectAll<SVGRectElement, BatchChartData>('.bar-group')
        .attr('x', (_, i) => xScale(data[i].id) || 0)
        .attr('width', xScale.bandwidth());
    };
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5]) // This control how much you can unzoom (x0.5) and zoom (x20)
      .extent([
        [0, 0],
        [width, height],
      ])
      .on('zoom', zoomChart);

    d3.select(svgRef.current).call(zoom);
  }, [svgRef, width, height]);

  const svg = (
    <svg width={width} height={height} ref={svgRef}>
      <g transform={`translate(${dimensions.margin.left}, ${dimensions.margin.top})`}>
        <defs>
          <clipPath id="clip">
            <rect x={1} y={0} width={width} height={height} fill="red"></rect>
          </clipPath>
        </defs>
        <g clipPath="url(#clip)">
          <BlocksGroup data={data} dimensions={dimensions} />
          <BarChart data={data} dimensions={dimensions} />
        </g>
        <LeftAxis data={data} dimensions={dimensions} />
        <RightAxis data={data} dimensions={dimensions} />
        <BottomAxis data={data} dimensions={dimensions} />
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
