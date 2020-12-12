import * as d3 from 'd3';
import { Chart, ChartDimensions, ChartResizeEvent, ChartUpdateEvent } from './types';

/**
 * Adds mouse drag and wheel scrolling to the chart
 */
export default class Zoomer {
  private _loading = false;
  private _fetchBatches: () => void;

  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;

  constructor(chart: Chart, fetchBatches: () => void) {
    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .on('zoom', (e: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        // this function is called then d3 detects a drag or scroll event
        const { left } = chart.dimensions.margin;
        chart.clipped.attr('transform', `translate(${left + e.transform.x}, 0)`);
        if (e.transform.x === 0 && !this._loading) {
          this._loading = true;
          this._fetchBatches();
        }
      });

    chart.svg
      .call(this.zoom)
      .on('dblclick.zoom', null) // disable double-click zooming
      .on('wheel.zoom', null) // disable mouse-wheel zooming
      .on('wheel', (e: WheelEvent) => {
        // pan left & right using the mouse wheel
        this.zoom.translateBy(chart.svg.transition().duration(10), e.deltaY, 0);
      });

    chart.on('update', this.update);
    chart.on('resize', this.resize);

    // keep a reference to the func this class should use to fetch past batches
    this._fetchBatches = fetchBatches;
  }

  /**
   * Updates the scroll dimensions when the data is updated
   */
  update = ({ chart, pastData, prevDimensions }: ChartUpdateEvent) => {
    this._loading = false;
    this._resizeZoom(chart, pastData, prevDimensions);
  };

  /**
   * Updates the scroll dimensions when the chart is resized
   */
  resize = ({ chart }: ChartResizeEvent) => {
    this._resizeZoom(chart);
  };

  /**
   * Updates the scroll dimensions
   */
  _resizeZoom = (chart: Chart, pastData?: boolean, prevDimensions?: ChartDimensions) => {
    const { width, height, totalWidth, margin } = chart.dimensions;
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
      const el = chart.svg.transition().duration(chart.duration);
      this.zoom.translateTo(el, 0, 0, [width - totalWidth, 0]);
    } else if (pastData && prevDimensions) {
      // loading old batches, stay in the same position. the total width of the
      // clipped layer will increase due to there being more batches. in order
      // to remain in the same position, we need to pan by the difference. the
      // panning coords are anchored from the left
      const diff = prevDimensions.totalWidth - chart.dimensions.totalWidth;
      // jump to the same position
      this.zoom.translateTo(chart.svg, 0, 0, [diff, 0]);
      // animate a bit less than one screen width to show the fetched batches
      const el = chart.svg.transition().duration(chart.duration);
      this.zoom.translateTo(el, 0, 0, [diff + width - 150, 0]);
    }
  };
}
