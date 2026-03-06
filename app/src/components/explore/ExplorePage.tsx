import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStore } from 'store';
import { Button } from 'components/base';
import Unit from 'components/common/Unit';
import { Loader2, Search, Compass } from 'lucide-react';

interface NodeRanking {
  publicKey: string;
  alias: string;
  channels: number;
  capacity: number;
  firstSeen: number;
  updatedAt: number;
  country?: { en?: string } | null;
  iso_code?: string | null;
}

interface UniverseAsset {
  assetId: string;
  name: string;
  supply: string;
  proofType: string;
}

interface UniverseStats {
  totalAssets: number;
  totalGroups: number;
  totalProofs: number;
  totalSyncs: number;
}

const MEMPOOL_API = 'https://mempool.space/api/v1/lightning/nodes/rankings';
const UNIVERSE_API = 'https://universe.lightning.finance/v1/taproot-assets';

const Styled = {
  Wrapper: styled.div`
    padding: 24px 32px;
    min-height: 100vh;
    background: radial-gradient(ellipse at 50% 50%, #0f1218 0%, #090b10 100%);
  `,
  Header: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 40px;
    margin-bottom: 24px;
  `,
  Title: styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  Tabs: styled.div`
    display: flex;
    gap: 4px;
    background: rgba(255, 255, 255, 0.04);
    padding: 3px;
    border-radius: 8px;
  `,
  Tab: styled.button<{ active?: boolean }>`
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    padding: 6px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    color: ${p => (p.active ? '#fff' : 'rgba(255,255,255,0.5)')};
    background: ${p => (p.active ? 'rgba(255,255,255,0.1)' : 'transparent')};

    &:hover {
      color: ${p => (p.active ? '#fff' : 'rgba(255,255,255,0.7)')};
    }
  `,
  SearchBar: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    margin-bottom: 16px;
    max-width: 400px;
  `,
  SearchInput: styled.input`
    flex: 1;
    border: none;
    background: none;
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    outline: none;

    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
  `,
  StatsRow: styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
  `,
  StatChip: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
  `,
  StatNum: styled.span`
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    font-variant-numeric: tabular-nums;
  `,
  StatLabel: styled.span`
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
  Table: styled.table`
    width: 100%;
    border-collapse: collapse;
  `,
  Th: styled.th`
    text-align: left;
    padding: 10px 12px;
    font-size: 10px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.35);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    white-space: nowrap;

    &:last-child {
      text-align: right;
    }
  `,
  Td: styled.td`
    padding: 12px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;

    &:last-child {
      text-align: right;
    }
  `,
  Tr: styled.tr`
    transition: background 0.1s ease;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.03);
    }
  `,
  Rank: styled.span`
    font-weight: 600;
    color: rgba(255, 255, 255, 0.4);
    font-size: 12px;
    min-width: 30px;
    display: inline-block;
  `,
  NodeAlias: styled.span`
    font-weight: 500;
    color: #fff;
  `,
  CapacityBar: styled.div<{ pct: number }>`
    height: 3px;
    border-radius: 2px;
    background: rgba(139, 92, 246, 0.15);
    margin-top: 4px;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: ${p => p.pct}%;
      background: rgba(139, 92, 246, 0.6);
      border-radius: 2px;
    }
  `,
  Grid: styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  `,
  Card: styled.div`
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }
  `,
  CardHeader: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  `,
  NodeDot: styled.div<{ active?: boolean }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${p => (p.active ? '#10B981' : '#6b7280')};
    flex-shrink: 0;
  `,
  CardTitle: styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    letter-spacing: -0.01em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  `,
  CardMeta: styled.div`
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  `,
  MetaItem: styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
  `,
  MetaLabel: styled.span`
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.35);
  `,
  MetaValue: styled.span`
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    font-variant-numeric: tabular-nums;
  `,
  CTARow: styled.div`
    display: flex;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
  `,
  CountryFlag: styled.span`
    font-size: 11px;
    margin-left: 6px;
    color: rgba(255, 255, 255, 0.35);
  `,
  AssetIcon: styled.div`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  `,
  AssetType: styled.span`
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(139, 92, 246, 0.12);
    color: #a78bfa;
    font-weight: 500;
  `,
  LoadingState: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 24px;
    color: rgba(255, 255, 255, 0.4);
    gap: 12px;
    font-size: 13px;
  `,
  Spinner: styled.div`
    animation: spin 1s linear infinite;
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `,
  EmptyState: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 24px;
    text-align: center;
  `,
  EmptyTitle: styled.div`
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 8px;
  `,
  EmptyDesc: styled.div`
    font-size: 13px;
    color: rgba(255, 255, 255, 0.35);
    max-width: 400px;
    margin-bottom: 20px;
  `,
};

