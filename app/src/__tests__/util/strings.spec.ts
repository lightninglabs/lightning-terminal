import { ellipseInside, extractDomain } from 'util/strings';

describe('strings util', () => {
  describe('ellipseInside', () => {
    it('should ellipse valid text', () => {
      expect(ellipseInside('xxxxxxyyyyzzzzzz')).toEqual('xxxxxx...zzzzzz');
      expect(ellipseInside('xxxxyyyyzzzz', 4)).toEqual('xxxx...zzzz');
      expect(ellipseInside('xxyyyyzz', 2)).toEqual('xx...zz');
      expect(ellipseInside('xxyyyyzz', 2, 4)).toEqual('xx...yyzz');
    });

    it('should do nothing with short text', () => {
      expect(ellipseInside('abcdef')).toEqual('abcdef');
      expect(ellipseInside('abcdef', 3)).toEqual('abcdef');
    });

    it('should keep 6 chars with invalid value provided', () => {
      expect(ellipseInside('xxxxxxyyyyzzzzzz', 0)).toEqual('xxxxxx...zzzzzz');
      expect(ellipseInside('xxxxxxyyyyzzzzzz', -1)).toEqual('xxxxxx...zzzzzz');
      expect(ellipseInside('xxxxxxyyyyzzzzzz', NaN)).toEqual('xxxxxx...zzzzzz');
      expect(ellipseInside('xxxxxxyyyyzzzzzz', (undefined as unknown) as number)).toEqual(
        'xxxxxx...zzzzzz',
      );
    });

    it('should handle empty text', () => {
      expect(ellipseInside((undefined as unknown) as string)).toBeUndefined();
      expect(ellipseInside((null as unknown) as string)).toBeNull();
      expect(ellipseInside('')).toEqual('');
    });
  });

  describe('extractDomain', () => {
    it.each<[string, string]>([
      ['test1.com', 'http://test1.com/blah/{txid}'],
      ['test2.com', 'https://test2.com/blah/{txid}'],
      ['test3.com', 'test3.com/{txid}'],
    ])('should extract %s from %s', (domain, url) => {
      expect(extractDomain(url)).toEqual(domain);
    });

    it('should handle invalid urls', () => {
      expect(extractDomain('')).toEqual('');
      expect(extractDomain(1 as any)).toEqual('1');
      expect(extractDomain(undefined as any)).toEqual('undefined');
    });
  });
});
