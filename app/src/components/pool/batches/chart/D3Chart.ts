import { LeaseDuration } from 'types/state';
import * as d3 from 'd3';
import BaseEmitter from 'util/BaseEmitter';
import { Batch } from 'store/models';
import {
  BarChart,
  BlocksChart,
  BottomAxis,
  LeftAxis,
  LineChart,
  RightAxis,
  Scales,
  Zoomer,
} from './';

import type {
  ChartConfig,
  ChartDimensions,
  BatchChartData,
  Chart,
  ChartEvents,
} from './types';
const TOP_HEIGHT_RATIO = 0.6;
const TOP_PADDING = 0.2;
const MARGIN = { top: 0, right: 30, bottom: 30, left: 50 };
const COL_WIDTH = 150;
const ANIMATION_DURATION = process.env.NODE_ENV === 'test' ? 0 : 1000;

/**
 * A wrapper class used to build the full d3 chart
 */
export default class D3Chart extends BaseEmitter<ChartEvents> implements Chart {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  main: d3.Selection<SVGGElement, unknown, null, undefined>;
  clipped: d3.Selection<SVGGElement, unknown, null, undefined>;

  dimensions: ChartDimensions;
  scales: Scales;
  data: BatchChartData[];
  market: LeaseDuration;

  palette: d3.ScaleOrdinal<string, string, never>;
  duration = ANIMATION_DURATION;

  constructor(config: ChartConfig) {
    super();

    const { element, batches, market, outerWidth, outerHeight } = config;
    this.data = this._convertData(batches);
    this.market = market;
    this.dimensions = this._getDimensions(outerWidth, outerHeight, batches.length);
    const { width, height, margin } = this.dimensions;

    // save a reference to the main SVG dome element
    this.svg = d3.select(element).attr('width', outerWidth).attr('height', outerHeight);

    // add clipping of the chart contents
    this.svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('x', margin.left + 1)
      .attr('y', margin.top)
      .attr('width', width - 1)
      .attr('height', height + margin.bottom);

    // add a group to hold the main content that isn't clipped
    this.main = this.svg
      .append('g')
      .attr('class', 'main')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // add a group to hold the clipped content
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

    this.update(batches, market);
    this.resize(outerWidth, outerHeight);
  }

  /**
   * Updates the chart with a new list of batches
   */
  update = (batches: Batch[], market: number) => {
    const data = this._convertData(batches);
    // determine if we are loading batches from the past. if the market changes, then
    // we are not loading new data, just a different subset of batches
    let pastData = this._hasLoadedPastData(this.data, data);
    // if the market changes, then we are not loading new data, just a different
    // subset of batches
    if (this.market !== market) pastData = false;

    this.data = data;
    this.market = market;

    const prev = this.dimensions;
    this.dimensions = this._getDimensions(
      prev.outerWidth,
      prev.outerHeight,
      batches.length,
    );

    this.emit('update', { data: this.data, chart: this, pastData, prevDimensions: prev });
  };

  /**
   * Updates the positions of the chart components based on the new SVG size
   * @param outerWidth the new outer width
   * @param outerHeight the new outer height
   */
  resize = (outerWidth: number, outerHeight: number) => {
    this.dimensions = this._getDimensions(outerWidth, outerHeight, this.data.length);

    const { width, height, margin } = this.dimensions;
    this.svg
      .select('#clip rect')
      .attr('width', width - 1)
      .attr('height', height + margin.bottom);

    this.emit('resize', { dimensions: this.dimensions, chart: this });
  };

  /**
   * Calculates the dimensions of different portions of the chart based on the total size
   * and number of batches
   */
  private _getDimensions = (
    outerWidth: number,
    outerHeight: number,
    batchCount: number,
  ): ChartDimensions => {
    return {
      outerWidth,
      outerHeight,
      width: outerWidth - MARGIN.left - MARGIN.right,
      height: outerHeight - MARGIN.top - MARGIN.bottom,
      margin: MARGIN,
      blocksHeight: outerHeight * TOP_HEIGHT_RATIO,
      blocksPadding: outerHeight * TOP_HEIGHT_RATIO * TOP_PADDING,
      blockSize: 100,
      totalWidth: Math.max(
        batchCount * COL_WIDTH,
        outerWidth - MARGIN.left - MARGIN.right,
      ),
    };
  };

  /**
   * Converts a list of Batch models into a subset of data displayed int he chart
   */
  private _convertData = (batches: Batch[]): BatchChartData[] => {
    const pctToText = (p: number) => (p === 0 ? '--' : `${p > 0 ? '+' : ''}${p}%`);

    return batches.slice().map(b => ({
      id: b.batchIdEllipsed,
      volume: +b.volume,
      orders: b.ordersCount,
      rate: b.basisPoints,
      pctChange: pctToText(b.pctChange),
      delta: b.delta,
    }));
  };

  /**
   * Determines if the new batch data has been updated with batches added to the front
   * or back of the list
   */
  private _hasLoadedPastData = (oldData: BatchChartData[], newData: BatchChartData[]) => {
    // there is no local data, so this is all fresh data
    if (oldData.length === 0) return false;
    // the data is the same length so we didn't add anything
    if (oldData.length === newData.length) return false;
    // the first batches are different, so we addd to the front
    if (oldData[0].id !== newData[0].id) return false;

    return true;
  };
}
