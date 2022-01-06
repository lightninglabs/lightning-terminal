import Big from 'big.js';
import { Unit } from 'util/constants';
import { blocksToTime, formatSats, formatTime, formatUnit } from 'util/formatters';

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

  describe('formatTime', () => {
    it('should format time', () => {
      expect(formatTime(30)).toEqual('30s');
      expect(formatTime(59)).toEqual('59s');
      expect(formatTime(60)).toEqual('1m 0s');
      expect(formatTime(60 * 2 - 1)).toEqual('1m 59s');
      expect(formatTime(60 * 2)).toEqual('2m 0s');
      expect(formatTime(60 * 3 + 5)).toEqual('3m 5s');
      expect(formatTime(60 * 10 - 1)).toEqual('9m 59s');
      expect(formatTime(60 * 10)).toEqual('10m 0s');
      expect(formatTime(60 * 10 + 1)).toEqual('10m 1s');
      expect(formatTime(60 * 60 - 1)).toEqual('59m 59s');
      expect(formatTime(60 * 60)).toEqual('1h 0m 0s');
      expect(formatTime(60 * 60 + 1)).toEqual('1h 0m 1s');
      expect(formatTime(60 * 70 + 1)).toEqual('1h 10m 1s');
    });
  });

  describe('blocksToTime', () => {
    it('should convert block to time', () => {
      expect(blocksToTime(432)).toEqual('3 days');
      expect(blocksToTime(1008)).toEqual('1 week');
      expect(blocksToTime(2016)).toEqual('2 weeks');
      expect(blocksToTime(4032)).toEqual('1 month');
      expect(blocksToTime(8064)).toEqual('2 months');
      expect(blocksToTime(12096)).toEqual('3 months');
      expect(blocksToTime(16128)).toEqual('4 months');
      expect(blocksToTime(24192)).toEqual('6 months');
      expect(blocksToTime(52416)).toEqual('1 year');
    });
  });
});
