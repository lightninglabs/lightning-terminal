import * as d3 from 'd3';
import { Batch } from 'store/models';
import {
  ANIMATION_DURATION,
  BatchChartData,
  ChartDimensions,
  convertData,
  getDimensions,
} from './chartUtils';

type DataListener = (data: BatchChartData[], chart: D3Chart, pastData: boolean) => void;
type SizeListener = (dimensions: ChartDimensions, chart: D3Chart) => void;
type MoveListener = (e: d3.D3ZoomEvent<SVGSVGElement, unknown>, chart: D3Chart) => void;

export default class D3Chart {
  private _listeners: {
    data: DataListener[];
    size: SizeListener[];
    move: MoveListener[];
  } = {
    data: [],
    size: [],
    move: [],
  };

  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  clipped: d3.Selection<SVGGElement, unknown, null, undefined>;

  dimensions: ChartDimensions;
  scales: Scales;
  data: BatchChartData[];

  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  palette: d3.ScaleOrdinal<string, string, never>;

  constructor(
    element: SVGSVGElement,
    batches: Batch[],
    outerWidth: number,
    outerHeight: number,
  ) {
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

    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .on('zoom', (e: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        console.log('D3Chart: zoom', e.transform);
        const { left } = this.dimensions.margin;
        this.clipped.attr('transform', `translate(${left + e.transform.x}, 0)`);
      });
    this.svg
      .call(this.zoom)
      .on('wheel.zoom', null) // disable mouse-wheel zooming
      .on('wheel', (e: WheelEvent) => {
        // pan left & right using the mouse wheel
        this.zoom.translateBy(this.svg.transition().duration(10), e.deltaY, 0);
      });

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

    this.update(batches);
    this.resize(outerWidth, outerHeight);
  }

  update = (batches: Batch[]) => {
    const data = convertData(batches);
    // determine if we are loading batches from the past
    const pastData = this.data.length !== 0 && this.data[0].id === data[0].id;
    this.data = data;
    console.log('D3Chart: updating batches', batches.length, pastData);

    const prev = this.dimensions;
    this.dimensions = getDimensions(prev.outerWidth, prev.outerHeight, batches.length);
    this.resizeZoom(pastData, prev);

    this._listeners.data.forEach(func => func(this.data, this, pastData));
  };

  resize = (outerWidth: number, outerHeight: number) => {
    this.dimensions = getDimensions(outerWidth, outerHeight, this.data.length);
    console.log(`D3Chart: updating dimensions to ${outerWidth} ${outerHeight}`);

    const { width, height, margin } = this.dimensions;
    this.svg
      .select('#clip rect')
      .attr('width', width - 1)
      .attr('height', height + margin.bottom);

    this.resizeZoom();

    this._listeners.size.forEach(func => func(this.dimensions, this));
  };

  resizeZoom = (pastData?: boolean, prevDimensions?: ChartDimensions) => {
    const { width, height, totalWidth, margin } = this.dimensions;
    this.zoom
      .translateExtent([
        [0, margin.top],
        [totalWidth, height],
      ])
      .extent([
        [0, margin.top],
        [width, height],
      ]);

    if (!pastData) {
      // show the new batch
      const el = this.svg.transition().duration(ANIMATION_DURATION);
      this.zoom.translateTo(el, 0, 0, [width - totalWidth, 0]);
    } else if (pastData && prevDimensions) {
      // loading old batches, stay in the same position. the total width of the
      // clipped layer will increase due to there being more batches. in order
      // to remain in the same position, we need to pan by the difference. the
      // panning coords are anchored from the left
      const diff = prevDimensions.totalWidth - this.dimensions.totalWidth;
      console.log(
        `D3Chart: resizeZoom by ${diff}`,
        `prev ${prevDimensions.totalWidth}`,
        `new ${this.dimensions.totalWidth}`,
        width,
        diff + width,
      );
      this.zoom.translateTo(this.svg, 0, 0, [diff, 0]);
      const el = this.svg.transition().duration(ANIMATION_DURATION);
      this.zoom.translateTo(el, 0, 0, [diff + width - 150, 0]);
    }
  };

