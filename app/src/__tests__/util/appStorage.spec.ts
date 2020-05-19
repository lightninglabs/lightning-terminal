import AppStorage from 'util/appStorage';

jest.unmock('util/appStorage');

describe('appStorage util', () => {
  const key = 'test-data';
  const settings = {
    someNumber: 123,
    someString: 'abc',
    someBool: false,
  };
  const appStorage = new AppStorage<typeof settings>();

  it('should save an object to localStorage', () => {
    appStorage.set(key, settings);

    const json = localStorage.getItem(key);
    expect(json).toBeDefined();
    expect(typeof json).toBe('string');
    const data = JSON.parse(json as string) as typeof settings;
    expect(data).toBeDefined();
    expect(data.someNumber).toEqual(settings.someNumber);
    expect(data.someString).toEqual(settings.someString);
    expect(data.someBool).toEqual(settings.someBool);
  });

  it('should load an object from localStorage', () => {
    const json = '{"someNumber":123,"someString":"abc","someBool":false}';
    localStorage.setItem(key, json);

    const data = appStorage.get(key) as typeof settings;
    expect(data).toBeDefined();
    expect(data.someNumber).toEqual(settings.someNumber);
    expect(data.someString).toEqual(settings.someString);
    expect(data.someBool).toEqual(settings.someBool);
  });

  it('should return undefined for a missing key', () => {
    const data = appStorage.get('invalid-key');
    expect(data).toBeUndefined();
  });
});
