import React from 'react';
import * as d3 from 'd3';
import BarGroup from './BarGroup';
import { BatchChartData, ChartDimensions } from './chartUtils';

interface Props {
  data: BatchChartData[];
  dimensions: ChartDimensions;
}

const BarChart: React.FC<Props> = ({ data, dimensions }) => {
  const { width } = dimensions;
  // scale for the x-axis
  const xScale = d3
    .scaleBand()
    .range([0, width])
    .domain(data.map(b => b.id))
    .padding(0.4);

  return (
    <g className="bars">
      {data.map(batch => (
        <g
          key={batch.id}
          className="bar-group"
          transform={`translate(${xScale(batch.id)}, 0)`}
        >
          <BarGroup data={data} dimensions={dimensions} batch={batch} xScale={xScale} />
        </g>
      ))}
    </g>
  );
};

export default BarChart;
