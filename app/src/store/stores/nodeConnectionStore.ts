import { makeAutoObservable, observable, runInAction } from 'mobx';
import LNC from '@lightninglabs/lnc-web';
import LncApi from 'api/lncApi';
import { Store } from 'store';

const STORAGE_KEY = 'lit-node-connections';

export interface NodeChannel {
  chanId: string;
  remotePubkey: string;
  capacity: number;
  localBalance: number;
  remoteBalance: number;
  active: boolean;
  alias: string;
}

interface SavedNodeMeta {
  id: string;
  label: string;
  type: 'lnc' | 'direct';
  lncNamespace?: string;
}

export class NodeConnection {
  id: string;
  label: string;
  type: 'lnc' | 'direct';
  connected = false;
  connecting = false;
  error = '';
  api: LncApi | null = null;
  pubkey = '';
  alias = '';
  channelBalanceLocal = 0;
  channelBalanceRemote = 0;
  walletBalanceConfirmed = 0;
  walletBalanceUnconfirmed = 0;
  channels: NodeChannel[] = [];
  lncNamespace: string;

  private _lnc: LNC | null = null;

  constructor(id: string, label: string, type: 'lnc' | 'direct', namespace?: string) {
    this.id = id;
    this.label = label;
    this.type = type;
    this.lncNamespace = namespace || `lnc-node-${id}`;
    makeAutoObservable(this, {}, { deep: false, autoBind: true });
  }

  async connectLnc(pairingPhrase: string, password: string) {
    this.connecting = true;
    this.error = '';
    try {
      const lnc = new LNC({
        pairingPhrase: pairingPhrase.trim(),
        password,
        namespace: this.lncNamespace,
      });
      await lnc.connect();
      if (!lnc.isConnected) {
        throw new Error('Failed to establish LNC connection');
      }
      this._lnc = lnc;
      const api = new LncApi(lnc);
      runInAction(() => {
        this.api = api;
        this.connected = true;
        this.connecting = false;
      });
      LncApi.markPairedFor(this.lncNamespace);
      await this.fetchInfo();
      await this.fetchChannels();
    } catch (err: any) {
      runInAction(() => {
        this.connecting = false;
        this.error = err?.message || 'Connection failed';
        this.connected = false;
      });
      throw err;
    }
  }

  async reconnectLnc(password: string) {
    this.connecting = true;
    this.error = '';
    try {
      const lnc = new LNC({
        password,
        namespace: this.lncNamespace,
      });
      await lnc.connect();
      if (!lnc.isConnected) {
        throw new Error('Failed to reconnect via LNC');
      }
      this._lnc = lnc;
      const api = new LncApi(lnc);
      runInAction(() => {
        this.api = api;
        this.connected = true;
        this.connecting = false;
      });
      await this.fetchInfo();
      await this.fetchChannels();
    } catch (err: any) {
      runInAction(() => {
        this.connecting = false;
        this.error = err?.message || 'Reconnection failed';
        this.connected = false;
      });
      throw err;
    }
  }

  async fetchInfo() {
    if (!this.api) return;
    try {
      const info = await this.api.getInfo();
      runInAction(() => {
        this.pubkey = info.identityPubkey || '';
        this.alias = info.alias || this.label;
      });
    } catch {
      // non-fatal
    }

    try {
      const cb = await this.api.channelBalance();
      const wb = await this.api.walletBalance();
      runInAction(() => {
        this.channelBalanceLocal = Number(cb.localBalance?.sat || cb.balance || 0);
        this.channelBalanceRemote = Number(cb.remoteBalance?.sat || 0);
        this.walletBalanceConfirmed = Number(wb.confirmedBalance || wb.totalBalance || 0);
        this.walletBalanceUnconfirmed = Number(wb.unconfirmedBalance || 0);
      });
    } catch {
      // non-fatal
    }
  }

  async fetchChannels() {
    if (!this.api) return;
    try {
      const res: any = await this.api.listChannels();
      const raw: any[] = res.channelsList || res.channels || [];
      const chans: NodeChannel[] = raw.map((ch: any) => ({
        chanId: ch.chanId || '',
        remotePubkey: ch.remotePubkey || '',
        capacity: Number(ch.capacity || 0),
        localBalance: Number(ch.localBalance || 0),
        remoteBalance: Number(ch.remoteBalance || 0),
        active: !!ch.active,
        alias: '',
      }));
      runInAction(() => {
        this.channels = chans;
      });
    } catch {
      // non-fatal
    }
  }

