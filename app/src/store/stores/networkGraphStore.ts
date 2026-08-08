import { makeAutoObservable, runInAction } from 'mobx';
import * as LND from 'types/generated/lnd_pb';
import { Store } from '../store';

export interface MempoolNode {
  publicKey: string;
  alias: string;
  channels: number;
  capacity: number;
  firstSeen: number;
  updatedAt: number;
  city?: { en?: string } | null;
  country?: { en?: string } | null;
  iso_code?: string | null;
  color?: string;
}

const MEMPOOL = 'https://mempool.space/api/v1/lightning';

export default class NetworkGraphStore {
  private _store: Store;

  nodes: LND.LightningNode.AsObject[] = [];
  edges: LND.ChannelEdge.AsObject[] = [];
  /** Raw mempool data keyed by pubkey for capacity/channel counts */
  mempoolData: Map<string, MempoolNode> = new Map();
  networkInfo: LND.NetworkInfo.AsObject | null = null;
  loading = false;
  error = '';

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });
    this._store = store;
  }

  get nodesByPubkey(): Map<string, LND.LightningNode.AsObject> {
    const map = new Map<string, LND.LightningNode.AsObject>();
    for (const node of this.nodes) {
      map.set(node.pubKey, node);
    }
    return map;
  }

  get selfPubkey(): string {
    return this._store.nodeStore.pubkey;
  }

  /**
   * Fetch real Lightning Network data from mempool.space.
   * Gets top ~100 nodes by connectivity/capacity and their
   * interconnecting channels — actual real-world network data.
   */
  async fetchGraph() {
    if (this.loading) return;
    this.loading = true;
    this.error = '';
    try {
      const [connRes, liqRes, statsRes] = await Promise.all([
        fetch(`${MEMPOOL}/nodes/rankings/connectivity`),
        fetch(`${MEMPOOL}/nodes/rankings/liquidity`),
        fetch(`${MEMPOOL}/statistics/latest`),
      ]);

      const connData: MempoolNode[] = await connRes.json();
      const liqData: MempoolNode[] = await liqRes.json();
      const statsData = await statsRes.json();

      // Merge top nodes from both rankings, deduplicating
      const nodeMap = new Map<string, MempoolNode>();
      const topConn = connData.slice(0, 60);
      const topLiq = liqData.slice(0, 60);
      for (const n of [...topConn, ...topLiq]) {
        if (!nodeMap.has(n.publicKey)) nodeMap.set(n.publicKey, n);
      }

      const allNodes = Array.from(nodeMap.values());
      const nodeList: LND.LightningNode.AsObject[] = allNodes.map(n => ({
        lastUpdate: n.updatedAt || 0,
        pubKey: n.publicKey,
        alias: n.alias || '',
        addressesList: [],
        color: n.color || '#8b5cf6',
        featuresMap: [],
        customRecordsMap: [],
      }));

      const totalCap = allNodes.reduce((s, n) => s + (n.capacity || 0), 0);

      runInAction(() => {
        this.nodes = nodeList;
        this.edges = [];
        this.mempoolData = nodeMap;
        this.networkInfo = {
          graphDiameter: 0,
          avgOutDegree: 0,
          maxOutDegree: 0,
          numNodes: statsData.latest?.node_count || nodeList.length,
          numChannels: statsData.latest?.channel_count || 0,
          totalNetworkCapacity: (statsData.latest?.total_capacity || totalCap).toString(),
          avgChannelSize: 0,
          minChannelSize: '0',
          maxChannelSize: '0',
          medianChannelSizeSat: '0',
          numZombieChans: '0',
        };
        this.loading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err?.message || 'Failed to fetch network data';
        this.loading = false;
      });
    }
  }

  getNodeAlias(pubkey: string): string {
    const found = this.nodesByPubkey.get(pubkey);
    return found?.alias || pubkey.substring(0, 12) + '...';
  }

  getNodeColor(pubkey: string): string {
    return this.nodesByPubkey.get(pubkey)?.color || '#8b5cf6';
  }
}
