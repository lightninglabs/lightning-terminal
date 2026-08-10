import { makeAutoObservable, runInAction } from 'mobx';
import { History, Location } from '@remix-run/router';

/** the listener callback accepted by the history object */
type Listener = Parameters<History['listen']>[0];

export default class RouterStore {
  /** the history object */
  history: History;

  /** the current location from the browser's history */
  location: Location;

  constructor(history: History) {
    makeAutoObservable(this, { history: false }, { deep: false, autoBind: true });

    this.location = history.location;

    // The router's history implementation only accepts a single active
    // listener, but both this store and the <HistoryRouter> component need to
    // observe navigation. Subscribe once here and fan the updates out to any
    // additional listeners.
    const listeners = new Set<Listener>();
    history.listen(update => {
      runInAction(() => {
        this.location = update.location;
      });
      listeners.forEach(listener => listener(update));
    });

    // Expose a history that hands out fan-out subscriptions instead of the
    // single underlying one. A proxy is used so that the `location` and
    // `action` getters continue to read through to the real history object.
    this.history = new Proxy(history, {
      get: (target, prop, receiver) => {
        if (prop !== 'listen') return Reflect.get(target, prop, receiver);
        return (listener: Listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        };
      },
    });
  }

  /*
   * History methods
   */
  push(location: string) {
    this.history.push(location);
  }
}
