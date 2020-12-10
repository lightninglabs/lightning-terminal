import * as d3 from 'd3';
import { BatchChartData, Chart, ChartResizeEvent, ChartUpdateEvent } from './types';

/**
 * Creates the scales for the multiple axes on the chart
 */
export default class Scales {
  xScale: d3.ScaleBand<string>;
  yScaleVolume: d3.ScaleLinear<number, number, never>;
  yScaleOrders: d3.ScaleLinear<number, number, never>;
  yScaleRates: d3.ScaleLinear<number, number, never>;

  constructor(chart: Chart, data: BatchChartData[]) {
    const { totalWidth, height, blocksHeight, blocksPadding } = chart.dimensions;
    this.xScale = d3.scaleBand().range([totalWidth, 0]).padding(0.6);
    this.yScaleVolume = d3.scaleLinear().range([height, blocksHeight]);
    this.yScaleOrders = d3.scaleLinear().range([height, blocksHeight]);
    this.yScaleRates = d3.scaleLog().range([blocksHeight - blocksPadding, blocksPadding]);

    this.update({ data, chart, pastData: false, prevDimensions: chart.dimensions });

    chart.on('update', this.update);
    chart.on('resize', this.resize);
  }

  /**
   * Updates the axes based on new batch data
   */
  update = ({ data, chart }: ChartUpdateEvent) => {
    // bottom axis
    const { totalWidth } = chart.dimensions;
    this.xScale.domain(data.map(b => b.id)).range([totalWidth, 0]);
    // left axis
    this.yScaleVolume.domain([0, d3.max(data.map(b => b.volume)) as number]);
    // right axis
    this.yScaleOrders.domain([0, d3.max(data.map(b => b.orders)) as number]);
    // top y axis
    this.yScaleRates.domain([
      d3.min(data.map(b => b.rate)) as number,
      d3.max(data.map(b => b.rate)) as number,
    ]);
  };

  /**
   * Resize the axes using updated dimensions
   */
  resize = ({ dimensions }: ChartResizeEvent) => {
    const { height, totalWidth, blocksHeight, blocksPadding } = dimensions;
    // update axis scales
    this.xScale.range([totalWidth, 0]);
    this.yScaleVolume.range([height, blocksHeight]);
    this.yScaleOrders.range([height, blocksHeight]);
    this.yScaleRates.range([blocksHeight - blocksPadding, blocksPadding]);
  };
}