  disconnect() {
    if (this._lnc) {
      try {
        this._lnc.disconnect();
      } catch {
        // ignore
      }
      this._lnc = null;
    }
    this.api = null;
    this.connected = false;
    this.channels = [];
    this.pubkey = '';
    this.alias = '';
  }

  get initial() {
    return (this.alias || this.label || '?').charAt(0).toUpperCase();
  }

  get displayName() {
    return this.alias || this.label || `Node ${this.id}`;
  }
}

export default class NodeConnectionStore {
  private _store: Store;

  connections = observable.map<string, NodeConnection>();
  activeLeftId: string | null = null;
  activeRightId: string | null = null;

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });
    this._store = store;
  }

  get connectedNodes(): NodeConnection[] {
    return Array.from(this.connections.values()).filter(n => n.connected);
  }

  get allNodes(): NodeConnection[] {
    return Array.from(this.connections.values());
  }

  get activeLeft(): NodeConnection | null {
    if (!this.activeLeftId) return null;
    return this.connections.get(this.activeLeftId) || null;
  }

  get activeRight(): NodeConnection | null {
    if (!this.activeRightId) return null;
    return this.connections.get(this.activeRightId) || null;
  }

  get hasMultipleConnected(): boolean {
    return this.connectedNodes.length >= 2;
  }

  get channelBetweenActive(): NodeChannel | null {
    const left = this.activeLeft;
    const right = this.activeRight;
    if (!left?.connected || !right?.connected) return null;
    return (
      left.channels.find(ch => ch.remotePubkey === right.pubkey) ||
      right.channels.find(ch => ch.remotePubkey === left.pubkey) ||
      null
    );
  }

  setActiveLeft(id: string) {
    this.activeLeftId = id;
  }

  setActiveRight(id: string) {
    this.activeRightId = id;
  }

  async addLncNode(
    label: string,
    pairingPhrase: string,
    password: string,
  ): Promise<NodeConnection> {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const node = new NodeConnection(id, label, 'lnc');
    this.connections.set(id, node);
    await node.connectLnc(pairingPhrase, password);
    this._autoAssignActive(id);
    this._persist();
    return node;
  }

  async reconnectNode(id: string, password: string) {
    const node = this.connections.get(id);
    if (!node || node.type !== 'lnc') return;
    await node.reconnectLnc(password);
    this._autoAssignActive(id);
  }

  removeNode(id: string) {
    const node = this.connections.get(id);
    if (node) {
      node.disconnect();
      LncApi.clearPairedFor(node.lncNamespace);
    }
    this.connections.delete(id);
    if (this.activeLeftId === id) {
      this.activeLeftId = this.connectedNodes[0]?.id || null;
    }
    if (this.activeRightId === id) {
      this.activeRightId = this.connectedNodes[1]?.id || null;
    }
    this._persist();
  }

  registerPrimaryNode() {
    const { nodeStore } = this._store;
    const pk = nodeStore.pubkey;
    if (!pk) return;
    const existing = Array.from(this.connections.values()).find(n => n.pubkey === pk);
    if (existing) return;

    const node = new NodeConnection('primary', nodeStore.alias || 'My Node', 'direct');
    node.connected = true;
    node.pubkey = pk;
    node.alias = nodeStore.alias || 'My Node';
    node.api = this._store.api.lnd as any;
    this.connections.set('primary', node);
    if (!this.activeLeftId) {
      this.activeLeftId = 'primary';
    }
  }

  async refreshAllData() {
    const promises = this.connectedNodes.map(async n => {
      await n.fetchInfo();
      await n.fetchChannels();
    });
    await Promise.allSettled(promises);
  }

  init() {
    this._restore();
  }

  private _autoAssignActive(id: string) {
    if (!this.activeLeftId) {
      this.activeLeftId = id;
    } else if (!this.activeRightId && this.activeLeftId !== id) {
      this.activeRightId = id;
    }
  }

  private _persist() {
    const metas: SavedNodeMeta[] = Array.from(this.connections.values())
      .filter(n => n.id !== 'primary')
      .map(n => ({
        id: n.id,
        label: n.label,
        type: n.type,
        lncNamespace: n.lncNamespace,
      }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metas));
  }

  private _restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const metas: SavedNodeMeta[] = JSON.parse(raw);
      for (const meta of metas) {
        const node = new NodeConnection(
          meta.id,
          meta.label,
          meta.type,
          meta.lncNamespace,
        );
        this.connections.set(meta.id, node);
      }
    } catch {
      // ignore corrupt data
    }
  }
}
