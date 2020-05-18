/** the enumeration of unit supported in the app */
export enum Unit {
  sats = 'sats',
  bits = 'bits',
  btc = 'btc',
}

interface UnitFormat {
  suffix: string;
  name: string;
  denominator: number;
  decimals: number;
}

/** a mapping of units to parameters that define how it should be formatted  */
export const Units: { [key in Unit]: UnitFormat } = {
  sats: { suffix: 'sats', name: 'Satoshis', denominator: 1, decimals: 0 },
  bits: { suffix: 'bits', name: 'Bits', denominator: 100, decimals: 2 },
  btc: { suffix: 'BTC', name: 'Bitcoin', denominator: 100000000, decimals: 8 },
};
