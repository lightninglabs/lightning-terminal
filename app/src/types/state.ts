export enum BalanceLevel {
  good = 'good',
  warn = 'warn',
  bad = 'bad',
}

export enum SwapDirection {
  IN = 'Loop In',
  OUT = 'Loop Out',
}

export interface Quote {
  swapFee: number;
  minerFee: number;
  prepayAmount: number;
}

export interface SwapTerms {
  in: {
    min: number;
    max: number;
  };
  out: {
    min: number;
    max: number;
  };
}
