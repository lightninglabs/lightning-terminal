import Big from 'big.js';
import { Unit } from 'util/constants';
import { formatSats, formatUnit } from 'util/formatters';

describe('formatters Util', () => {
  describe('formatSats', () => {
    it('should format to sats', () => {
      expect(formatSats(Big(0))).toEqual('0 sats');
      expect(formatSats(Big(123))).toEqual('123 sats');
      expect(formatSats(Big(123456))).toEqual('123,456 sats');
      expect(formatSats(Big(123456789))).toEqual('123,456,789 sats');
      expect(formatSats(Big(12345678901))).toEqual('12,345,678,901 sats');
    });

    it('should format to sats without', () => {
      const opts = { withSuffix: false };
      expect(formatSats(Big(0), opts)).toEqual('0');
      expect(formatSats(Big(123), opts)).toEqual('123');
      expect(formatSats(Big(123456), opts)).toEqual('123,456');
      expect(formatSats(Big(123456789), opts)).toEqual('123,456,789');
      expect(formatSats(Big(12345678901), opts)).toEqual('12,345,678,901');
    });

    it('should format to bits', () => {
      const opts = { unit: Unit.bits };
      expect(formatSats(Big(0), opts)).toEqual('0.00 bits');
      expect(formatSats(Big(123), opts)).toEqual('1.23 bits');
      expect(formatSats(Big(123456), opts)).toEqual('1,234.56 bits');
      expect(formatSats(Big(123456789), opts)).toEqual('1,234,567.89 bits');
      expect(formatSats(Big(12345678901), opts)).toEqual('123,456,789.01 bits');
    });

    it('should format to bits without', () => {
      const opts = { unit: Unit.bits, withSuffix: false };
      expect(formatSats(Big(0), opts)).toEqual('0.00');
      expect(formatSats(Big(123), opts)).toEqual('1.23');
      expect(formatSats(Big(123456), opts)).toEqual('1,234.56');
      expect(formatSats(Big(123456789), opts)).toEqual('1,234,567.89');
      expect(formatSats(Big(12345678901), opts)).toEqual('123,456,789.01');
    });

    it('should format to BTC', () => {
      const opts = { unit: Unit.btc };
      expect(formatSats(Big(0), opts)).toEqual('0.00000000 BTC');
      expect(formatSats(Big(123), opts)).toEqual('0.00000123 BTC');
      expect(formatSats(Big(123456), opts)).toEqual('0.00123456 BTC');
      expect(formatSats(Big(123456789), opts)).toEqual('1.23456789 BTC');
      expect(formatSats(Big(12345678901), opts)).toEqual('123.45678901 BTC');
    });

    it('should format to BTC without suffix', () => {
      const opts = { unit: Unit.btc, withSuffix: false };
      expect(formatSats(Big(0), opts)).toEqual('0.00000000');
      expect(formatSats(Big(123), opts)).toEqual('0.00000123');
      expect(formatSats(Big(123456), opts)).toEqual('0.00123456');
      expect(formatSats(Big(123456789), opts)).toEqual('1.23456789');
      expect(formatSats(Big(12345678901), opts)).toEqual('123.45678901');
    });
  });

  describe('formatUnit', () => {
    it('should format sats', () => {
      expect(formatUnit(Unit.sats)).toEqual('Satoshis (0.00000001 BTC)');
    });

    it('should format bits', () => {
      expect(formatUnit(Unit.bits)).toEqual('Bits (0.00000100 BTC)');
    });

    it('should format BTC', () => {
      expect(formatUnit(Unit.btc)).toEqual('Bitcoin (1.00000000 BTC)');
    });
  });
});
