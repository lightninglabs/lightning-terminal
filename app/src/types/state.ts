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

export enum SidecarRegisterSteps {
  Closed = 0,
  EnterTicket = 1,
  ConfirmTicket = 2,
  Processing = 3,
  Complete = 4,
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

export enum ChannelStatus {
  UNKNOWN = 'Unknown',
  OPEN = 'Open',
  OPENING = 'Opening',
  CLOSING = 'Closing',
  FORCE_CLOSING = 'Force Closing',
  WAITING_TO_CLOSE = 'Waiting To Close',
}

/**
 * A type to signify that a number actually represents a lease duration.
 * This just makes the code more readable since it will be clear that a
 * duration is not just a random number.
 */
export type LeaseDuration = number;

export interface SubServerStatus {
  disabled: boolean;
  running: boolean;
  error: string;
}
