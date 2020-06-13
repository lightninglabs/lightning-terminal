import AppStorage from 'util/appStorage';

describe('appStorage util', () => {
  const key = 'test-data';
  const settings = {
    someNumber: 123,
    someString: 'abc',
    someBool: false,
  };
  const appStorage = new AppStorage();

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

  it('should return undefined for a missing key in localStorage', () => {
    const data = appStorage.get('invalid-key');
    expect(data).toBeUndefined();
  });

  it('should save an value to sessionStorage', () => {
    appStorage.setSession(key, 'test-value');

    const value = sessionStorage.getItem(key);
    expect(value).toBe('test-value');
  });

  it('should load a value from sessionStorage', () => {
    sessionStorage.setItem(key, 'test-value');

    const value = appStorage.getSession(key);
    expect(value).toBe('test-value');
  });

  it('should return undefined for a missing key in sessionStorage', () => {
    const data = appStorage.getSession('invalid-key');
    expect(data).toBeUndefined();
  });
});
