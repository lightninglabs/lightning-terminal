import * as d3 from 'd3';

import { ANIMATION_DURATION, BatchChartData } from '../chart/chartUtils';
import { D3Chart } from './';

export default class LineChart {
  path: d3.Selection<SVGPathElement, unknown, null, undefined>;
  line: d3.Line<BatchChartData>;

  constructor(chart: D3Chart) {
    const { xScale } = chart.scales;
    this.line = d3
      .line<BatchChartData>()
      .x(b => (xScale(b.id) || 0) + xScale.bandwidth() / 2)
      .y(chart.dimensions.blocksHeight / 2);

    this.path = chart.clipped
      .append('path')
      .attr('class', 'blocks-line')
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', 4)
      .attr('d', this.line(chart.data) || '');

    chart.onData(this.update);
  }

  update = (data: BatchChartData[], chart: D3Chart, pastData: boolean) => {
    const { xScale, yScaleRates } = chart.scales;

    this.line
      .x(b => (xScale(b.id) || 0) + xScale.bandwidth() / 2)
      .y(b => yScaleRates(b.rate));

    this.path
      .transition()
      .duration(pastData ? 0 : ANIMATION_DURATION)
      .attr('d', this.line(chart.data) || '');
  };
}
