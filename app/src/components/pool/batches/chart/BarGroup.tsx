import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ANIMATION_DURATION, BatchChartData, ChartDimensions } from './chartUtils';

interface Props {
  data: BatchChartData[];
  dimensions: ChartDimensions;
  batch: BatchChartData;
  xScale: d3.ScaleBand<string>;
}

const BarGroup: React.FC<Props> = ({ data, dimensions, batch, xScale }) => {
  const volumeRef = useRef<SVGRectElement>(null);
  const ordersRef = useRef<SVGRectElement>(null);
  const [init, setInit] = useState(true); // initial load
  const { height, blocksHeight } = dimensions;

  // scale for the left y-axis
  const yScaleVolume = d3
    .scaleLinear()
    .range([height, blocksHeight])
    .domain([0, d3.max(data.map(b => b.volume)) as number]);

  // scale for the right y-axis
  const yScaleOrders = d3
    .scaleLinear()
    .range([height, blocksHeight])
    .domain([0, d3.max(data.map(b => b.orders)) as number]);

  // a scale for just the two bars
  const innerScale = d3
    .scaleBand()
    .domain(['volume', 'orders'])
    .range([0, xScale.bandwidth()])
    .padding(0.1);

  useEffect(() => {
    if (volumeRef.current) {
      d3.select(volumeRef.current)
        .attr('y', init ? height : yScaleVolume(batch.volume))
        .transition()
        .duration(ANIMATION_DURATION)
        .attr('y', yScaleVolume(batch.volume))
        .attr('height', height - yScaleVolume(batch.volume));
    }
    if (ordersRef.current) {
      d3.select(ordersRef.current)
        .attr('y', init ? height : yScaleOrders(batch.orders))
        .transition()
        .duration(ANIMATION_DURATION)
        .attr('y', yScaleOrders(batch.orders))
        .attr('height', height - yScaleOrders(batch.orders));
    }
    setInit(false);
  }, [batch, height]);

  return (
    <>
      <rect
        ref={volumeRef}
        className="bar-volume"
        x={innerScale('volume')}
        y={height}
        width={innerScale.bandwidth()}
        fill="#7fc97f"
      />
      <rect
        ref={ordersRef}
        className="bar-orders"
        x={innerScale('orders')}
        y={height}
        width={innerScale.bandwidth()}
        fill="#beaed4"
      />
    </>
  );
};

export default BarGroup;
