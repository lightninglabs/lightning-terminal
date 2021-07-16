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

  return +portion.mul(100).div(whole).round(decimals, Big.roundDown);
};

/**
 * Converts a number to a percentage with two decimal places
 * @param value the decimal value to convert
 */
export const toPercent = (value: number) => Math.round(value * 100 * 100) / 100;

/**
 * Converts a number to basis points, excluding the decimal places
 * @param value the decimal value to convert
 */
export const toBasisPoints = (value: number) => Math.round(toPercent(value) * 100);

/**
 * Calculates the annual percentage rate. Returned as a decimal, not a percentage
 * @param principal the total principal amount being loaned
 * @param premium the premium being paid for the loan
 * @param termInDays the term of the loan in days
 */
export const annualPercentRate = (principal: Big, premium: Big, termInDays: number) => {
  return +premium.div(principal).div(termInDays).mul(365);
};
