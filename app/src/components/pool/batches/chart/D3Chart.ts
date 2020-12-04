import * as d3 from 'd3';
import { Batch } from 'store/models';
import { BatchDelta } from 'store/models/batch';

const margin = {
  top: 0,
  right: 40,
  bottom: 20,
  left: 40,
};
const duration = 1000;
const deltaColors = ['#848a99', '#46E80E', '#f5406e'];

interface BatchChartData {
  id: string;
  volume: number;
  orders: number;
  rate: number;
  pctChange: number;
  delta: BatchDelta;
}

export default class D3Chart {
  width = 0;
  height = 0;
  topSectionHeight = 0;
  blockSize = 0;
  root: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  xScale: d3.ScaleBand<string>;
  xAxis: d3.Selection<SVGGElement, unknown, null, undefined>;
  yScaleLeft: d3.ScaleLinear<number, number, never>;
  yAxisLeft: d3.Selection<SVGGElement, unknown, null, undefined>;
  yLabelLeft: d3.Selection<SVGTextElement, unknown, null, undefined>;
  yScaleRight: d3.ScaleLinear<number, number, never>;
  yAxisRight: d3.Selection<SVGGElement, unknown, null, undefined>;
  yLabelRight: d3.Selection<SVGTextElement, unknown, null, undefined>;
  yScaleBlocks: d3.ScaleLinear<number, number, never>;
  topGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  palette: d3.ScaleOrdinal<string, string, never>;
  deltaPalette: d3.ScaleOrdinal<BatchDelta, string, never>;

  constructor(element: SVGSVGElement, batches: Batch[], width: number, height: number) {
    console.log(`D3Chart: creating chart ${width} ${height}`);
    this.root = d3
      // .attr('style', 'border: 1px solid white')
      .select(element);

    this.svg = this.root.append('g');

    this.xScale = d3.scaleBand().range([0, width]).padding(0.4);
    this.xAxis = this.svg.append('g').attr('class', 'axis-bottom');
    this.yScaleLeft = d3.scaleLinear().range([height, 0]);
    this.yAxisLeft = this.svg.append('g').attr('class', 'y-axis-left');
    this.yScaleRight = d3.scaleLinear().range([height, 0]);
    this.yAxisRight = this.svg.append('g').attr('class', 'y-axis-right');
    this.yScaleBlocks = d3.scaleLinear().range([0, 0]);
    this.topGroup = this.svg.append('g').attr('class', 'top-group');

    // color palette = one color per subgroup
    this.palette = d3
      .scaleOrdinal<string>()
      .domain(['volume', 'orders', 'rate'])
      .range(d3.schemeAccent);
    this.deltaPalette = d3
      .scaleOrdinal<BatchDelta, string>()
      .range(deltaColors)
      .domain(['neutral', 'positive', 'negative'] as BatchDelta[]);

    // add axis labels
    this.yLabelLeft = this.yAxisLeft
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', 0)
      .attr('y', 6)
      .attr('dy', '.71em')
      .attr('font-size', 18)
      .style('text-anchor', 'end')
      .style('fill', this.palette('volume'))
      .text('volume');
    this.yLabelRight = this.yAxisRight
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', 0)
      .attr('y', -20)
      .attr('dy', '.71em')
      .attr('font-size', 18)
      .style('text-anchor', 'end')
      .style('fill', this.palette('orders'))
      .text('# orders');

    this.update(batches);
    this.updateSize(width, height);
  }

  updateSize(width: number, height: number) {
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    if (innerWidth === this.width && innerHeight === this.height) return;

    console.log(`D3Chart: updating dimensions to ${width} ${height}`);
    this.width = innerWidth;
    this.height = innerHeight;
    this.topSectionHeight = this.height * 0.35;
    this.blockSize = Math.max(this.width * 0.05, 100);
    this.root
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    this.svg.attr('transform', `translate(${margin.left}, ${margin.top})`);
    this.xAxis.attr('transform', `translate(0, ${this.height})`);
    this.yAxisRight.attr('transform', `translate(${this.width}, 0)`);

    this.yLabelLeft.attr('x', -this.topSectionHeight);
    this.yLabelRight.attr('x', -this.topSectionHeight);

    // update axis scales
    this.xScale.range([0, this.width]);
    this.yScaleLeft.range([this.height, this.topSectionHeight]);
    this.yScaleRight.range([this.height, this.topSectionHeight]);

    const topPadding = this.topSectionHeight * 0.4;
    this.yScaleBlocks.range([this.topSectionHeight - topPadding * 2, 0]);
    this.topGroup.attr('transform', `translate(0, ${topPadding})`);
    this.topGroup
      .selectAll<SVGGElement, BatchChartData>('g')
      .attr(
        'transform',
        d =>
          `translate(${this.xScale(d.id)}, ${
            this.yScaleBlocks(d.rate) - this.blockSize / 2
          })`,
      );
  }

