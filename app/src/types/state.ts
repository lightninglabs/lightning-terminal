import Big from 'big.js';

export enum SwapDirection {
  IN = 'Loop In',
  OUT = 'Loop Out',
}

export interface Quote {
  swapFee: Big;
  minerFee: Big;
  prepayAmount: Big;
}

export interface SwapTerms {
  in: {
    min: Big;
    max: Big;
  };
  out: {
    min: Big;
    max: Big;
    minCltv?: number;
    maxCltv?: number;
  };
}

export enum BuildSwapSteps {
  Closed = 0,
  SelectDirection = 1,
  ChooseAmount = 2,
  ReviewQuote = 3,
  Processing = 4,
}

export interface Alert {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'default';
  title?: string;
  message: string;
  /** the number of milliseconds before the toast closes automatically */
  ms?: number;
}

export interface SortParams<T> {
  field?: keyof T;
  descending: boolean;
}
