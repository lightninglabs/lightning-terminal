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

/**
 * Converts a number to a percentage with two decimal places
 * @param value the decimal value to convert
 */
export const toPercent = (value: number) => Math.round(value * 100 * 100) / 100;

/**
 * Calculates the annual interest yield. Returned as a decimal, not a percentage
 * @param principal the total principal amount being loaned
 * @param premium the premium being paid for the loan
 * @param termInDays the term of the loan in days
 */
export const annualPercentYield = (
  principal: number,
  premium: number,
  termInDays: number,
): number => {
  const apr = annualPercentRate(principal, premium, termInDays);
  const timesPerYear = 365 / termInDays;
  const apy = Math.pow(1 + apr / timesPerYear, timesPerYear) - 1;
  return apy;
};

/**
 * Calculates the annual percentage rate. Returned as a decimal, not a percentage
 * @param principal the total principal amount being loaned
 * @param premium the premium being paid for the loan
 * @param termInDays the term of the loan in days
 */
export const annualPercentRate = (
  principal: number,
  premium: number,
  termInDays: number,
) => {
  const apr = (premium / principal / termInDays) * 365;
  return apr;
};