  update(batches: Batch[]) {
    console.log('D3Chart: updating batches', batches.length);

    // map data to what we need for the chart
    const data: BatchChartData[] = batches
      .slice()
      .reverse()
      .map(b => ({
        id: b.batchTxIdEllipsed,
        volume: +b.volume,
        orders: b.ordersCount,
        rate: b.clearingPriceRate,
        pctChange: b.pctChange,
        delta: b.delta,
      }));

    // update different elements on the chart
    this.updateAxis(data);
    this.updateBars(data);
    this.updateBlocks(data);
  }

  updateAxis(data: BatchChartData[]) {
    // bottom axis
    this.xScale.domain(data.map(b => b.id));
    this.xAxis.transition().duration(duration).call(d3.axisBottom(this.xScale));

    // left axis
    this.yScaleLeft.domain([0, d3.max(data.map(b => b.volume)) as number]);
    this.yAxisLeft
      .transition()
      .duration(duration)
      .call(
        d3
          .axisLeft<number>(this.yScaleLeft)
          .tickFormat(v => `${(v / 1000000).toFixed(1)}M`),
      );

    // right axis
    this.yScaleRight.domain([0, d3.max(data.map(b => b.orders)) as number]);
    this.yAxisRight
      .transition()
      .duration(duration)
      .call(d3.axisRight<number>(this.yScaleRight));

    // top scale
    this.yScaleBlocks.domain([
      (d3.min(data.map(b => b.rate)) as number) * 1,
      (d3.max(data.map(b => b.rate)) as number) * 1,
    ]);
  }

  updateBars(data: BatchChartData[]) {
    // Another scale for subgroup position
    const xSubgroup = d3
      .scaleBand()
      .domain(['volume', 'orders'])
      .range([0, this.xScale.bandwidth()])
      .padding(0.1);

    // update the bars
    const bars = this.svg
      .append('g')
      .attr('class', 'bars')
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bars-data')
      .attr('transform', d => `translate(${this.xScale(d.id)}, 0)`);
    bars
      .append('rect')
      .attr('x', () => xSubgroup('volume') || 0)
      .attr('y', d => this.yScaleLeft(+d.volume))
      .attr('width', xSubgroup.bandwidth())
      .attr('height', d => this.height - this.yScaleLeft(+d.volume))
      .attr('fill', () => this.palette('volume'));
    bars
      .append('rect')
      .attr('x', () => xSubgroup('orders') || 0)
      .attr('y', d => this.yScaleRight(d.orders))
      .attr('width', xSubgroup.bandwidth())
      .attr('height', d => this.height - this.yScaleRight(d.orders))
      .attr('fill', () => this.palette('orders'));
  }

  updateBlocks(data: BatchChartData[]) {
    const line = d3
      .line<BatchChartData>()
      .x(b => (this.xScale(b.id) || 0) + this.blockSize / 2)
      .y(b => this.yScaleBlocks(b.rate));
    // draw line
    this.topGroup
      .append('path')
      .attr('class', 'blocks-line')
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', 4)
      .attr('d', line(data) || '');

    // draw blocks
    const blocks = this.topGroup.selectAll('g').data(data);

    blocks
      .append('rect')
      .attr('class', 'block')
      .attr('width', this.blockSize)
      .attr('height', this.blockSize)
      .attr('rx', 4)
      .attr('stroke', () => this.palette('rate'))
      .attr('fill', '#252f4a');

    // draw rate as text
    blocks
      .append('text')
      .attr('class', 'label-rate')
      .attr('x', this.blockSize / 2)
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .attr('font-size', 28)
      .attr('fill', 'white')
      .text(d => d.rate);

    // draw rate as text
    const pctText = (p: number) => (p === 0 ? '--' : `${p > 0 ? '+' : ''}${p}%`);
    blocks
      .append('text')
      .attr('class', 'label-pct')
      .attr('x', this.blockSize / 2)
      .attr('y', 75)
      .attr('text-anchor', 'middle')
      .attr('font-size', 18)
      .attr('fill', d => this.deltaPalette(d.delta))
      .text(d => pctText(d.pctChange));

    // exit blocks
    blocks
      .exit<BatchChartData>()
      .transition()
      .duration(duration)
      .attr('transform', d => `translate(${this.xScale(d.id)}, 0)`);

    // update blocks
    blocks
      .transition()
      .attr(
        'transform',
        d =>
          `translate(${this.xScale(d.id)}, ${
            this.yScaleBlocks(d.rate) - this.blockSize / 2
          })`,
      );

    // enter blocks
    blocks
      .enter()
      .append('g')
      .attr('class', 'block-group')
      .attr('transform', d => `translate(${this.xScale(d.id)}, 0)`)
      .transition()
      .duration(duration)
      .attr(
        'transform',
        d =>
          `translate(${this.xScale(d.id)}, ${
            this.yScaleBlocks(d.rate) - this.blockSize / 2
          })`,
      );

    // draw squares
    // const rect = blocks
    //   .select('rect')
    //   .attr('class', 'block')
    //   .attr('x', 0)
    //   .attr('y', 0)
    //   .attr('width', this.blockSize)
    //   .attr('height', this.blockSize)
    //   .attr('rx', 4)
    //   .attr('stroke', () => this.palette('rate'))
    //   .attr('fill', '#252f4a');
  }
}
