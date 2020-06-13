import { Logger } from './log';

interface CacheParams<T> {
  /** the key in localStorage to store the cached data */
  cacheKey: string;
  /** the list of keys that we need values for */
  requiredKeys: string[];
  /** async func to call with the keys that do not have values cached */
  fetchFromApi: (
    /** the keys that do not have values cached */
    missingKeys: string[],
    /** the data that is already in the cache */
    cacheData: Record<string, T>,
  ) => Promise<Record<string, T>>;
  /** the logger used to log info about the caching lookups */
  log: Logger;
}

interface CacheData<T> {
  expires: number;
  data: Record<string, T>;
}

/** cache API data for 24 hours */
const CACHE_TIMEOUT = 24 * 60 * 60 * 1000;

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

  /**
   * retrieves data cached in local storage. if any data is missing then
   * call the `fetchFromApi` func provided to retrieve the data and store
   * it in the cache for later
   */
  async getCached<T>(params: CacheParams<T>): Promise<Record<string, T>> {
    const { cacheKey, requiredKeys, fetchFromApi, log } = params;
    log.info(`fetching ${cacheKey}`);
    // remove duplicate keys
    let keys = requiredKeys.filter((r, i, a) => a.indexOf(r) === i);

    // create a map of key to the value type
    let data: Record<string, T> = {};

    // look up cached data in storage
    const cached = this.get<CacheData<T>>(cacheKey);
    if (cached && cached.expires > Date.now()) {
      // there is cached data and it has not expired
      data = cached.data;
      // exclude keys which we have value for already
      keys = keys.filter(key => !data[key]);
      log.info(`found ${cacheKey} in cache. missing ${keys.length} keys`, keys);
    }

    // if there are any keys that are not in the cache
    if (keys.length) {
      try {
        // call the API to get the missing data
        data = await fetchFromApi(keys, data);

        // update the expiration date only if it has expired. this ensures
        // that data will remain in the cache for up to the timeout
        const expires =
          cached && cached.expires > Date.now()
            ? cached.expires
            : Date.now() + CACHE_TIMEOUT;

        // update localStorage with the new data
        this.set(cacheKey, { expires, data });
        log.info(`updated cache with ${keys.length} new ${cacheKey}`);
      } catch (error) {
        log.error(`failed to fetch ${cacheKey} from the API`, error.message);
      }
    }

    return data;
  }
}
