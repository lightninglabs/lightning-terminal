import React, { useEffect, useMemo, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import * as d3 from 'd3';
import { useSize } from 'hooks';
import { useStore } from 'store';
import LoaderLines from 'components/common/LoaderLines';
import { styled } from 'components/theme';
import BottomAxis from './chart2/BottomAxis';
import { BatchChartData, convertData, getDimensions } from './chart2/chartUtils';
import LeftAxis from './chart2/LeftAxis';
import RightAxis from './chart2/RightAxis';

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

  const dimensions = useMemo(() => getDimensions(width, height, data.length), [
    width,
    height,
    data.length,
  ]);
  const totalWidth = data.length * 150;
  const initialRange = [0, totalWidth];
  // scale for the x-axis
  const xScale = d3
    .scaleBand()
    .range(initialRange)
    .domain(data.map(b => b.id))
    .padding(0.4);

  useEffect(() => {
    if (!svgRef.current) return;
    const transExt: [[number, number], [number, number]] = [
      [dimensions.margin.left, dimensions.margin.top],
      [totalWidth, dimensions.height],
    ];

    const zoomChart = (e: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      xScale.range(initialRange.map(d => e.transform.applyX(d)));
      console.log(
        'D3Chart: zoomChart',
        e.transform,
        xScale.range(),
        totalWidth,
        dimensions.width,
        [dimensions.width - totalWidth, dimensions.width],
        JSON.stringify(transExt),
      );
      d3.select(svgRef.current)
        .selectAll<SVGRectElement, BatchChartData>('.bar-group rect')
        .data(data)
        .attr('x', d => xScale(d.id) || 0)
        .attr('width', xScale.bandwidth());
      d3.select<SVGGElement, unknown>('.axis-bottom').call(d3.axisBottom(xScale));
    };
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 1]) // disable mouse-wheel zooming
      .translateExtent(transExt)
      .extent([
        [dimensions.margin.left, dimensions.margin.top],
        [dimensions.width, dimensions.height],
      ])
      .on('zoom', zoomChart);

    d3.select(svgRef.current).call(zoom);
  }, [svgRef.current, totalWidth, data]);

  const svg = (
    <svg width={width} height={height} ref={svgRef}>
      <g transform={`translate(${dimensions.margin.left}, ${dimensions.margin.top})`}>
        <defs>
          <clipPath id="clip">
            <rect
              x={1}
              y={0}
              width={dimensions.width}
              height={dimensions.height + dimensions.margin.bottom}
              fill="red"
            ></rect>
          </clipPath>
        </defs>
        <g className="bar-group" clipPath="url(#clip)">
          {data.map(batch => (
            <rect
              key={batch.id}
              width={xScale.bandwidth()}
              height={batch.rate / 10}
              y={dimensions.height - batch.rate / 10}
              x={xScale(batch.id)}
              fill="#7fc97f"
            />
          ))}
          <BottomAxis data={data} dimensions={dimensions} xScale={xScale} />
        </g>
        <LeftAxis data={data} dimensions={dimensions} />
        <RightAxis data={data} dimensions={dimensions} />
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
