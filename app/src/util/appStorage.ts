export default class AppStorage<T> {
  /**
   * stores data in the browser local storage
   */
  set(key: string, data: T) {
    localStorage.setItem('settings', JSON.stringify(data));
  }

  /**
   * retrieves data from the browser local storage
   */
  get(key: string): T | undefined {
    const json = localStorage.getItem(key);
    if (json) {
      return JSON.parse(json) as T;
    }
  }
}
