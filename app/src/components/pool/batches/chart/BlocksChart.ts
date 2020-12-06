import * as d3 from 'd3';

import { ANIMATION_DURATION, BatchChartData } from '../chart/chartUtils';
import { D3Chart } from './';

export default class BlocksChart {
  g: d3.Selection<SVGGElement, unknown, null, undefined>;

  constructor(chart: D3Chart) {
    this.g = chart.clipped.append('g').attr('class', 'blocks-group');

    chart.onData(this.update);
  }

  update = (data: BatchChartData[], chart: D3Chart, pastData: boolean) => {
    const { blockSize, blocksHeight } = chart.dimensions;
    const { xScale, yScaleRates } = chart.scales;

    const getXY = (batch: BatchChartData) => ({
      x: (xScale(batch.id) || 0) + xScale.bandwidth() / 2 - blockSize / 2,
      y: yScaleRates(batch.rate) - blockSize / 2,
    });

    // JOIN
    const batchGroups = this.g
      .selectAll<SVGGElement, BatchChartData>('g')
      .data(data, d => d.id);

    // EXIT
    batchGroups.exit().remove();

    // UPDATE
    batchGroups
      .transition()
      // don't animate when updating with past batches
      .duration(pastData ? 0 : ANIMATION_DURATION)
      .attr('transform', b => `translate(${getXY(b).x}, ${getXY(b).y})`);

    // ENTER
    batchGroups
      .enter()
      .append('g')
      .attr('class', 'block-group')
      .style('opacity', 0)
      .attr(
        'transform',
        b => `translate(${getXY(b).x}, ${(blocksHeight - blockSize) / 2})`,
      )
      .call(g => this.createBlock(g, chart))
      .transition()
      .duration(ANIMATION_DURATION)
      .style('opacity', 1)
      .attr('transform', b => `translate(${getXY(b).x}, ${getXY(b).y})`);
  };

  createBlock = (
    group: d3.Selection<SVGGElement, BatchChartData, SVGGElement, unknown>,
    chart: D3Chart,
  ) => {
    const { blockSize } = chart.dimensions;
    group
      .append('rect')
      .attr('class', 'block')
      .attr('width', blockSize)
      .attr('height', blockSize)
      .attr('rx', 4)
      .attr('stroke', chart.palette('rate'))
      .attr('fill', '#252f4a');
    group
      .append('text')
      .attr('class', 'label-rate')
      .attr('x', blockSize / 2)
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .attr('font-size', 28)
      .attr('fill', 'white')
      .text(d => d.rate);
    group
      .append('text')
      .attr('class', d => `label-pct ${d.delta}`)
      .attr('x', blockSize / 2)
      .attr('y', 75)
      .attr('text-anchor', 'middle')
      .attr('font-size', 18)
      .text(d => d.pctChange);
  };
}
