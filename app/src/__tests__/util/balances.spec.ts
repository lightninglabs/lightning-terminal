import Big from 'big.js';
import { getBalanceStatus } from 'util/balances';
import { BalanceConfig, BalanceModes, BalanceStatus } from 'util/constants';

describe('balances Util', () => {
  let config: BalanceConfig;

  const go = (local: number, capacity: number) =>
    getBalanceStatus(Big(local), Big(capacity), config);

  describe('Receive Optimized', () => {
    beforeEach(() => {
      config = BalanceModes.receive;
    });

    it('should return ok status', () => {
      expect(go(1, 1000)).toBe(BalanceStatus.ok);
      expect(go(100, 1000)).toBe(BalanceStatus.ok);
      expect(go(350, 1000)).not.toBe(BalanceStatus.ok);
      expect(go(600, 1000)).not.toBe(BalanceStatus.ok);
      expect(go(900, 1000)).not.toBe(BalanceStatus.ok);
      expect(go(999, 1000)).not.toBe(BalanceStatus.ok);
    });

    it('should return warn status', () => {
      expect(go(1, 1000)).not.toBe(BalanceStatus.warn);
      expect(go(100, 1000)).not.toBe(BalanceStatus.warn);
      expect(go(350, 1000)).toBe(BalanceStatus.warn);
      expect(go(600, 1000)).toBe(BalanceStatus.warn);
      expect(go(900, 1000)).not.toBe(BalanceStatus.warn);
      expect(go(999, 1000)).not.toBe(BalanceStatus.warn);
    });

    it('should return danger status', () => {
      expect(go(1, 1000)).not.toBe(BalanceStatus.danger);
      expect(go(100, 1000)).not.toBe(BalanceStatus.danger);
      expect(go(350, 1000)).not.toBe(BalanceStatus.danger);
      expect(go(600, 1000)).not.toBe(BalanceStatus.danger);
      expect(go(900, 1000)).toBe(BalanceStatus.danger);
      expect(go(999, 1000)).toBe(BalanceStatus.danger);
    });
  });

  describe('Send Optimized', () => {
    beforeEach(() => {
      config = BalanceModes.send;
    });

    it('should return ok status', () => {
      expect(go(1, 1000)).not.toBe(BalanceStatus.ok);
      expect(go(100, 1000)).not.toBe(BalanceStatus.ok);
      expect(go(350, 1000)).not.toBe(BalanceStatus.ok);
      expect(go(600, 1000)).not.toBe(BalanceStatus.ok);
      expect(go(900, 1000)).toBe(BalanceStatus.ok);
      expect(go(999, 1000)).toBe(BalanceStatus.ok);
    });

    it('should return warn status', () => {
      expect(go(1, 1000)).not.toBe(BalanceStatus.warn);
      expect(go(100, 1000)).not.toBe(BalanceStatus.warn);
      expect(go(350, 1000)).toBe(BalanceStatus.warn);
      expect(go(600, 1000)).toBe(BalanceStatus.warn);
      expect(go(900, 1000)).not.toBe(BalanceStatus.warn);
      expect(go(999, 1000)).not.toBe(BalanceStatus.warn);
    });

    it('should return danger status', () => {
      expect(go(1, 1000)).toBe(BalanceStatus.danger);
      expect(go(100, 1000)).toBe(BalanceStatus.danger);
      expect(go(350, 1000)).not.toBe(BalanceStatus.danger);
      expect(go(600, 1000)).not.toBe(BalanceStatus.danger);
      expect(go(900, 1000)).not.toBe(BalanceStatus.danger);
      expect(go(999, 1000)).not.toBe(BalanceStatus.danger);
    });
  });

  describe('Routing Optimized', () => {
    beforeEach(() => {
      config = BalanceModes.routing;
    });

    it('should return ok status', () => {
      expect(go(1, 1000)).not.toBe(BalanceStatus.ok);
      expect(go(100, 1000)).not.toBe(BalanceStatus.ok);
      expect(go(350, 1000)).toBe(BalanceStatus.ok);
      expect(go(600, 1000)).toBe(BalanceStatus.ok);
      expect(go(800, 1000)).not.toBe(BalanceStatus.ok);
      expect(go(900, 1000)).not.toBe(BalanceStatus.ok);
      expect(go(999, 1000)).not.toBe(BalanceStatus.ok);
    });

    it('should return warn status', () => {
      expect(go(1, 1000)).not.toBe(BalanceStatus.warn);
      expect(go(100, 1000)).not.toBe(BalanceStatus.warn);
      expect(go(350, 1000)).not.toBe(BalanceStatus.warn);
      expect(go(600, 1000)).not.toBe(BalanceStatus.warn);
      expect(go(800, 1000)).toBe(BalanceStatus.warn);
      expect(go(900, 1000)).not.toBe(BalanceStatus.warn);
      expect(go(999, 1000)).not.toBe(BalanceStatus.warn);
    });

    it('should return danger status', () => {
      expect(go(1, 1000)).toBe(BalanceStatus.danger);
      expect(go(100, 1000)).toBe(BalanceStatus.danger);
      expect(go(350, 1000)).not.toBe(BalanceStatus.danger);
      expect(go(600, 1000)).not.toBe(BalanceStatus.danger);
      expect(go(800, 1000)).not.toBe(BalanceStatus.danger);
      expect(go(900, 1000)).toBe(BalanceStatus.danger);
      expect(go(999, 1000)).toBe(BalanceStatus.danger);
    });
  });
});
