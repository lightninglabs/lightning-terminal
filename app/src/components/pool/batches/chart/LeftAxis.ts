import * as d3 from 'd3';
import { ANIMATION_DURATION } from './chartUtils';
import { BatchChartData, Chart, ChartDimensions } from './types';

export default class LeftAxis {
  yAxisLeft: d3.Selection<SVGGElement, unknown, null, undefined>;
  yLabelLeft: d3.Selection<SVGTextElement, unknown, null, undefined>;

  constructor(chart: Chart) {
    this.yAxisLeft = chart.g.append('g').attr('class', 'y-axis-left');
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

    chart.onData(this.update);
    chart.onSizeChange(this.resize);
  }

  update = (data: BatchChartData[], chart: Chart) => {
    this.yAxisLeft
      .transition()
      .duration(ANIMATION_DURATION)
      .call(
        d3
          .axisLeft<number>(chart.scales.yScaleVolume)
          .ticks(5)
          .tickFormat(v => `${(v / 1000000).toFixed(1)}M`),
      );
  };

  resize = (d: ChartDimensions) => {
    this.yLabelLeft.attr('x', -d.blocksHeight);
  };
}
