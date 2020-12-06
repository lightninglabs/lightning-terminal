import * as d3 from 'd3';

import { BatchChartData, ChartDimensions } from '../chart/chartUtils';
import { D3Chart } from './';

export default class BottomAxis {
  xAxis: d3.Selection<SVGGElement, unknown, null, undefined>;

  constructor(chart: D3Chart) {
    this.xAxis = chart.clipped.append('g').attr('class', 'axis-bottom');

    chart.onData(this.update);
    chart.onSizeChange(this.resize);
  }

  update = (data: BatchChartData[], chart: D3Chart) => {
    this.xAxis.call(d3.axisBottom(chart.scales.xScale));
  };

  resize = (d: ChartDimensions) => {
    this.xAxis.attr('transform', `translate(0, ${d.height})`);
  };
}
