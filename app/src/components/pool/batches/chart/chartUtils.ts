import * as d3 from 'd3';
import Batch, { BatchDelta } from 'store/models/batch';

export const ANIMATION_DURATION = 1000;
const MARGIN = {
  top: 0,
  right: 40,
  bottom: 30,
  left: 40,
};

// aliases for verbose D3 types
export type D3ScaleLinear = d3.ScaleLinear<number, number, never>;
export type D3ScaleBand = d3.ScaleBand<string>;

export interface BatchChartData {
  id: string;
  volume: number;
  orders: number;
  rate: number;
  pctChange: string;
  delta: BatchDelta;
}

export interface Scales {
  yLeft: D3ScaleLinear;
}

export interface ChartDimensions {
  width: number;
  height: number;
  margin: typeof MARGIN;
  blocksHeight: number;
  blockSize: number;
}

export const getDimensions = (width: number, height: number): ChartDimensions => {
  return {
    width: width - MARGIN.left - MARGIN.right,
    height: height - MARGIN.top - MARGIN.bottom,
    margin: MARGIN,
    blocksHeight: height * 0.35,
    blockSize: Math.max(width * 0.05, 100),
  };
};

export const convertData = (batches: Batch[]): BatchChartData[] =>
  batches
    .slice()
    .reverse()
    .map(b => ({
      id: b.batchTxIdEllipsed,
      volume: +b.volume,
      orders: b.ordersCount,
      rate: b.clearingPriceRate,
      pctChange: pctToText(b.pctChange),
      delta: b.delta,
    }));

export const pctToText = (p: number) => (p === 0 ? '--' : `${p > 0 ? '+' : ''}${p}%`);

// export const createScales = (data: BatchChartData[], dimensions: Dimensions): Scales => {
//   const { height, blocksHeight } = dimensions;
//   const yLeft = d3.scaleLinear().range([height, blocksHeight]);

//   return { yLeft };
// };
