import Batch, { BatchDelta } from 'store/models/batch';

export const ANIMATION_DURATION = 1000;

const TOP_HEIGHT_RATIO = 0.6;
const TOP_PADDING = 0.3;
const MARGIN = {
  top: 0,
  right: 30,
  bottom: 30,
  left: 50,
};
const COL_WIDTH = 150;

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
  margin: typeof MARGIN;
  blocksHeight: number;
  blocksPadding: number;
  blockSize: number;
  totalWidth: number;
}

export const getDimensions = (
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
    totalWidth: Math.max(batchCount * COL_WIDTH, outerWidth - MARGIN.left - MARGIN.right),
  };
};

export const convertData = (batches: Batch[]): BatchChartData[] =>
  batches
    .slice()
    // .reverse()
    .map(b => ({
      id: b.batchIdEllipsed,
      volume: +b.volume,
      orders: b.ordersCount,
      rate: b.clearingPriceRate,
      pctChange: pctToText(b.pctChange),
      delta: b.delta,
    }));

export const pctToText = (p: number) => (p === 0 ? '--' : `${p > 0 ? '+' : ''}${p}%`);
