import { Emitter } from 'types/emitter';
import { LeaseDuration } from 'types/state';
import { Batch } from 'store/models';
import { BatchDelta } from 'store/models/batch';
import { Scales } from './';

export interface ChartUpdateEvent {
  chart: Chart;
  data: BatchChartData[];
  pastData: boolean;
  prevDimensions: ChartDimensions;
}

export interface ChartResizeEvent {
  chart: Chart;
  dimensions: ChartDimensions;
}

export interface ChartEvents {
  update: ChartUpdateEvent;
  resize: ChartResizeEvent;
}

interface BaseChart {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  main: d3.Selection<SVGGElement, unknown, null, undefined>;
  clipped: d3.Selection<SVGGElement, unknown, null, undefined>;

  dimensions: ChartDimensions;
  scales: Scales;
  data: BatchChartData[];
  market: LeaseDuration;

  palette: d3.ScaleOrdinal<string, string, never>;
  duration: number;
}

export type Chart = BaseChart & Emitter<ChartEvents>;

export interface ChartConfig {
  element: SVGSVGElement;
  outerWidth: number;
  outerHeight: number;
  batches: Batch[];
  market: LeaseDuration;
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
