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

export enum BuildSwapSteps {
  Closed = 0,
  SelectDirection = 1,
  ChooseAmount = 2,
  ReviewQuote = 3,
  Processing = 4,
}
