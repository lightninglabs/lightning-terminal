import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Badge } from 'components/base';
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  Droplets,
} from 'lucide-react';
import Unit from 'components/common/Unit';
import TransactionModal from 'components/common/TransactionModal';
import OpenChannelModal from 'components/common/OpenChannelModal';
import ChannelList from './ChannelList';
import SwapWizard from './swap/SwapWizard';
import ProcessingSwaps from './processing/ProcessingSwaps';

const Styled = {
  PageWrap: styled.div`
    padding: 28px 36px;
    min-height: 100vh;
    background: #000000;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `,
  Header: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 40px;
    margin-bottom: 28px;
  `,
  Title: styled.h2`
    font-size: 22px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: -0.02em;
  `,
  LoopUnavailable: styled.div`
    padding: 12px 16px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.4);
    font-size: 13px;
    margin-bottom: 20px;
  `,
  TileRow: styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
  `,
  Tile: styled.div`
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    padding: 20px 24px;
  `,
  TileLabel: styled.div`
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.3);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  `,
  TileValue: styled.div`
    font-size: 26px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  `,
  BalanceBar: styled.div`
    margin-top: 10px;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.04);
    overflow: hidden;
    display: flex;
  `,
  BarSegment: styled.div<{ width: number; color: string }>`
    height: 100%;
    width: ${p => p.width}%;
    background: ${p => p.color};
    transition: width 0.3s;
  `,
  ActionRow: styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  `,
  ActionBtn: styled.button<{ variant?: 'primary' }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
    border: none;

    ${p =>
      p.variant === 'primary'
        ? `
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.9);
      &:hover { background: rgba(255, 255, 255, 0.14); }
    `
        : `
      background: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.06);
      &:hover {
        background: rgba(255, 255, 255, 0.07);
        color: rgba(255, 255, 255, 0.8);
      }
    `}
  `,
  HealthNotice: styled.div<{ severity: 'warning' | 'info' }>`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 18px;
    border-radius: 12px;
    margin-bottom: 20px;
    font-size: 13px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.5);

    ${p =>
      p.severity === 'warning'
        ? `
      background: rgba(251, 191, 36, 0.04);
      border: 1px solid rgba(251, 191, 36, 0.1);
    `
        : `
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
    `}
  `,
  NoticeIcon: styled.div<{ severity: 'warning' | 'info' }>`
    flex-shrink: 0;
    margin-top: 1px;
    color: ${p => (p.severity === 'warning' ? '#fbbf24' : 'rgba(255, 255, 255, 0.3)')};
  `,
  NoticeText: styled.div`
    flex: 1;
  `,
  NoticeLink: styled.span`
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    font-weight: 500;
    text-decoration: underline;
    text-decoration-color: rgba(255, 255, 255, 0.2);
    text-underline-offset: 2px;
    &:hover {
      text-decoration-color: rgba(255, 255, 255, 0.5);
    }
  `,
};

const LoopPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.LoopPage');
  const { appView, buildSwapView, channelStore, nodeStore, subServerStore } = useStore();

  const [showOpenChannel, setShowOpenChannel] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showSend, setShowSend] = useState(false);

  const loopRunning =
    subServerStore.subServers.loop.running && !subServerStore.subServers.loop.error;

  const inbound = channelStore.totalInbound.toNumber();
  const outbound = channelStore.totalOutbound.toNumber();
  const total = inbound + outbound;
  const inPct = total > 0 ? (inbound / total) * 100 : 50;
  const outPct = total > 0 ? (outbound / total) * 100 : 50;

  const hasChannels = channelStore.sortedChannels.length > 0;
  const ratio = total > 0 ? outbound / total : 0.5;
  const isOutboundHeavy = ratio > 0.75;
  const isInboundHeavy = ratio < 0.25;
  const isUnbalanced = isOutboundHeavy || isInboundHeavy;

  const handleAddInbound = () => {
    if (loopRunning) {
      buildSwapView.startSwap();
    }
  };

  const handleAddOutbound = () => {
    setShowOpenChannel(true);
  };

  const {
    PageWrap,
    Header,
    Title,
    LoopUnavailable,
    TileRow,
    Tile,
    TileLabel,
    TileValue,
    BalanceBar,
    BarSegment,
    ActionRow,
    ActionBtn,
    HealthNotice,
    NoticeIcon,
    NoticeText,
    NoticeLink,
  } = Styled;

  return (
    <PageWrap>
      <Header>
        <Title>
          <ArrowLeftRight size={18} />
          {l('pageTitle')}
          {nodeStore.network !== 'mainnet' && <Badge>{nodeStore.network}</Badge>}
        </Title>
      </Header>

      {appView.processingSwapsVisible ? (
        <ProcessingSwaps />
      ) : buildSwapView.showWizard ? (
        <SwapWizard />
      ) : (
        <>
          {hasChannels && (
            <>
              <TileRow>
                <Tile>
                  <TileLabel>
                    <ArrowDownLeft size={13} color="#22c55e" />
                    Inbound
                  </TileLabel>
                  <TileValue>
                    <Unit sats={channelStore.totalInbound} />
                  </TileValue>
                </Tile>
                <Tile>
                  <TileLabel>
                    <ArrowUpRight size={13} color="#a78bfa" />
                    Outbound
                  </TileLabel>
                  <TileValue>
                    <Unit sats={channelStore.totalOutbound} />
                  </TileValue>
                </Tile>
              </TileRow>

              <BalanceBar>
                <BarSegment width={inPct} color="#34d399" />
                <BarSegment width={outPct} color="rgba(255, 255, 255, 0.3)" />
              </BalanceBar>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.2)',
                  marginTop: '6px',
                  marginBottom: '18px',
                  letterSpacing: '0.02em',
                }}
              >
                <span>Inbound {inPct.toFixed(0)}%</span>
                <span>Outbound {outPct.toFixed(0)}%</span>
              </div>

              {isUnbalanced && (
                <HealthNotice severity="warning">
                  <NoticeIcon severity="warning">
                    <AlertTriangle size={16} />
                  </NoticeIcon>
                  <NoticeText>
                    {isOutboundHeavy ? (
                      <>
                        Your liquidity is outbound-heavy ({outPct.toFixed(0)}% outbound).
                        You may have trouble receiving payments.{' '}
                        {loopRunning ? (
                          <NoticeLink onClick={handleAddInbound}>
                            Add inbound liquidity
                          </NoticeLink>
                        ) : (
                          <>
                            Open a channel where a peer sends liquidity to you, or ask a
                            well-connected node to open a channel to your node.
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        Your liquidity is inbound-heavy ({inPct.toFixed(0)}% inbound). You
                        may have trouble sending payments.{' '}
                        <NoticeLink onClick={handleAddOutbound}>
                          Open a new channel
                        </NoticeLink>{' '}
                        to add outbound capacity.
                      </>
                    )}
                  </NoticeText>
                </HealthNotice>
              )}

              {!isUnbalanced && hasChannels && (
                <HealthNotice severity="info">
                  <NoticeIcon severity="info">
                    <Droplets size={16} />
                  </NoticeIcon>
                  <NoticeText>
                    Your liquidity is well-balanced. You can send and receive payments
                    without issues.
                  </NoticeText>
                </HealthNotice>
              )}
            </>
          )}

          {!hasChannels && (
            <HealthNotice severity="info">
              <NoticeIcon severity="info">
                <AlertTriangle size={16} />
              </NoticeIcon>
              <NoticeText>
                No channels yet.{' '}
                <NoticeLink onClick={handleAddOutbound}>
                  Open your first channel
                </NoticeLink>{' '}
                to start sending and receiving Lightning payments.
              </NoticeText>
            </HealthNotice>
          )}

          {!loopRunning && (
            <LoopUnavailable>
              Loop swap service is unavailable. You can still manage channels and
              liquidity manually.
            </LoopUnavailable>
          )}

          <ActionRow>
            <ActionBtn variant="primary" onClick={() => setShowOpenChannel(true)}>
              <Plus size={14} />
              Open Channel
            </ActionBtn>
            {loopRunning && (
              <>
                <ActionBtn onClick={handleAddInbound}>
                  <TrendingDown size={14} />
                  Add Inbound
                </ActionBtn>
                <ActionBtn onClick={handleAddOutbound}>
                  <TrendingUp size={14} />
                  Add Outbound
                </ActionBtn>
              </>
            )}
            <ActionBtn onClick={() => setShowReceive(true)}>
              <ArrowDownLeft size={14} />
              Receive
            </ActionBtn>
            <ActionBtn onClick={() => setShowSend(true)}>
              <ArrowUpRight size={14} />
              Send
            </ActionBtn>
          </ActionRow>
        </>
      )}

      <ChannelList />

      {showOpenChannel && <OpenChannelModal onClose={() => setShowOpenChannel(false)} />}
      {showReceive && (
        <TransactionModal direction="receive" onClose={() => setShowReceive(false)} />
      )}
      {showSend && (
        <TransactionModal direction="send" onClose={() => setShowSend(false)} />
      )}
    </PageWrap>
  );
};

export default observer(LoopPage);
