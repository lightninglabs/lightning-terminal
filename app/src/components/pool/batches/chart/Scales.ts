import * as d3 from 'd3';
import { BatchChartData, Chart, ChartDimensions } from './types';

export default class Scales {
  xScale: d3.ScaleBand<string>;
  yScaleVolume: d3.ScaleLinear<number, number, never>;
  yScaleOrders: d3.ScaleLinear<number, number, never>;
  yScaleRates: d3.ScaleLinear<number, number, never>;

  constructor(chart: Chart, data: BatchChartData[]) {
    const { totalWidth, height, blocksHeight, blocksPadding } = chart.dimensions;
    console.log('D3Chart: Scales.ctor totalWidth', totalWidth);
    this.xScale = d3.scaleBand().range([totalWidth, 0]).padding(0.6);
    this.yScaleVolume = d3.scaleLinear().range([height, blocksHeight]);
    this.yScaleOrders = d3.scaleLinear().range([height, blocksHeight]);
    this.yScaleRates = d3
      .scaleLinear()
      .range([blocksHeight - blocksPadding, blocksPadding]);

    this.update(data, chart);
    chart.onData(this.update);
    chart.onSizeChange(this.resize);
  }

  update = (data: BatchChartData[], chart: Chart) => {
    // bottom axis
    const { totalWidth } = chart.dimensions;
    this.xScale.domain(data.map(b => b.id)).range([totalWidth, 0]);
    // left axis
    this.yScaleVolume.domain([0, d3.max(data.map(b => b.volume)) as number]);
    // right axis
    this.yScaleOrders.domain([0, d3.max(data.map(b => b.orders)) as number]);
    // top y axis
    this.yScaleRates.domain([0, d3.max(data.map(b => b.rate)) as number]);
  };

  resize = (d: ChartDimensions) => {
    // update axis scales
    this.xScale.range([d.totalWidth, 0]);
    this.yScaleVolume.range([d.height, d.blocksHeight]);
    this.yScaleOrders.range([d.height, d.blocksHeight]);
    this.yScaleRates.range([d.blocksHeight - d.blocksPadding, d.blocksPadding]);
  };
}
