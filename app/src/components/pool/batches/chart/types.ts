import { Batch } from 'store/models';
import { BatchDelta } from 'store/models/batch';
import { Scales } from './';

export type DataListener = (
  data: BatchChartData[],
  chart: Chart,
  pastData: boolean,
  prevDimensions?: ChartDimensions,
) => void;
export type SizeListener = (dimensions: ChartDimensions, chart: Chart) => void;

export interface Chart {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  clipped: d3.Selection<SVGGElement, unknown, null, undefined>;

  dimensions: ChartDimensions;
  scales: Scales;
  data: BatchChartData[];

  palette: d3.ScaleOrdinal<string, string, never>;

  onData: (listener: DataListener) => void;
  onSizeChange: (listener: SizeListener) => void;
}

export interface ChartConfig {
  element: SVGSVGElement;
  batches: Batch[];
  outerWidth: number;
  outerHeight: number;
  fetchBatches: () => void;
}

export interface BatchChartData {
  id: string;
  volume: number;
  orders: number;
  rate: number;
  pctChange: string;
  delta: BatchDelta;
}

export interface ChartDimensions {
  outerWidth: number;
  outerHeight: number;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  blocksHeight: number;
  blocksPadding: number;
  blockSize: number;
  totalWidth: number;
}
