import * as d3 from 'd3';
import { Batch } from 'store/models';
import { BarChart, BlocksChart, BottomAxis, LeftAxis, RightAxis, Scales } from './';
import {
  ANIMATION_DURATION,
  BatchChartData,
  ChartDimensions,
  convertData,
  getDimensions,
  hasLoadedPastData,
} from './chartUtils';
import LineChart from './LineChart';

type DataListener = (data: BatchChartData[], chart: D3Chart, pastData: boolean) => void;
type SizeListener = (dimensions: ChartDimensions, chart: D3Chart) => void;

export interface ChartConfig {
  element: SVGSVGElement;
  batches: Batch[];
  outerWidth: number;
  outerHeight: number;
  fetchBatches: () => void;
}

export default class D3Chart {
  private _loading = false;
  private _fetchBatches: ChartConfig['fetchBatches'];
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

  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
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

    this.zoom = this.createZoom();

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

    // keep a reference to the func this class should use to fetch past batches
    this._fetchBatches = config.fetchBatches;

    this.update(batches);
    this.resize(outerWidth, outerHeight);
  }

  update = (batches: Batch[]) => {
    this._loading = false;
    const data = convertData(batches);
    // determine if we are loading batches from the past
    const pastData = hasLoadedPastData(this.data, data);
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

  createZoom = () => {
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .on('zoom', (e: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        // console.log('D3Chart: zoom', e.transform);
        const { left } = this.dimensions.margin;
        this.clipped.attr('transform', `translate(${left + e.transform.x}, 0)`);
        if (e.transform.x === 0 && !this._loading) {
          console.log('D3Chart: zoom fetch batches');
          this._loading = true;
          this._fetchBatches();
        }
      });

    this.svg
      .call(zoom)
      .on('wheel.zoom', null) // disable mouse-wheel zooming
      .on('wheel', (e: WheelEvent) => {
        // pan left & right using the mouse wheel
        zoom.translateBy(this.svg.transition().duration(10), e.deltaY, 0);
      });

    return zoom;
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
      // jump to the same position
      this.zoom.translateTo(this.svg, 0, 0, [diff, 0]);
      // animate a bit less than one screen width to show the fetched batches
      const el = this.svg.transition().duration(ANIMATION_DURATION);
      this.zoom.translateTo(el, 0, 0, [diff + width - 150, 0]);
    }
  };

  onData = (listener: DataListener) => this._listeners.data.push(listener);
  onSizeChange = (listener: SizeListener) => this._listeners.size.push(listener);
}