  moveChart = (e: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
    const dimensions = this.dimensions;
    const xScale = this.scales.xScale;
    console.log(
      'D3Chart: moveChart',
      e.transform,
      xScale.range(),
      dimensions.totalWidth,
      dimensions.width,
      [dimensions.width - dimensions.totalWidth, dimensions.width],
    );
    this.clipped.attr('transform', `translate(${e.transform.x}, 0)`);
    // this._listeners.move.forEach(func => func(e, this));
  };

  onData = (listener: DataListener) => this._listeners.data.push(listener);
  onSizeChange = (listener: SizeListener) => this._listeners.size.push(listener);
  onMove = (listener: MoveListener) => this._listeners.move.push(listener);
}

class Scales {
  xScale: d3.ScaleBand<string>;
  yScaleLeft: d3.ScaleLinear<number, number, never>;
  yScaleRight: d3.ScaleLinear<number, number, never>;
  yScaleBlocks: d3.ScaleLinear<number, number, never>;

  constructor(chart: D3Chart, data: BatchChartData[]) {
    const { totalWidth, height, blocksHeight, blocksPadding } = chart.dimensions;
    console.log('D3Chart: Scales.ctor totalWidth', totalWidth);
    this.xScale = d3.scaleBand().range([totalWidth, 0]).padding(0.6);
    this.yScaleLeft = d3.scaleLinear().range([height, blocksHeight]);
    this.yScaleRight = d3.scaleLinear().range([height, blocksHeight]);
    this.yScaleBlocks = d3
      .scaleLinear()
      .range([blocksHeight - blocksPadding, blocksPadding]);

    this.update(data, chart);
    chart.onData(this.update);
    chart.onSizeChange(this.resize);
    chart.onMove(this.move);
  }

  update = (data: BatchChartData[], chart: D3Chart) => {
    // bottom axis
    const { totalWidth } = chart.dimensions;
    this.xScale.domain(data.map(b => b.id)).range([totalWidth, 0]);
    // left axis
    this.yScaleLeft.domain([0, d3.max(data.map(b => b.volume)) as number]);
    // right axis
    this.yScaleRight.domain([0, d3.max(data.map(b => b.orders)) as number]);
    // top y axis
    this.yScaleBlocks.domain([0, d3.max(data.map(b => b.rate)) as number]);
  };

  resize = (d: ChartDimensions) => {
    // update axis scales
    this.xScale.range([d.totalWidth, 0]);
    this.yScaleLeft.range([d.height, d.blocksHeight]);
    this.yScaleRight.range([d.height, d.blocksHeight]);
    this.yScaleBlocks.range([d.blocksHeight - d.blocksPadding, d.blocksPadding]);
  };

  move = (e: d3.D3ZoomEvent<SVGSVGElement, unknown>, chart: D3Chart) => {
    const { totalWidth, margin } = chart.dimensions;
    this.xScale.range(
      [margin.left, totalWidth + margin.left].map(d => e.transform.applyX(d)),
    );
  };
}

class BlocksChart {
  g: d3.Selection<SVGGElement, unknown, null, undefined>;

  constructor(chart: D3Chart) {
    this.g = chart.clipped.append('g').attr('class', 'blocks-group');

    chart.onData(this.update);
    chart.onMove(this.move);
  }

  update = (data: BatchChartData[], chart: D3Chart, pastData: boolean) => {
    const { blockSize, blocksHeight } = chart.dimensions;
    const { xScale, yScaleBlocks } = chart.scales;

    const getXY = (batch: BatchChartData) => ({
      x: (xScale(batch.id) || 0) + xScale.bandwidth() / 2 - blockSize / 2,
      y: yScaleBlocks(batch.rate) - blockSize / 2,
    });

    // JOIN
    const batchGroups = this.g
      .selectAll<SVGGElement, BatchChartData>('g')
      .data(data, d => d.id);

    // EXIT
    batchGroups.exit().remove();

    // UPDATE
    batchGroups
      .transition()
      // don't animate when updating with past batches
      .duration(pastData ? 0 : ANIMATION_DURATION)
      .attr('transform', b => `translate(${getXY(b).x}, ${getXY(b).y})`);

    // ENTER
    batchGroups
      .enter()
      .append('g')
      .attr('class', 'block-group')
      .style('opacity', 0)
      .attr(
        'transform',
        b => `translate(${getXY(b).x}, ${(blocksHeight - blockSize) / 2})`,
      )
      .call(g => this.createBlock(g, chart))
      .transition()
      .duration(ANIMATION_DURATION)
      .style('opacity', 1)
      .attr('transform', b => `translate(${getXY(b).x}, ${getXY(b).y})`);
  };

