import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ANIMATION_DURATION, BatchChartData, ChartDimensions } from './chartUtils';

interface Props {
  data: BatchChartData[];
  dimensions: ChartDimensions;
}

const RightAxis: React.FC<Props> = ({ data, dimensions }) => {
  const axisRef = useRef<SVGGElement>(null);
  const { height, blocksHeight } = dimensions;

  const scale = d3
    .scaleLinear()
    .range([height, blocksHeight])
    .domain([0, d3.max(data.map(b => b.orders)) as number]);

  useEffect(() => {
    if (!axisRef.current) return;
    d3.select(axisRef.current)
      .transition()
      .duration(ANIMATION_DURATION)
      .call(d3.axisRight<number>(scale));
  }, [data, dimensions]);

  return (
    <g
      ref={axisRef}
      className="axis-right"
      transform={`translate(${dimensions.width}, 0)`}
    >
      <text
        transform="rotate(-90)"
        x={-blocksHeight}
        y={-18}
        dy=".71em"
        fill="#beaed4"
        style={{ textAnchor: 'end', fontSize: 16 }}
      >
        orders
      </text>
    </g>
  );
};

export default RightAxis;
