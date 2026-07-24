import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStore } from 'store';
import { Link2, ArrowRightLeft, Zap, Plus } from 'lucide-react';
import NodePanel from './NodePanel';
import OpenChannelModal from 'components/common/OpenChannelModal';

const formatSats = (sats: number) => {
  if (sats >= 100000000) return `${(sats / 100000000).toFixed(2)} BTC`;
  if (sats >= 1000000) return `${(sats / 1000000).toFixed(1)}M sats`;
  return `${sats.toLocaleString()} sats`;
};

const SplitNodeView: React.FC = () => {
  const { nodeConnectionStore } = useStore();
  const left = nodeConnectionStore.activeLeft;
  const right = nodeConnectionStore.activeRight;
  const [showOpenChannel, setShowOpenChannel] = useState(false);
  const [channelDirection, setChannelDirection] = useState<
    'left-to-right' | 'right-to-left'
  >('left-to-right');

  const existingChannel = nodeConnectionStore.channelBetweenActive;

  const channelFromRight = useMemo(() => {
    if (!left?.connected || !right?.connected) return null;
    return right.channels.find(ch => ch.remotePubkey === left.pubkey) || null;
  }, [left, right]);

  const sourceNode = channelDirection === 'left-to-right' ? left : right;
  const targetNode = channelDirection === 'left-to-right' ? right : left;

  const handleOpenChannel = () => {
    setShowOpenChannel(true);
  };

  const handleSwapDirection = () => {
    setChannelDirection(d => (d === 'left-to-right' ? 'right-to-left' : 'left-to-right'));
  };

  if (!left || !right) {
    return (
      <S.EmptyState>
        <Plus size={32} strokeWidth={1} />
        <S.EmptyTitle>Connect a Second Node</S.EmptyTitle>
        <S.EmptyDesc>
          Add another node using the node picker in the sidebar to see both nodes side by
          side and connect them.
        </S.EmptyDesc>
      </S.EmptyState>
    );
  }

  return (
    <S.Wrapper>
      <S.PanelContainer>
        <NodePanel node={left} colorIndex={0} />

        <S.Divider>
          {existingChannel || channelFromRight ? (
            <S.ChannelStatus>
              <S.ChannelStatusIcon connected>
                <Link2 size={16} />
              </S.ChannelStatusIcon>
              <S.ChannelStatusLabel>Connected</S.ChannelStatusLabel>
              <S.ChannelStatusDetail>
                {formatSats((existingChannel || channelFromRight)!.capacity)} channel
              </S.ChannelStatusDetail>
              <S.ChannelBalanceBar>
                <S.ChannelBalanceLocal
                  style={{
                    width: `${
                      ((existingChannel || channelFromRight)!.localBalance /
                        Math.max(
                          (existingChannel || channelFromRight)!.localBalance +
                            (existingChannel || channelFromRight)!.remoteBalance,
                          1,
                        )) *
                      100
                    }%`,
                  }}
                />
              </S.ChannelBalanceBar>
              <S.ChannelBalanceMeta>
                <span>
                  Local: {formatSats((existingChannel || channelFromRight)!.localBalance)}
                </span>
                <span>
                  Remote:{' '}
                  {formatSats((existingChannel || channelFromRight)!.remoteBalance)}
                </span>
              </S.ChannelBalanceMeta>
              <S.DividerOpenMore onClick={handleOpenChannel}>
                <Plus size={12} />
                Open Another Channel
              </S.DividerOpenMore>
            </S.ChannelStatus>
          ) : (
            <S.ConnectAction>
              <S.ConnectIcon>
                <Zap size={20} />
              </S.ConnectIcon>
              <S.ConnectLabel>No Channel</S.ConnectLabel>
              <S.ConnectHint>
                Connect these nodes by opening a channel between them.
              </S.ConnectHint>
              <S.DirectionPicker onClick={handleSwapDirection}>
                <S.DirectionNode active={channelDirection === 'left-to-right'}>
                  {left.displayName.slice(0, 12)}
                </S.DirectionNode>
                <ArrowRightLeft size={12} />
                <S.DirectionNode active={channelDirection === 'right-to-left'}>
                  {right.displayName.slice(0, 12)}
                </S.DirectionNode>
              </S.DirectionPicker>
              <S.DirectionHint>
                {sourceNode?.displayName} opens channel to {targetNode?.displayName}
              </S.DirectionHint>
              <S.ConnectBtn onClick={handleOpenChannel}>
                <Link2 size={14} />
                Open Channel
              </S.ConnectBtn>
            </S.ConnectAction>
          )}
        </S.Divider>

        <NodePanel node={right} colorIndex={1} />
      </S.PanelContainer>

      {showOpenChannel && targetNode && sourceNode && (
        <OpenChannelModal
          onClose={() => setShowOpenChannel(false)}
          initialPubkey={targetNode.pubkey}
          initialAlias={targetNode.displayName}
          sourceApi={sourceNode.api || undefined}
        />
      )}
    </S.Wrapper>
  );
};

