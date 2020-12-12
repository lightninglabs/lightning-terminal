import * as d3 from 'd3';
import { BatchChartData, Chart, ChartResizeEvent, ChartUpdateEvent } from './types';

/**
 * Creates the volume & order count bar chart
 */
export default class BarChart {
  gVolume: d3.Selection<SVGGElement, unknown, null, undefined>;
  gOrders: d3.Selection<SVGGElement, unknown, null, undefined>;
  innerScale: d3.ScaleBand<string>;

  constructor(chart: Chart) {
    this.gVolume = chart.clipped.append('g').attr('class', 'bars-volume');
    this.gOrders = chart.clipped.append('g').attr('class', 'bars-orders');
    // a scale for just the two bars
    this.innerScale = d3
      .scaleBand()
      .domain(['volume', 'orders'])
      .range([0, chart.scales.xScale.bandwidth()])
      .padding(0.8);

    chart.on('update', this.update);
    chart.on('resize', this.resize);
  }

  /**
   * Updated the volume and order count bars on the chart
   */
  update = ({ data, chart }: ChartUpdateEvent) => {
    this.innerScale.range([0, chart.scales.xScale.bandwidth()]);

    this.updateVolume(data, chart);
    this.updateOrders(data, chart);
  };

  /**
   * Updated the volume bars on the chart
   */
  updateVolume = (data: BatchChartData[], chart: Chart) => {
    const { xScale, yScaleVolume } = chart.scales;
    const { height } = chart.dimensions;

    // JOIN
    const bars = this.gVolume
      .selectAll<SVGRectElement, BatchChartData>('rect')
      .data(data, d => d.id);

    // EXIT
    bars
      .exit<BatchChartData>()
      .transition()
      .duration(chart.duration)
      .attr('transform', d => `translate(${xScale(d.id)}, 0)`)
      .remove();

    // UPDATE
    bars
      .attr('x', d => (xScale(d.id) || 0) + (this.innerScale('volume') || 0))
      .attr('width', this.innerScale.bandwidth())
      .transition()
      .duration(chart.duration)
      .attr('y', d => yScaleVolume(d.volume))
      .attr('height', d => height - yScaleVolume(d.volume));

    // ENTER
    bars
      .enter()
      .append('rect')
      .attr('class', 'bar-volume')
      .attr('x', d => (xScale(d.id) || 0) + (this.innerScale('volume') || 0))
      .attr('y', height)
      .attr('width', this.innerScale.bandwidth())
      .attr('height', 0)
      .attr('fill', chart.palette('volume'))
      .transition()
      .duration(chart.duration)
      .attr('y', d => yScaleVolume(d.volume))
      .attr('height', d => height - yScaleVolume(d.volume));
  };

  /**
   * Updated the order count bars on the chart
   */
  updateOrders = (data: BatchChartData[], chart: Chart) => {
    const { xScale, yScaleOrders } = chart.scales;
    const { height } = chart.dimensions;

    // JOIN
    const bars = this.gOrders
      .selectAll<SVGRectElement, BatchChartData>('rect')
      .data(data, d => d.id);

    // EXIT
    bars
      .exit<BatchChartData>()
      .transition()
      .duration(chart.duration)
      .attr('transform', d => `translate(${xScale(d.id)}, 0)`)
      .remove();

    // UPDATE
    bars
      .attr('width', this.innerScale.bandwidth())
      .attr('x', d => (xScale(d.id) || 0) + (this.innerScale('orders') || 0))
      .transition()
      .duration(chart.duration)
      .attr('y', d => yScaleOrders(d.orders))
      .attr('height', d => height - yScaleOrders(d.orders));

    // ENTER
    bars
      .enter()
      .append('rect')
      .attr('class', 'bar-orders')
      .attr('x', d => (xScale(d.id) || 0) + (this.innerScale('orders') || 0))
      .attr('y', height)
      .attr('width', this.innerScale.bandwidth())
      .attr('height', 0)
      .attr('fill', chart.palette('orders'))
      .transition()
      .duration(chart.duration)
      .attr('y', d => yScaleOrders(d.orders))
      .attr('height', d => height - yScaleOrders(d.orders));
  };

  /**
   * Updates the scale and bars based on the new chart dimensions
   */
  resize = ({ chart }: ChartResizeEvent) => {
    const { xScale } = chart.scales;
    this.innerScale = d3
      .scaleBand()
      .domain(['volume', 'orders'])
      .range([0, xScale.bandwidth()])
      .padding(0.1);
    this.gVolume
      .selectAll<SVGRectElement, BatchChartData>('rect')
      .attr('width', this.innerScale.bandwidth())
      .attr('x', d => (xScale(d.id) || 0) + (this.innerScale('volume') || 0));
    this.gOrders
      .selectAll<SVGRectElement, BatchChartData>('rect')
      .attr('width', this.innerScale.bandwidth())
      .attr('x', d => (xScale(d.id) || 0) + (this.innerScale('orders') || 0));
  };
}
