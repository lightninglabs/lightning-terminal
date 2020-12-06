import * as d3 from 'd3';
import { ANIMATION_DURATION } from './chartUtils';
import { BatchChartData, Chart, ChartDimensions } from './types';

export default class RightAxis {
  yAxisRight: d3.Selection<SVGGElement, unknown, null, undefined>;
  yLabelRight: d3.Selection<SVGTextElement, unknown, null, undefined>;

  constructor(chart: Chart) {
    this.yAxisRight = chart.g.append('g').attr('class', 'y-axis-right');
    this.yLabelRight = this.yAxisRight
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', 0)
      .attr('y', -20)
      .attr('dy', '.71em')
      .attr('font-size', 18)
      .style('text-anchor', 'end')
      .style('fill', chart.palette('orders'))
      .text('# orders');

    chart.onData(this.update);
    chart.onSizeChange(this.resize);
  }

  update = (data: BatchChartData[], chart: Chart) => {
    let axis = d3.axisRight<number>(chart.scales.yScaleOrders);
    const max = d3.max(data.map(d => d.orders));
    if (max && max < 10) {
      axis = axis.ticks(max);
    }
    this.yAxisRight.transition().duration(ANIMATION_DURATION).call(axis);
  };

  resize = (d: ChartDimensions) => {
    this.yAxisRight.attr('transform', `translate(${d.width}, 0)`);
    this.yLabelRight.attr('x', -d.blocksHeight);
  };
}
