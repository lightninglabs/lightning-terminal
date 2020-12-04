import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from 'emotion-theming';
import { BatchDelta } from 'store/models/batch';
import { Theme } from 'components/theme';
import { ANIMATION_DURATION, BatchChartData, ChartDimensions } from './chartUtils';

interface Props {
  data: BatchChartData[];
  dimensions: ChartDimensions;
  batch: BatchChartData;
  xScale: d3.ScaleBand<string>;
  yScale: d3.ScaleLinear<number, number, never>;
}

const Block: React.FC<Props> = ({ dimensions, batch, xScale, yScale }) => {
  const theme = useTheme<Theme>();
  const { blockSize } = dimensions;
  const groupRef = useRef<SVGGElement>(null);

  const getXY = () => ({
    x: (xScale(batch.id) || 0) + xScale.bandwidth() / 2 - blockSize / 2,
    y: yScale(batch.rate) - blockSize / 2,
  });

  useEffect(() => {
    if (!groupRef.current) return;
    const { x, y } = getXY();
    d3.select(groupRef.current)
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('transform', `translate(${x}, ${y})`);
  }, [batch, blockSize, dimensions]);

  const deltaColors: Record<BatchDelta, string> = {
    positive: theme.colors.green,
    neutral: theme.colors.gray,
    negative: theme.colors.pink,
  };

  return (
    <g
      ref={groupRef}
      className="block-group"
      transform={`translate(${getXY().x}, ${-(yScale.range()[0] / 2)})`}
    >
      <rect
        className="block"
        width={blockSize}
        height={blockSize}
        rx={4}
        stroke="#fdc086"
        fill="#252f4a"
      />
      <text
        className="label-rate"
        x={blockSize / 2}
        y={45}
        textAnchor="middle"
        fontSize={28}
        fill="white"
      >
        {batch.rate}
      </text>
      <text
        className="label-pct'"
        x={blockSize / 2}
        y={75}
        textAnchor="middle"
        fontSize={18}
        fill={deltaColors[batch.delta]}
      >
        {batch.pctChange}
      </text>
    </g>
  );
};

export default Block;
