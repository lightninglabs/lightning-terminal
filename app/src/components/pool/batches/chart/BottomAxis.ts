import * as d3 from 'd3';
import { Chart, ChartResizeEvent, ChartUpdateEvent } from './types';

/**
 * Creates the batch id axis on the bottom of chart
 */
export default class BottomAxis {
  xAxis: d3.Selection<SVGGElement, unknown, null, undefined>;

  constructor(chart: Chart) {
    this.xAxis = chart.clipped.append('g').attr('class', 'axis-bottom');

    chart.on('update', this.update);
    chart.on('resize', this.resize);
  }

  /**
   * Updates the bottom axis based on new batch data
   */
  update = ({ chart }: ChartUpdateEvent) => {
    this.xAxis.call(d3.axisBottom(chart.scales.xScale));
  };

  /**
   * Resize the bottom axis using updated dimensions
   */
  resize = ({ dimensions }: ChartResizeEvent) => {
    this.xAxis.attr('transform', `translate(0, ${dimensions.height})`);
  };
}
