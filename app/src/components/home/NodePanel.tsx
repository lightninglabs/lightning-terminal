import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import {
  Copy,
  Check,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  WifiOff,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { NodeConnection, NodeChannel } from 'store/stores/nodeConnectionStore';

interface Props {
  node: NodeConnection;
  colorIndex: number;
  onOpenChannel?: (targetPubkey: string, targetAlias: string) => void;
}

const NODE_COLORS = ['#6366f1', '#0ea5e9', '#f59e0b', '#22c55e', '#ec4899'];

const formatSats = (sats: number) => {
  if (sats >= 100000000) return `${(sats / 100000000).toFixed(2)} BTC`;
  if (sats >= 1000000) return `${(sats / 1000000).toFixed(1)}M sats`;
  return `${sats.toLocaleString()} sats`;
};

const NodePanel: React.FC<Props> = ({ node, colorIndex, onOpenChannel }) => {
  const [copiedPk, setCopiedPk] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const accentColor = NODE_COLORS[colorIndex % NODE_COLORS.length];

  const handleCopy = useCallback(async () => {
    if (!node.pubkey) return;
    try {
      await navigator.clipboard.writeText(node.pubkey);
    } catch {
      const el = document.createElement('textarea');
      el.value = node.pubkey;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedPk(true);
    setTimeout(() => setCopiedPk(false), 2000);
  }, [node.pubkey]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await node.fetchInfo();
    await node.fetchChannels();
    setRefreshing(false);
  }, [node]);

  if (!node.connected) {
    return (
      <S.Panel>
        <S.DisconnectedState>
          <WifiOff size={24} strokeWidth={1.5} />
          <S.DisconnectedLabel>{node.displayName}</S.DisconnectedLabel>
          <S.DisconnectedHint>Not connected</S.DisconnectedHint>
        </S.DisconnectedState>
      </S.Panel>
    );
  }

  const activeChannels = node.channels.filter(ch => ch.active);
  const totalCapacity = node.channels.reduce((s, ch) => s + ch.capacity, 0);

  return (
    <S.Panel>
      <S.Header>
        <S.NodeBadge style={{ background: accentColor }}>{node.initial}</S.NodeBadge>
        <S.HeaderInfo>
          <S.Alias>{node.displayName}</S.Alias>
          <S.PubkeyRow>
            <S.Pubkey>
              {node.pubkey
                ? `${node.pubkey.slice(0, 10)}...${node.pubkey.slice(-6)}`
                : ''}
            </S.Pubkey>
            {node.pubkey && (
              <S.CopyBtn onClick={handleCopy} title="Copy pubkey">
                {copiedPk ? <Check size={10} /> : <Copy size={10} />}
              </S.CopyBtn>
            )}
          </S.PubkeyRow>
        </S.HeaderInfo>
        <S.RefreshBtn onClick={handleRefresh} title="Refresh data">
          {refreshing ? (
            <SpinnerSmall size={12} />
          ) : (
            <RefreshCw size={12} strokeWidth={1.5} />
          )}
        </S.RefreshBtn>
      </S.Header>

      <S.BalanceGrid>
        <S.BalanceCard>
          <S.BalanceIcon>
            <Wallet size={12} />
          </S.BalanceIcon>
          <S.BalanceLabel>On-chain</S.BalanceLabel>
          <S.BalanceValue>{formatSats(node.walletBalanceConfirmed)}</S.BalanceValue>
        </S.BalanceCard>
        <S.BalanceCard>
          <S.BalanceIcon>
            <ArrowUpRight size={12} />
          </S.BalanceIcon>
          <S.BalanceLabel>Outbound</S.BalanceLabel>
          <S.BalanceValue>{formatSats(node.channelBalanceLocal)}</S.BalanceValue>
        </S.BalanceCard>
        <S.BalanceCard>
          <S.BalanceIcon>
            <ArrowDownLeft size={12} />
          </S.BalanceIcon>
          <S.BalanceLabel>Inbound</S.BalanceLabel>
          <S.BalanceValue>{formatSats(node.channelBalanceRemote)}</S.BalanceValue>
        </S.BalanceCard>
      </S.BalanceGrid>

      <S.SectionHeader>
        <S.SectionTitle>
          <Zap size={12} />
          Channels ({activeChannels.length}/{node.channels.length})
        </S.SectionTitle>
        {totalCapacity > 0 && (
          <S.SectionMeta>{formatSats(totalCapacity)} total</S.SectionMeta>
        )}
      </S.SectionHeader>

      <S.ChannelList>
        {node.channels.length === 0 ? (
          <S.EmptyChannels>No channels yet</S.EmptyChannels>
        ) : (
          node.channels.map(ch => (
            <ChannelRow
              key={ch.chanId || ch.remotePubkey}
              channel={ch}
              accentColor={accentColor}
              onOpenChannel={onOpenChannel}
            />
          ))
        )}
      </S.ChannelList>
    </S.Panel>
  );
};

const ChannelRow: React.FC<{
  channel: NodeChannel;
  accentColor: string;
  onOpenChannel?: (pubkey: string, alias: string) => void;
}> = observer(({ channel, accentColor }) => {
  const total = channel.localBalance + channel.remoteBalance;
  const localPct = total > 0 ? (channel.localBalance / total) * 100 : 50;

  return (
    <S.ChannelItem>
      <S.ChannelDot active={channel.active} />
      <S.ChannelInfo>
        <S.ChannelPeer>
          {channel.alias || `${channel.remotePubkey.slice(0, 12)}...`}
        </S.ChannelPeer>
        <S.ChannelBar>
          <S.ChannelBarLocal style={{ width: `${localPct}%`, background: accentColor }} />
        </S.ChannelBar>
        <S.ChannelMeta>
          <span>{formatSats(channel.localBalance)}</span>
          <span>{formatSats(channel.capacity)}</span>
          <span>{formatSats(channel.remoteBalance)}</span>
        </S.ChannelMeta>
      </S.ChannelInfo>
    </S.ChannelItem>
  );
});

export default observer(NodePanel);

const SpinnerSmall = styled(Loader2)`
  animation: spin 1s linear infinite;
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const S = {
  Panel: styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow-y: auto;
    min-width: 0;
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 2px;
    }
  `,
  Header: styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  `,
  NodeBadge: styled.div`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  `,
  HeaderInfo: styled.div`
    flex: 1;
    min-width: 0;
  `,
  Alias: styled.div`
    font-size: 15px;
    font-weight: 600;
    color: #e2e8f0;
    letter-spacing: -0.01em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  PubkeyRow: styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
  `,
  Pubkey: styled.span`
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.3);
    letter-spacing: 0.02em;
  `,
  CopyBtn: styled.button`
    background: none;
    border: none;
    color: #a78bfa;
    cursor: pointer;
    padding: 1px;
    display: flex;
    align-items: center;
    border-radius: 3px;
    &:hover {
      color: #c4b5fd;
    }
  `,
  RefreshBtn: styled.button`
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    &:hover {
      color: rgba(255, 255, 255, 0.7);
      background: rgba(255, 255, 255, 0.05);
    }
  `,
  BalanceGrid: styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 20px;
  `,
  BalanceCard: styled.div`
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 10px;
    padding: 10px;
  `,
  BalanceIcon: styled.div`
    color: rgba(255, 255, 255, 0.3);
    margin-bottom: 4px;
  `,
  BalanceLabel: styled.div`
    font-size: 10px;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  `,
  BalanceValue: styled.div`
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
  `,
  SectionHeader: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  `,
  SectionTitle: styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  `,
  SectionMeta: styled.span`
    font-size: 10px;
    color: rgba(255, 255, 255, 0.25);
    font-variant-numeric: tabular-nums;
  `,
  ChannelList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  `,
  EmptyChannels: styled.div`
    text-align: center;
    color: rgba(255, 255, 255, 0.2);
    font-size: 12px;
    padding: 24px 0;
  `,
  ChannelItem: styled.div`
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid rgba(255, 255, 255, 0.03);
    transition: background 0.1s;
    &:hover {
      background: rgba(255, 255, 255, 0.035);
    }
  `,
  ChannelDot: styled.div<{ active: boolean }>`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${p => (p.active ? '#22c55e' : '#64748b')};
    margin-top: 5px;
    flex-shrink: 0;
  `,
  ChannelInfo: styled.div`
    flex: 1;
    min-width: 0;
  `,
  ChannelPeer: styled.div`
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.75);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 4px;
  `,
  ChannelBar: styled.div`
    height: 3px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.06);
    overflow: hidden;
    margin-bottom: 3px;
  `,
  ChannelBarLocal: styled.div`
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s ease;
  `,
  ChannelMeta: styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: rgba(255, 255, 255, 0.25);
    font-variant-numeric: tabular-nums;
  `,
  DisconnectedState: styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.2);
    gap: 8px;
  `,
  DisconnectedLabel: styled.div`
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.4);
  `,
  DisconnectedHint: styled.div`
    font-size: 12px;
    color: rgba(255, 255, 255, 0.2);
  `,
};
