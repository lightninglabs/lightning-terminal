import { getBalanceStatus } from 'util/balances';
import { BalanceConfig, BalanceModes, BalanceStatus } from 'util/constants';

describe('balances Util', () => {
  let config: BalanceConfig;

  describe('Receive Optimized', () => {
    beforeEach(() => {
      config = BalanceModes.receive;
    });

    it('should return ok status', () => {
      expect(getBalanceStatus(100, 1000, config)).toBe(BalanceStatus.ok);
      expect(getBalanceStatus(350, 1000, config)).not.toBe(BalanceStatus.ok);
      expect(getBalanceStatus(600, 1000, config)).not.toBe(BalanceStatus.ok);
      expect(getBalanceStatus(900, 1000, config)).not.toBe(BalanceStatus.ok);
    });

    it('should return warn status', () => {
      expect(getBalanceStatus(100, 1000, config)).not.toBe(BalanceStatus.warn);
      expect(getBalanceStatus(350, 1000, config)).toBe(BalanceStatus.warn);
      expect(getBalanceStatus(600, 1000, config)).toBe(BalanceStatus.warn);
      expect(getBalanceStatus(900, 1000, config)).not.toBe(BalanceStatus.warn);
    });

    it('should return danger status', () => {
      expect(getBalanceStatus(100, 1000, config)).not.toBe(BalanceStatus.danger);
      expect(getBalanceStatus(350, 1000, config)).not.toBe(BalanceStatus.danger);
      expect(getBalanceStatus(600, 1000, config)).not.toBe(BalanceStatus.danger);
      expect(getBalanceStatus(900, 1000, config)).toBe(BalanceStatus.danger);
    });
  });

  describe('Send Optimized', () => {
    beforeEach(() => {
      config = BalanceModes.send;
    });

    it('should return ok status', () => {
      expect(getBalanceStatus(100, 1000, config)).not.toBe(BalanceStatus.ok);
      expect(getBalanceStatus(350, 1000, config)).not.toBe(BalanceStatus.ok);
      expect(getBalanceStatus(600, 1000, config)).not.toBe(BalanceStatus.ok);
      expect(getBalanceStatus(900, 1000, config)).toBe(BalanceStatus.ok);
    });

    it('should return warn status', () => {
      expect(getBalanceStatus(100, 1000, config)).not.toBe(BalanceStatus.warn);
      expect(getBalanceStatus(350, 1000, config)).toBe(BalanceStatus.warn);
      expect(getBalanceStatus(600, 1000, config)).toBe(BalanceStatus.warn);
      expect(getBalanceStatus(900, 1000, config)).not.toBe(BalanceStatus.warn);
    });

    it('should return danger status', () => {
      expect(getBalanceStatus(100, 1000, config)).toBe(BalanceStatus.danger);
      expect(getBalanceStatus(350, 1000, config)).not.toBe(BalanceStatus.danger);
      expect(getBalanceStatus(600, 1000, config)).not.toBe(BalanceStatus.danger);
      expect(getBalanceStatus(900, 1000, config)).not.toBe(BalanceStatus.danger);
    });
  });

  describe('Routing Optimized', () => {
    beforeEach(() => {
      config = BalanceModes.routing;
    });

    it('should return ok status', () => {
      expect(getBalanceStatus(100, 1000, config)).not.toBe(BalanceStatus.ok);
      expect(getBalanceStatus(350, 1000, config)).toBe(BalanceStatus.ok);
      expect(getBalanceStatus(600, 1000, config)).toBe(BalanceStatus.ok);
      expect(getBalanceStatus(800, 1000, config)).not.toBe(BalanceStatus.ok);
      expect(getBalanceStatus(900, 1000, config)).not.toBe(BalanceStatus.ok);
    });

    it('should return warn status', () => {
      expect(getBalanceStatus(100, 1000, config)).not.toBe(BalanceStatus.warn);
      expect(getBalanceStatus(350, 1000, config)).not.toBe(BalanceStatus.warn);
      expect(getBalanceStatus(600, 1000, config)).not.toBe(BalanceStatus.warn);
      expect(getBalanceStatus(800, 1000, config)).toBe(BalanceStatus.warn);
      expect(getBalanceStatus(900, 1000, config)).not.toBe(BalanceStatus.warn);
    });

    it('should return danger status', () => {
      expect(getBalanceStatus(100, 1000, config)).toBe(BalanceStatus.danger);
      expect(getBalanceStatus(350, 1000, config)).not.toBe(BalanceStatus.danger);
      expect(getBalanceStatus(600, 1000, config)).not.toBe(BalanceStatus.danger);
      expect(getBalanceStatus(800, 1000, config)).not.toBe(BalanceStatus.danger);
      expect(getBalanceStatus(900, 1000, config)).toBe(BalanceStatus.danger);
    });
  });
});
