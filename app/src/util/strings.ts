import { Buffer } from 'buffer';

/**
 * Shortens text by removing a portion of characters from the middle and only
 * keeping a small subset of the outer left and right sides
 * @param text the text to shorten
 * @param charsToKeep the number of characters to keep on both sides unless `rightCharsToKeep` is provided
 * @param rightCharsToKeep the number of characters to keep on the right side
 *
 * @example
 * const letters = 'abcdefghijklmnopqrstuvwxyz';
 * ellipseInner(letters, 3); // 'abc...xyz'
 * ellipseInner(letters, 5); // 'abcde...vwxyz'
 * ellipseInner(letters, 4, 2) // 'abcd...yz'
 */
export const ellipseInside = (
  text: string,
  charsToKeep = 6,
  rightCharsToKeep?: number,
): string => {
  if (!text) return text;
  if (!charsToKeep || charsToKeep <= 0) charsToKeep = 6;
  if (!rightCharsToKeep) rightCharsToKeep = charsToKeep;
  if (text.length <= charsToKeep + rightCharsToKeep) return text;
  const firstChars = text.substring(0, charsToKeep);
  const lastChars = text.substring(text.length - rightCharsToKeep);
  return `${firstChars}...${lastChars}`;
};

/**
 * Returns the plural of an English word.
 *
 * @export
 * @param {string} word
 * @param {number} [amount]
 * @returns {string}
 */
export const plural = (amount: number, word: string): string => {
  if (amount === 1) {
    return word;
  }
  const plural: { [key: string]: string } = {
    '(quiz)$': '$1zes',
    '^(ox)$': '$1en',
    '([m|l])ouse$': '$1ice',
    '(matr|vert|ind)ix|ex$': '$1ices',
    '(x|ch|ss|sh)$': '$1es',
    '([^aeiouy]|qu)y$': '$1ies',
    '(hive)$': '$1s',
    '(?:([^f])fe|([lr])f)$': '$1$2ves',
    '(shea|lea|loa|thie)f$': '$1ves',
    sis$: 'ses',
    '([ti])um$': '$1a',
    '(tomat|potat|ech|her|vet)o$': '$1oes',
    '(bu)s$': '$1ses',
    '(alias)$': '$1es',
    '(octop)us$': '$1i',
    '(ax|test)is$': '$1es',
    '(us)$': '$1es',
    '([^s]+)$': '$1s',
  };
  const irregular: { [key: string]: string } = {
    move: 'moves',
    foot: 'feet',
    goose: 'geese',
    sex: 'sexes',
    child: 'children',
    man: 'men',
    tooth: 'teeth',
    person: 'people',
  };
  const uncountable: string[] = [
    'sheep',
    'fish',
    'deer',
    'moose',
    'series',
    'species',
    'money',
    'rice',
    'information',
    'equipment',
    'bison',
    'cod',
    'offspring',
    'pike',
    'salmon',
    'shrimp',
    'swine',
    'trout',
    'aircraft',
    'hovercraft',
    'spacecraft',
    'sugar',
    'tuna',
    'you',
    'wood',
  ];
  // save some time in the case that singular and plural are the same
  if (uncountable.indexOf(word.toLowerCase()) >= 0) {
    return word;
  }
  // check for irregular forms
  for (const w in irregular) {
    const pattern = new RegExp(`${w}$`, 'i');
    const replace = irregular[w];
    if (pattern.test(word)) {
      return word.replace(pattern, replace);
    }
  }
  // check for matches using regular expressions
  for (const reg in plural) {
    const pattern = new RegExp(reg, 'i');
    if (pattern.test(word)) {
      return word.replace(pattern, plural[reg]);
    }
  }
  return word;
};

/**
 * Extracts the domain name from a full url
 */
export const extractDomain = (url: string): string => {
  const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im;
  const match = `${url}`.match(domainRegex);
  if (match) return match[1];
  return '';
};

/**
 * converts a base64 string into hex format
 */
export const hex = (value: string | Uint8Array, reverse = false): string => {
  if (!value) return value;
  let converted = Buffer.from(value.toString(), 'base64');
  if (reverse) converted = converted.reverse();
  return converted.toString('hex');
};

/**
 * converts a hex string into base64 format
 */
export const b64 = (value: string, reverse = false): string => {
  let converted = Buffer.from(value, 'hex');
  if (reverse) converted = converted.reverse();
  return converted.toString('base64');
};