export default observer(SplitNodeView);

const S = {
  Wrapper: styled.div`
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse at 50% 50%, #0a0d14 0%, #050709 100%);
    overflow: hidden;
  `,
  PanelContainer: styled.div`
    display: flex;
    height: 100%;
  `,
  Divider: styled.div`
    width: 220px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-left: 1px solid rgba(255, 255, 255, 0.04);
    border-right: 1px solid rgba(255, 255, 255, 0.04);
    padding: 20px 12px;
  `,
  ChannelStatus: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
  `,
  ChannelStatusIcon: styled.div<{ connected?: boolean }>`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${p =>
      p.connected ? 'rgba(34, 197, 94, 0.12)' : 'rgba(139, 92, 246, 0.12)'};
    color: ${p => (p.connected ? '#22c55e' : '#a78bfa')};
    margin-bottom: 4px;
  `,
  ChannelStatusLabel: styled.div`
    font-size: 13px;
    font-weight: 600;
    color: #22c55e;
  `,
  ChannelStatusDetail: styled.div`
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    font-variant-numeric: tabular-nums;
  `,
  ChannelBalanceBar: styled.div`
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.06);
    overflow: hidden;
    margin-top: 4px;
  `,
  ChannelBalanceLocal: styled.div`
    height: 100%;
    border-radius: 2px;
    background: #6366f1;
    transition: width 0.3s ease;
  `,
  ChannelBalanceMeta: styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-size: 9px;
    color: rgba(255, 255, 255, 0.25);
    font-variant-numeric: tabular-nums;
  `,
  DividerOpenMore: styled.button`
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 12px;
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid rgba(139, 92, 246, 0.15);
    background: rgba(139, 92, 246, 0.06);
    color: #a78bfa;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    &:hover {
      background: rgba(139, 92, 246, 0.12);
      border-color: rgba(139, 92, 246, 0.3);
    }
  `,
  ConnectAction: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
  `,
  ConnectIcon: styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(139, 92, 246, 0.08);
    color: #a78bfa;
    margin-bottom: 4px;
  `,
  ConnectLabel: styled.div`
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
  `,
  ConnectHint: styled.div`
    font-size: 11px;
    color: rgba(255, 255, 255, 0.25);
    line-height: 1.4;
    max-width: 180px;
    margin-bottom: 8px;
  `,
  DirectionPicker: styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.02);
    color: rgba(255, 255, 255, 0.4);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s;
    &:hover {
      border-color: rgba(139, 92, 246, 0.2);
      color: rgba(255, 255, 255, 0.6);
    }
  `,
  DirectionNode: styled.span<{ active?: boolean }>`
    color: ${p => (p.active ? '#a78bfa' : 'rgba(255, 255, 255, 0.35)')};
    font-weight: ${p => (p.active ? 600 : 400)};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 60px;
  `,
  DirectionHint: styled.div`
    font-size: 9px;
    color: rgba(255, 255, 255, 0.2);
    font-style: italic;
    max-width: 180px;
  `,
  ConnectBtn: styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    background: rgba(139, 92, 246, 0.7);
    color: white;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
    &:hover {
      background: rgba(139, 92, 246, 0.9);
    }
  `,
  EmptyState: styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.2);
    gap: 12px;
    background: radial-gradient(ellipse at 50% 50%, #0a0d14 0%, #050709 100%);
  `,
  EmptyTitle: styled.div`
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
  `,
  EmptyDesc: styled.div`
    font-size: 13px;
    color: rgba(255, 255, 255, 0.25);
    text-align: center;
    max-width: 320px;
    line-height: 1.5;
  `,
};
