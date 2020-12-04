import React from 'react';
import * as d3 from 'd3';
import Block from './Block';
import { BatchChartData, ChartDimensions } from './chartUtils';
import RateLine from './RateLine';

interface Props {
  data: BatchChartData[];
  dimensions: ChartDimensions;
}

const BlocksGroup: React.FC<Props> = ({ data, dimensions }) => {
  const { width, blocksHeight } = dimensions;
  // scale for the x-axis
  const xScale = d3
    .scaleBand()
    .range([0, width])
    .domain(data.map(b => b.id))
    .padding(0.4);

  const topPadding = blocksHeight * 0.4;
  const yScale = d3
    .scaleLinear()
    .range([blocksHeight - topPadding * 2, 0])
    .domain([0, d3.max(data.map(b => b.rate)) as number]);

  return (
    <g className="blocks-group" transform={`translate(0, ${topPadding})`}>
      <RateLine data={data} dimensions={dimensions} xScale={xScale} yScale={yScale} />
      {data.map(batch => (
        <Block
          key={batch.id}
          data={data}
          dimensions={dimensions}
          batch={batch}
          xScale={xScale}
          yScale={yScale}
        />
      ))}
    </g>
  );
};

export default BlocksGroup;
