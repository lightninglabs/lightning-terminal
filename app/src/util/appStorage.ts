export default class AppStorage {
  /**
   * stores data in the browser local storage
   */
  set<T>(key: string, data: T) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * retrieves data from the browser local storage
   */
  get<T>(key: string): T | undefined {
    const json = localStorage.getItem(key);
    if (json) {
      return JSON.parse(json) as T;
    }
  }
  /**
   * stores data in the browser session storage
   */
  setSession(key: string, data: string) {
    sessionStorage.setItem(key, data);
  }

  /**
   * retrieves data from the browser session storage
   */
  getSession(key: string): string | undefined {
    return sessionStorage.getItem(key) || undefined;
  }
}
