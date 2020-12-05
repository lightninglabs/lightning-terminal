import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ANIMATION_DURATION, BatchChartData, ChartDimensions } from './chartUtils';

interface Props {
  data: BatchChartData[];
  dimensions: ChartDimensions;
}

const LeftAxis: React.FC<Props> = ({ data, dimensions }) => {
  const axisRef = useRef<SVGGElement>(null);
  const { height, blocksHeight } = dimensions;

  const yScale = d3
    .scaleLinear()
    .range([height, blocksHeight])
    .domain([0, d3.max(data.map(b => b.volume)) as number]);

  useEffect(() => {
    if (!axisRef.current) return;
    d3.select(axisRef.current)
      .transition()
      .duration(ANIMATION_DURATION)
      .call(
        d3
          .axisLeft<number>(yScale)
          .tickFormat(v => `${(v / 1000000).toFixed(1)}M`)
          .tickSizeOuter(0),
      );
  }, [data, dimensions]);

  return (
    <g ref={axisRef} className="axis-left">
      <text
        transform="rotate(-90)"
        x={-blocksHeight}
        y={6}
        dy=".71em"
        fill="#7fc97f"
        style={{ textAnchor: 'end', fontSize: 16 }}
      >
        volume
      </text>
    </g>
  );
};

export default LeftAxis;