const formatCapacity = (sats: number) => {
  if (sats >= 100000000) return `${(sats / 100000000).toFixed(2)} BTC`;
  if (sats >= 1000000) return `${(sats / 1000000).toFixed(1)}M sats`;
  if (sats >= 1000) return `${Math.round(sats / 1000)}K sats`;
  return `${sats} sats`;
};

const formatSupply = (supply: string) => {
  const n = parseInt(supply, 10);
  if (isNaN(n)) return supply;
  return n.toLocaleString();
};

const formatAge = (timestamp: number) => {
  const now = Date.now() / 1000;
  const days = Math.floor((now - timestamp) / 86400);
  if (days >= 365) return `${Math.floor(days / 365)}y`;
  if (days >= 30) return `${Math.floor(days / 30)}mo`;
  return `${days}d`;
};

type ExploreTab = 'channels' | 'nodes' | 'assets';

const ExplorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ExploreTab>('nodes');
  const { channelStore } = useStore();
  const channels = channelStore.sortedChannels;

  const [nodeRankings, setNodeRankings] = useState<NodeRanking[]>([]);
  const [nodesLoading, setNodesLoading] = useState(false);
  const [nodeSearch, setNodeSearch] = useState('');

  const [assets, setAssets] = useState<UniverseAsset[]>([]);
  const [universeStats, setUniverseStats] = useState<UniverseStats | null>(null);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');

  const fetchNodes = useCallback(async () => {
    setNodesLoading(true);
    try {
      const [connRes, liqRes] = await Promise.all([
        fetch(`${MEMPOOL_API}/connectivity`),
        fetch(`${MEMPOOL_API}/liquidity`),
      ]);
      const connData: NodeRanking[] = await connRes.json();
      const liqData: NodeRanking[] = await liqRes.json();

      const merged = new Map<string, NodeRanking>();
      liqData.forEach(n => merged.set(n.publicKey, n));
      connData.forEach(n => {
        if (!merged.has(n.publicKey)) merged.set(n.publicKey, n);
      });

      const sorted = Array.from(merged.values()).sort((a, b) => b.capacity - a.capacity);
      setNodeRankings(sorted);
    } catch (e) {
      console.error('Failed to fetch node rankings:', e);
    }
    setNodesLoading(false);
  }, []);

  const fetchAssets = useCallback(async () => {
    setAssetsLoading(true);
    try {
      const [rootsRes, statsRes] = await Promise.all([
        fetch(`${UNIVERSE_API}/universe/roots`),
        fetch(`${UNIVERSE_API}/universe/stats`),
      ]);
      const rootsData = await rootsRes.json();
      const statsData = await statsRes.json();

      setUniverseStats({
        totalAssets: parseInt(statsData.num_total_assets || '0', 10),
        totalGroups: parseInt(statsData.num_total_groups || '0', 10),
        totalProofs: parseInt(statsData.num_total_proofs || '0', 10),
        totalSyncs: parseInt(statsData.num_total_syncs || '0', 10),
      });

      const roots = rootsData.universe_roots || {};
      const parsed: UniverseAsset[] = Object.values(roots).map((root: any) => ({
        assetId: root.id?.asset_id || '',
        name: root.asset_name || 'Unknown',
        supply: root.mssmt_root?.root_sum || '0',
        proofType: root.id?.proof_type === 'PROOF_TYPE_TRANSFER' ? 'Transfer' : 'Asset',
      }));
      parsed.sort((a, b) => a.name.localeCompare(b.name));
      setAssets(parsed);
    } catch (e) {
      console.error('Failed to fetch universe assets:', e);
    }
    setAssetsLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'nodes' && nodeRankings.length === 0) fetchNodes();
    if (activeTab === 'assets' && assets.length === 0) fetchAssets();
  }, [activeTab, nodeRankings.length, assets.length, fetchNodes, fetchAssets]);

  const maxCapacity = nodeRankings.length > 0 ? nodeRankings[0].capacity : 1;

  const filteredNodes = nodeSearch
    ? nodeRankings.filter(n => n.alias.toLowerCase().includes(nodeSearch.toLowerCase()))
    : nodeRankings;

  const filteredAssets = assetSearch
    ? assets.filter(a => a.name.toLowerCase().includes(assetSearch.toLowerCase()))
    : assets;

  const {
    Wrapper,
    Header,
    Title,
    Tabs,
    Tab,
    SearchBar,
    SearchInput,
    StatsRow,
    StatChip,
    StatNum,
    StatLabel,
    Table,
    Th,
    Td,
    Tr,
    Rank,
    NodeAlias,
    CountryFlag,
    CapacityBar,
    Grid,
    Card,
    CardHeader,
    NodeDot,
    CardTitle,
    CardMeta,
    MetaItem,
    MetaLabel,
    MetaValue,
    CTARow,
    AssetIcon,
    AssetType,
    LoadingState,
    Spinner,
    EmptyState,
    EmptyTitle,
    EmptyDesc,
  } = Styled;

  return (
    <Wrapper>
      <Header>
        <Title>
          <Compass size={18} />
          Explore
        </Title>
        <Tabs>
          <Tab active={activeTab === 'channels'} onClick={() => setActiveTab('channels')}>
            My Channels
          </Tab>
          <Tab active={activeTab === 'nodes'} onClick={() => setActiveTab('nodes')}>
            Nodes
          </Tab>
          <Tab active={activeTab === 'assets'} onClick={() => setActiveTab('assets')}>
            Assets
          </Tab>
        </Tabs>
      </Header>

      {activeTab === 'channels' && (
        <>
          {channels.length > 0 ? (
            <Grid>
              {channels.map(ch => (
                <Card key={ch.chanId}>
                  <CardHeader>
                    <NodeDot active={ch.status === 'Open'} />
                    <CardTitle>{ch.aliasLabel}</CardTitle>
                  </CardHeader>
                  <CardMeta>
                    <MetaItem>
                      <MetaLabel>Capacity</MetaLabel>
                      <MetaValue>
                        <Unit sats={ch.capacity} />
                      </MetaValue>
                    </MetaItem>
                    <MetaItem>
                      <MetaLabel>Local</MetaLabel>
                      <MetaValue>
                        <Unit sats={ch.localBalance} />
                      </MetaValue>
                    </MetaItem>
                    <MetaItem>
                      <MetaLabel>Remote</MetaLabel>
                      <MetaValue>
                        <Unit sats={ch.remoteBalance} />
                      </MetaValue>
                    </MetaItem>
                    <MetaItem>
                      <MetaLabel>Uptime</MetaLabel>
                      <MetaValue>{ch.uptimePercent}</MetaValue>
                    </MetaItem>
                  </CardMeta>
                  <CTARow>
                    <Button compact primary>
                      Rebalance
                    </Button>
                    <Button compact ghost>
                      Details
                    </Button>
                  </CTARow>
                </Card>
              ))}
            </Grid>
          ) : (
            <EmptyState>
              <EmptyTitle>No channels yet</EmptyTitle>
              <EmptyDesc>
                Open your first channel to start routing payments on the Lightning
                Network.
              </EmptyDesc>
              <Button primary>Open Channel</Button>
            </EmptyState>
          )}
        </>
      )}

      {activeTab === 'nodes' && (
        <>
          <SearchBar>
            <Search size={14} strokeWidth={1.5} />
            <SearchInput
              placeholder="Search nodes by alias..."
              value={nodeSearch}
              onChange={e => setNodeSearch(e.target.value)}
            />
          </SearchBar>
          {nodesLoading ? (
            <LoadingState>
              <Spinner>
                <Loader2 size={20} strokeWidth={1.5} />
              </Spinner>
              Loading node rankings...
            </LoadingState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Node</Th>
                  <Th>Channels</Th>
                  <Th>Capacity</Th>
                  <Th>Age</Th>
                </tr>
              </thead>
              <tbody>
                {filteredNodes.slice(0, 100).map((node, i) => (
                  <Tr
                    key={node.publicKey}
                    onClick={() =>
                      window.open(
                        `https://mempool.space/lightning/node/${node.publicKey}`,
                        '_blank',
                      )
                    }
                  >
                    <Td>
                      <Rank>{i + 1}</Rank>
                    </Td>
                    <Td>
                      <NodeAlias>{node.alias || 'Unknown'}</NodeAlias>
                      {node.iso_code && (
                        <CountryFlag>{node.country?.en || node.iso_code}</CountryFlag>
                      )}
                    </Td>
                    <Td>{node.channels.toLocaleString()}</Td>
                    <Td>
                      {formatCapacity(node.capacity)}
                      <CapacityBar pct={(node.capacity / maxCapacity) * 100} />
                    </Td>
                    <Td>{formatAge(node.firstSeen)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}

      {activeTab === 'assets' && (
        <>
          {universeStats && (
            <StatsRow>
              <StatChip>
                <StatNum>{universeStats.totalProofs.toLocaleString()}</StatNum>
                <StatLabel>Asset Mints</StatLabel>
              </StatChip>
              <StatChip>
                <StatNum>{universeStats.totalAssets.toLocaleString()}</StatNum>
                <StatLabel>Total Assets</StatLabel>
              </StatChip>
              <StatChip>
                <StatNum>{universeStats.totalGroups.toLocaleString()}</StatNum>
                <StatLabel>Groups</StatLabel>
              </StatChip>
            </StatsRow>
          )}
          <SearchBar>
            <Search size={14} strokeWidth={1.5} />
            <SearchInput
              placeholder="Search name, ID, or group key"
              value={assetSearch}
              onChange={e => setAssetSearch(e.target.value)}
            />
          </SearchBar>
          {assetsLoading ? (
            <LoadingState>
              <Spinner>
                <Loader2 size={20} strokeWidth={1.5} />
              </Spinner>
              Loading Taproot Assets Universe...
            </LoadingState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Supply</Th>
                  <Th>Type</Th>
                  <Th>Asset ID</Th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map(asset => (
                  <Tr key={asset.assetId}>
                    <Td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <AssetIcon>{asset.name.charAt(0).toUpperCase()}</AssetIcon>
                        <NodeAlias>{asset.name}</NodeAlias>
                      </div>
                    </Td>
                    <Td>{formatSupply(asset.supply)}</Td>
                    <Td>
                      <AssetType>{asset.proofType}</AssetType>
                    </Td>
                    <Td>
                      <span
                        style={{
                          opacity: 0.4,
                          fontSize: 11,
                          fontFamily: 'monospace',
                        }}
                      >
                        {asset.assetId.substring(0, 12)}...
                      </span>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </Wrapper>
  );
};

export default observer(ExplorePage);
