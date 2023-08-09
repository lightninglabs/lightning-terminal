import { makeAutoObservable, runInAction } from 'mobx';
import { Store } from 'store';
import { SubServerStatus } from 'types/state';

/** processed data for specific subservices we need to display in the UI */
interface SubServers {
  loop: SubServerStatus;
  pool: SubServerStatus;
}

export default class SubServerStore {
  private _store: Store;

  loading = false;

  subServers: SubServers = {
    loop: {
      disabled: false,
      running: true,
      error: '',
    },
    pool: {
      disabled: false,
      running: true,
      error: '',
    },
  };

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  /** fetch subserver statuses from the lit API */
  async fetchStatus() {
    try {
      this.loading = true;
      const serverStatus = await this._store.api.lit.listSubServerStatus();

      serverStatus.subServersMap.map(([serverName, serverStatus]) => {
        runInAction(() => {
          if (serverName === 'pool') {
            this.subServers.pool = serverStatus;
          } else if (serverName === 'loop') {
            this.subServers.loop = serverStatus;
          }
        });
      });
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to fetch SubServer Status');
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}
