import * as d3 from 'd3';
import { BatchChartData, Chart, ChartUpdateEvent } from './types';

/**
 * Creates the batch blocks on the chart
 */
export default class BlocksChart {
  g: d3.Selection<SVGGElement, unknown, null, undefined>;

  constructor(chart: Chart) {
    this.g = chart.clipped.append('g').attr('class', 'blocks-group');

    chart.on('update', this.update);
  }

  /**
   * Updates the batch blocks based on the new data
   */
  update = ({ data, chart, pastData }: ChartUpdateEvent) => {
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
      .duration(pastData ? 0 : chart.duration)
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
      .duration(chart.duration)
      .style('opacity', 1)
      .attr('transform', b => `translate(${getXY(b).x}, ${getXY(b).y})`);
  };

  /**
   * Adds a single block to the chart
   */
  createBlock = (
    group: d3.Selection<SVGGElement, BatchChartData, SVGGElement, unknown>,
    chart: Chart,
  ) => {
    const { blockSize } = chart.dimensions;
    group
      .append('rect')
      .attr('class', 'block')
      .attr('width', blockSize)
      .attr('height', blockSize)
      .attr('rx', 4)
      .attr('stroke', chart.palette('rate'));

    group
      .append('text')
      .attr('class', 'block-label-rate')
      .attr('x', blockSize / 2)
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .attr('font-size', 28)
      .text(d => d.rate)
      .append('tspan')
      .attr('class', 'block-label-suffix')
      .attr('font-size', 14)
      .text(' bps');

    group
      .append('text')
      .attr('class', d => `block-label-pct ${d.delta}`)
      .attr('x', blockSize / 2)
      .attr('y', 75)
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .text(d => d.pctChange);
  };
}
