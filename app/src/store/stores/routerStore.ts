import { makeAutoObservable, runInAction } from 'mobx';
import { History, Location } from 'history';

export default class RouterStore {
  /** the history object */
  history: History;

  /** the current location from the browser's history */
  location: Location;

  constructor(history: History) {
    makeAutoObservable(this, { history: false }, { deep: false, autoBind: true });

    this.history = history;
    this.location = history.location;

    history.listen(({ location }) => {
      runInAction(() => {
        this.location = location;
      });
    });
  }

  /*
   * History methods
   */
  push(location: string) {
    this.history.push(location);
  }
}
