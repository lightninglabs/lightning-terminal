import * as d3 from 'd3';
import { Batch } from 'store/models';
import {
  BarChart,
  BlocksChart,
  BottomAxis,
  LeftAxis,
  RightAxis,
  Scales,
  Zoomer,
} from './';
import { convertData, getDimensions, hasLoadedPastData } from './chartUtils';
import LineChart from './LineChart';

import type {
  DataListener,
  SizeListener,
  ChartConfig,
  ChartDimensions,
  BatchChartData,
  Chart,
} from './types';

export default class D4Chart implements Chart {
  private _listeners: {
    data: DataListener[];
    size: SizeListener[];
  } = {
    data: [],
    size: [],
  };

  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  clipped: d3.Selection<SVGGElement, unknown, null, undefined>;

  dimensions: ChartDimensions;
  scales: Scales;
  data: BatchChartData[];

  palette: d3.ScaleOrdinal<string, string, never>;

  constructor(config: ChartConfig) {
    const { element, batches, outerWidth, outerHeight } = config;
    console.log(`D3Chart: creating chart ${outerWidth} ${outerHeight}`);
    this.data = convertData(batches);
    this.dimensions = getDimensions(outerWidth, outerHeight, batches.length);
    const { width, height, margin } = this.dimensions;

    this.svg = d3.select(element).attr('width', outerWidth).attr('height', outerHeight);

    // add clipping
    this.svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('x', margin.left + 1)
      .attr('y', margin.top)
      .attr('width', width - 1)
      .attr('height', height + margin.bottom);

    this.g = this.svg
      .append('g')
      .attr('class', 'main')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    this.clipped = this.svg
      .append('g')
      .attr('class', 'clipped')
      .attr('clip-path', 'url(#clip)')
      .append('g')
      .attr('class', 'clipped-content')
      .attr('transform', `translate(${margin.left},0)`);

    // color palette = one color per subgroup
    this.palette = d3
      .scaleOrdinal<string>()
      .domain(['volume', 'orders', 'rate'])
      .range(d3.schemeAccent);

    // create x & y scales
    this.scales = new Scales(this, this.data);
    // add chart elements
    new BottomAxis(this);
    new LeftAxis(this);
    new RightAxis(this);
    new BarChart(this);
    new LineChart(this);
    new BlocksChart(this);
    new Zoomer(this, config.fetchBatches);

    this.update(batches);
    this.resize(outerWidth, outerHeight);
  }

  update = (batches: Batch[]) => {
    const data = convertData(batches);
    // determine if we are loading batches from the past
    const pastData = hasLoadedPastData(this.data, data);
    this.data = data;
    console.log('D3Chart: updating batches', batches.length, pastData);

    const prev = this.dimensions;
    this.dimensions = getDimensions(prev.outerWidth, prev.outerHeight, batches.length);

    this._listeners.data.forEach(func => func(this.data, this, pastData, prev));
  };

  resize = (outerWidth: number, outerHeight: number) => {
    this.dimensions = getDimensions(outerWidth, outerHeight, this.data.length);
    console.log(`D3Chart: updating dimensions to ${outerWidth} ${outerHeight}`);

    const { width, height, margin } = this.dimensions;
    this.svg
      .select('#clip rect')
      .attr('width', width - 1)
      .attr('height', height + margin.bottom);

    this._listeners.size.forEach(func => func(this.dimensions, this));
  };

  onData = (listener: DataListener) => this._listeners.data.push(listener);
  onSizeChange = (listener: SizeListener) => this._listeners.size.push(listener);
}
