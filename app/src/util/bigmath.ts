import Big from 'big.js';

/**
 * Calculates the percentage `portion` is of the `whole`, with both numbers
 * being Big. Returns a native number since percentages will usually be in
 * the range of 0 to 100
 * @param portion the numerator
 * @param whole the denominator
 * @param decimals the number of decimal places in the result
 */
export const percentage = (portion: Big, whole: Big, decimals = 0): number => {
  if (whole.eq(0)) return 0;

  // needed because RoundingMode.RoundDown is a `const enum` which we cannot use
  // with '--isolatedModules'
  const roundDown = 0;
  return +portion.mul(100).div(whole).round(decimals, roundDown);
};