  createBlock = (
    group: d3.Selection<SVGGElement, BatchChartData, SVGGElement, unknown>,
    chart: D3Chart,
  ) => {
    const { blockSize } = chart.dimensions;
    group
      .append('rect')
      .attr('class', 'block')
      .attr('width', blockSize)
      .attr('height', blockSize)
      .attr('rx', 4)
      .attr('stroke', chart.palette('rate'))
      .attr('fill', '#252f4a');
    group
      .append('text')
      .attr('class', 'label-rate')
      .attr('x', blockSize / 2)
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .attr('font-size', 28)
      .attr('fill', 'white')
      .text(d => d.rate);
    group
      .append('text')
      .attr('class', d => `label-pct ${d.delta}`)
      .attr('x', blockSize / 2)
      .attr('y', 75)
      .attr('text-anchor', 'middle')
      .attr('font-size', 18)
      .text(d => d.pctChange);
  };

  move = (e: d3.D3ZoomEvent<SVGSVGElement, unknown>, chart: D3Chart) => {
    // this.draw(chart);
  };
}

class LineChart {
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
    chart.onMove(this.move);
  }

  update = (data: BatchChartData[], chart: D3Chart, pastData: boolean) => {
    this.draw(chart, !pastData);
  };

  move = (e: d3.D3ZoomEvent<SVGSVGElement, unknown>, chart: D3Chart) => {
    this.draw(chart);
  };

  draw = (chart: D3Chart, animated = false) => {
    const { xScale, yScaleBlocks } = chart.scales;

    this.line
      .x(b => (xScale(b.id) || 0) + xScale.bandwidth() / 2)
      .y(b => yScaleBlocks(b.rate));

    this.path
      .transition()
      .duration(animated ? ANIMATION_DURATION : 0)
      .attr('d', this.line(chart.data) || '');
  };
}

class BarChart {
  gVolume: d3.Selection<SVGGElement, unknown, null, undefined>;
  gOrders: d3.Selection<SVGGElement, unknown, null, undefined>;
  innerScale: d3.ScaleBand<string>;

  constructor(chart: D3Chart) {
    this.gVolume = chart.clipped.append('g').attr('class', 'bars-volume');
    this.gOrders = chart.clipped.append('g').attr('class', 'bars-orders');
    // a scale for just the two bars
    this.innerScale = d3
      .scaleBand()
      .domain(['volume', 'orders'])
      .range([0, chart.scales.xScale.bandwidth()])
      .padding(0.8);

    chart.onData(this.update);
    chart.onSizeChange(this.resize);
    chart.onMove(this.move);
  }

  update = (data: BatchChartData[], chart: D3Chart) => {
    this.innerScale.range([0, chart.scales.xScale.bandwidth()]);

    this.updateVolume(data, chart);
    this.updateOrders(data, chart);
  };

  updateVolume = (data: BatchChartData[], chart: D3Chart) => {
    const { xScale, yScaleLeft } = chart.scales;
    const { height } = chart.dimensions;

    // JOIN
    const bars = this.gVolume
      .selectAll<SVGRectElement, BatchChartData>('rect')
      .data(data, d => d.id);

    // EXIT
    bars
      .exit<BatchChartData>()
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('transform', d => `translate(${xScale(d.id)}, 0)`)
      .remove();

    // UPDATE
    bars
      .attr('x', d => (xScale(d.id) || 0) + (this.innerScale('volume') || 0))
      .attr('width', this.innerScale.bandwidth())
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('y', d => yScaleLeft(d.volume))
      .attr('height', d => height - yScaleLeft(d.volume));

    // ENTER
    bars
      .enter()
      .append('rect')
      .attr('className', 'bar-volume')
      .attr('x', d => (xScale(d.id) || 0) + (this.innerScale('volume') || 0))
      .attr('y', height)
      .attr('width', this.innerScale.bandwidth())
      .attr('height', 0)
      .attr('fill', chart.palette('volume'))
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('y', d => yScaleLeft(d.volume))
      .attr('height', d => height - yScaleLeft(d.volume));
  };

