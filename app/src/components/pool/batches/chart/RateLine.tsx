import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ANIMATION_DURATION, BatchChartData, ChartDimensions } from './chartUtils';

interface Props {
  data: BatchChartData[];
  dimensions: ChartDimensions;
  xScale: d3.ScaleBand<string>;
  yScale: d3.ScaleLinear<number, number, never>;
}

const RateLine: React.FC<Props> = ({ data, dimensions, xScale, yScale }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const { blockSize } = dimensions;

  const getX = (batch: BatchChartData) =>
    (xScale(batch.id) || 0) + xScale.bandwidth() / 2 - blockSize / 2;

  useEffect(() => {
    if (!pathRef.current) return;

    const line = d3
      .line<BatchChartData>()
      .x(getX)
      .y(b => yScale(b.rate));

    d3.select(pathRef.current)
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('d', line(data) || '');
  }, [data, dimensions]);

  const line = d3.line<BatchChartData>().x(getX).y(0);
  return (
    <path
      ref={pathRef}
      className="blocks-line"
      fill="none"
      stroke="white"
      strokeWidth={1.5}
      strokeDasharray={4}
      d={line(data) || ''}
    />
  );
};

export default RateLine;
