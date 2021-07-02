import { Theme } from '@emotion/react';
import Big from 'big.js';
import { percentage } from './bigmath';
import { BalanceConfig, BalanceConstraint, BalanceStatus } from './constants';

/**
 * Returns true if the local balance percentage satisfies the constraint
 * @param pct the percentage of the local balance
 * @param constraint the constraint to check the pct against
 */
const satisfies = (pct: number, constraint: BalanceConstraint) => {
  const { min, max, bidirectional } = constraint;

  if (bidirectional && pct < 50) {
    // 99 is the highest since we use Math.floor()
    pct = 99 - pct;
  }

  return min <= pct && pct < max;
};

/**
 * Returns the current status of the local balance of a channel
 * @param local the local balance of the channel
 * @param capacity the total capacity of the channel
 * @param config the balance configuration (receive, send, routing)
 */
export const getBalanceStatus = (
  local: Big,
  capacity: Big,
  config: BalanceConfig,
): BalanceStatus => {
  const pct = percentage(local, capacity);

  if (satisfies(pct, config.danger)) return BalanceStatus.danger;
  if (satisfies(pct, config.warn)) return BalanceStatus.warn;

  return BalanceStatus.ok;
};

/**
 * Converts a channel balance status to a theme color
 * @param level the status of the channel
 * @param active whether the channel is active or not
 * @param theme the app theme containing colors
 */
export const statusToColor = (level: BalanceStatus, active: boolean, theme: Theme) => {
  if (!active) return theme.colors.gray;

  if (level === BalanceStatus.danger) return theme.colors.pink;
  if (level === BalanceStatus.warn) return theme.colors.gold;
  return theme.colors.green;
};