  updateOrders = (data: BatchChartData[], chart: D3Chart) => {
    const { xScale, yScaleRight } = chart.scales;
    const { height } = chart.dimensions;

    // JOIN
    const bars = this.gOrders
      .selectAll<SVGRectElement, BatchChartData>('rect')
      .data(data, d => d.id);

    // EXIT
    bars
      .exit<BatchChartData>()
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('transform', d => `translate(${xScale(d.id)}, 0)`)
      .remove();

    // UPDATE
    bars
      .attr('width', this.innerScale.bandwidth())
      .attr('x', d => (xScale(d.id) || 0) + (this.innerScale('orders') || 0))
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('y', d => yScaleRight(d.orders))
      .attr('height', d => height - yScaleRight(d.orders));

    // ENTER
    bars
      .enter()
      .append('rect')
      .attr('className', 'bar-orders')
      .attr('x', d => (xScale(d.id) || 0) + (this.innerScale('orders') || 0))
      .attr('y', height)
      .attr('width', this.innerScale.bandwidth())
      .attr('height', 0)
      .attr('fill', chart.palette('orders'))
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('y', d => yScaleRight(d.orders))
      .attr('height', d => height - yScaleRight(d.orders));
  };

  resize = (d: ChartDimensions, chart: D3Chart) => {
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

  move = (e: d3.D3ZoomEvent<SVGSVGElement, unknown>, chart: D3Chart) => {
    const { xScale } = chart.scales;
    this.innerScale = d3
      .scaleBand()
      .domain(['volume', 'orders'])
      .range([0, xScale.bandwidth()])
      .padding(0.1);
    this.gVolume
      .selectAll<SVGRectElement, BatchChartData>('rect')
      .attr('x', d => (xScale(d.id) || 0) + (this.innerScale('volume') || 0));
    this.gOrders
      .selectAll<SVGRectElement, BatchChartData>('rect')
      .attr('x', d => (xScale(d.id) || 0) + (this.innerScale('orders') || 0));
  };
}

class BottomAxis {
  xAxis: d3.Selection<SVGGElement, unknown, null, undefined>;

  constructor(chart: D3Chart) {
    this.xAxis = chart.clipped.append('g').attr('class', 'axis-bottom');

    chart.onData(this.update);
    chart.onSizeChange(this.resize);
    chart.onMove(this.move);
  }

  update = (data: BatchChartData[], chart: D3Chart) => {
    this.xAxis.call(d3.axisBottom(chart.scales.xScale));
  };

  resize = (d: ChartDimensions) => {
    this.xAxis.attr('transform', `translate(0, ${d.height})`);
  };

  move = (e: d3.D3ZoomEvent<SVGSVGElement, unknown>, chart: D3Chart) => {
    this.xAxis.call(d3.axisBottom(chart.scales.xScale));
  };
}

class LeftAxis {
  yAxisLeft: d3.Selection<SVGGElement, unknown, null, undefined>;
  yLabelLeft: d3.Selection<SVGTextElement, unknown, null, undefined>;

  constructor(chart: D3Chart) {
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

  update = (data: BatchChartData[], chart: D3Chart) => {
    this.yAxisLeft
      .transition()
      .duration(ANIMATION_DURATION)
      .call(
        d3
          .axisLeft<number>(chart.scales.yScaleLeft)
          .ticks(5)
          .tickFormat(v => `${(v / 1000000).toFixed(1)}M`),
      );
  };

  resize = (d: ChartDimensions) => {
    this.yLabelLeft.attr('x', -d.blocksHeight);
  };
}

class RightAxis {
  yAxisRight: d3.Selection<SVGGElement, unknown, null, undefined>;
  yLabelRight: d3.Selection<SVGTextElement, unknown, null, undefined>;

  constructor(chart: D3Chart) {
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

  update = (data: BatchChartData[], chart: D3Chart) => {
    let axis = d3.axisRight<number>(chart.scales.yScaleRight);
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
