import * as d3 from 'd3';
import { Chart, ChartResizeEvent, ChartUpdateEvent } from './types';

/**
 * Creates the Batch Volume axis on the chart
 */
export default class LeftAxis {
  yAxisLeft: d3.Selection<SVGGElement, unknown, null, undefined>;
  yLabelLeft: d3.Selection<SVGTextElement, unknown, null, undefined>;

  constructor(chart: Chart) {
    this.yAxisLeft = chart.main.append('g').attr('class', 'y-axis-left');
    this.yLabelLeft = this.yAxisLeft
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', 0)
      .attr('y', 6)
      .attr('dy', '.71em')
      .attr('font-size', 18)
      .style('text-anchor', 'end')
      .style('fill', chart.palette('volume'))
      .text('volume');

    chart.on('update', this.update);
    chart.on('resize', this.resize);
  }

  /**
   * Updates the left axis based on new batch data
   */
  update = ({ chart }: ChartUpdateEvent) => {
    this.yAxisLeft
      .transition()
      .duration(chart.duration)
      .call(
        d3
          .axisLeft<number>(chart.scales.yScaleVolume)
          .ticks(5)
          .tickFormat(v => `${Math.round(v / 1000000)}M`),
      );
  };

  /**
   * Resize left axis using updated dimensions
   */
  resize = ({ dimensions }: ChartResizeEvent) => {
    this.yLabelLeft.attr('x', -dimensions.blocksHeight);
  };
}
