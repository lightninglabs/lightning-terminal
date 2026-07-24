import React, { useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStore } from 'store';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Activity as ActivityIcon,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import * as LND from 'types/generated/lnd_pb';

type PaymentObj = LND.Payment.AsObject;
type InvoiceObj = LND.Invoice.AsObject;

interface ActivityItem {
  id: string;
  type: 'payment' | 'invoice';
  amount: number;
  fee: number;
  status: string;
  memo: string;
  timestamp: number;
  hash: string;
}

function paymentToItem(p: PaymentObj): ActivityItem {
  const statusMap: Record<number, string> = {
    1: 'in_flight',
    2: 'succeeded',
    3: 'failed',
  };
  return {
    id: `pay-${p.paymentIndex || p.paymentHash}`,
    type: 'payment',
    amount: Number(p.valueSat) || Number(p.value),
    fee: Number(p.feeSat) || Number(p.fee),
    status: statusMap[p.status as number] || 'unknown',
    memo: '',
    timestamp: Number(p.creationDate),
    hash: p.paymentHash,
  };
}

function invoiceToItem(inv: InvoiceObj): ActivityItem {
  const stateMap: Record<number, string> = {
    0: 'open',
    1: 'settled',
    2: 'canceled',
    3: 'accepted',
  };
  return {
    id: `inv-${inv.addIndex || String(inv.rHash)}`,
    type: 'invoice',
    amount: Number(inv.amtPaidSat) || Number(inv.value),
    fee: 0,
    status: stateMap[inv.state as number] || 'unknown',
    memo: inv.memo,
    timestamp: inv.state === 1 ? Number(inv.settleDate) : Number(inv.creationDate),
    hash: typeof inv.rHash === 'string' ? inv.rHash : '',
  };
}

function formatSats(sats: number): string {
  if (sats >= 1_000_000) return `${(sats / 1_000_000).toFixed(2)}M`;
  if (sats >= 1_000) return `${(sats / 1_000).toFixed(sats >= 10_000 ? 0 : 1)}k`;
  return sats.toLocaleString();
}

function timeAgo(unix: number): string {
  const diff = Date.now() / 1000 - unix;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(unix * 1000).toLocaleDateString();
}

const Styled = {
  Wrapper: styled.div`
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
  Stats: styled.div`
    display: flex;
    gap: 10px;
  `,
  StatChip: styled.div`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
  `,
  StatVal: styled.span`
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  `,
  SearchBar: styled.div`
    position: relative;
    margin-bottom: 16px;
  `,
  SearchIcon: styled.div`
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.2);
  `,
  SearchInput: styled.input`
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 11px 14px 11px 38px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
    &::placeholder {
      color: rgba(255, 255, 255, 0.2);
    }
    &:focus {
      border-color: rgba(255, 255, 255, 0.12);
    }
  `,
  Tabs: styled.div`
    display: flex;
    gap: 2px;
    margin-bottom: 16px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
    padding: 3px;
    width: fit-content;
  `,
  Tab: styled.button<{ active: boolean }>`
    background: ${p => (p.active ? 'rgba(255, 255, 255, 0.08)' : 'transparent')};
    border: none;
    border-radius: 8px;
    padding: 7px 16px;
    color: ${p => (p.active ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)')};
    font-size: 12px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
    &:hover {
      color: rgba(255, 255, 255, 0.6);
    }
  `,
  Table: styled.div`
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    overflow: hidden;
  `,
  TableHeader: styled.div`
    display: grid;
    grid-template-columns: 40px 1fr 120px 100px 100px 100px;
    padding: 12px 18px;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.25);
  `,
  ThCell: styled.div<{ align?: 'right'; active?: boolean }>`
    display: flex;
    align-items: center;
    gap: 3px;
    cursor: pointer;
    user-select: none;
    justify-content: ${p => (p.align === 'right' ? 'flex-end' : 'flex-start')};
    color: ${p => (p.active ? 'rgba(255, 255, 255, 0.6)' : 'inherit')};
    transition: color 0.15s;
    &:hover {
      color: rgba(255, 255, 255, 0.5);
    }
  `,
  TableRow: styled.div<{ isEven: boolean }>`
    display: grid;
    grid-template-columns: 40px 1fr 120px 100px 100px 100px;
    padding: 14px 18px;
    align-items: center;
    background: ${p => (p.isEven ? 'rgba(255, 255, 255, 0.015)' : 'transparent')};
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    transition: background 0.15s;
    &:hover {
      background: rgba(255, 255, 255, 0.03);
    }
    &:last-child {
      border-bottom: none;
    }
  `,
  DirectionIcon: styled.div<{ dir: 'in' | 'out' }>`
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${p =>
      p.dir === 'in' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
    color: ${p => (p.dir === 'in' ? '#34d399' : 'rgba(255, 255, 255, 0.5)')};
  `,
  Memo: styled.div`
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  Hash: styled.div`
    font-size: 10px;
    color: rgba(255, 255, 255, 0.2);
    font-family: 'SF Mono', 'Fira Code', monospace;
    margin-top: 2px;
  `,
  Amount: styled.div<{ dir: 'in' | 'out' }>`
    font-size: 13px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: ${p => (p.dir === 'in' ? '#34d399' : 'rgba(255, 255, 255, 0.85)')};
    text-align: right;
  `,
  Fee: styled.div`
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: rgba(255, 255, 255, 0.25);
    text-align: right;
  `,
  StatusBadge: styled.div<{ variant: string }>`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 6px;
    background: ${p => {
      if (p.variant === 'succeeded' || p.variant === 'settled')
        return 'rgba(52, 211, 153, 0.08)';
      if (p.variant === 'failed' || p.variant === 'canceled')
        return 'rgba(248, 113, 113, 0.08)';
      return 'rgba(251, 191, 36, 0.08)';
    }};
    color: ${p => {
      if (p.variant === 'succeeded' || p.variant === 'settled') return '#34d399';
      if (p.variant === 'failed' || p.variant === 'canceled') return '#f87171';
      return '#fbbf24';
    }};
  `,
  Time: styled.div`
    font-size: 12px;
    color: rgba(255, 255, 255, 0.25);
    text-align: right;
    font-variant-numeric: tabular-nums;
  `,
  LoadingState: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    color: rgba(255, 255, 255, 0.3);
    gap: 12px;
  `,
  Spinner: styled(Loader2)`
    animation: spin 1s linear infinite;
    @keyframes spin {
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
    padding: 80px 0;
    color: rgba(255, 255, 255, 0.2);
    gap: 8px;
    font-size: 14px;
  `,
};

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'succeeded' || status === 'settled') return <CheckCircle size={12} />;
  if (status === 'failed' || status === 'canceled') return <XCircle size={12} />;
  return <Clock size={12} />;
};

type TabFilter = 'all' | 'payments' | 'invoices';
type SortKey = 'details' | 'amount' | 'fee' | 'status' | 'time';
type SortDir = 'asc' | 'desc';

const HistoryPage: React.FC = () => {
  const { api } = useStore();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('time');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    try {
      const [paymentsRes, invoicesRes] = await Promise.all([
        api.lnd.listPayments(),
        api.lnd.listInvoices(),
      ]);

      const payItems = paymentsRes.paymentsList.map(paymentToItem);
      const invItems = invoicesRes.invoicesList
        .map(invoiceToItem)
        .filter(i => i.status !== 'open' && i.status !== 'canceled');

      const merged = [...payItems, ...invItems].sort((a, b) => b.timestamp - a.timestamp);
      setItems(merged);
    } catch (err) {
      console.error('Failed to fetch activity', err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir(key === 'time' ? 'desc' : 'asc');
    }
  };

  const filtered = items
    .filter(item => {
      if (tab === 'payments' && item.type !== 'payment') return false;
      if (tab === 'invoices' && item.type !== 'invoice') return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.memo.toLowerCase().includes(q) ||
          item.hash.toLowerCase().includes(q) ||
          item.amount.toString().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'details':
          cmp = (a.memo || a.hash).localeCompare(b.memo || b.hash);
          break;
        case 'amount':
          cmp = a.amount - b.amount;
          break;
        case 'fee':
          cmp = a.fee - b.fee;
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'time':
        default:
          cmp = a.timestamp - b.timestamp;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const totalSent = items
    .filter(i => i.type === 'payment' && i.status === 'succeeded')
    .reduce((s, i) => s + i.amount, 0);
  const totalReceived = items
    .filter(i => i.type === 'invoice' && i.status === 'settled')
    .reduce((s, i) => s + i.amount, 0);
  const totalFees = items
    .filter(i => i.type === 'payment' && i.status === 'succeeded')
    .reduce((s, i) => s + i.fee, 0);

  const {
    Wrapper,
    Header,
    Title,
    Stats,
    StatChip,
    StatVal,
    SearchBar,
    SearchIcon,
    SearchInput,
    Tabs,
    Tab,
    Table,
    TableHeader,
    ThCell,
    TableRow,
    DirectionIcon,
    Memo,
    Hash,
    Amount,
    Fee,
    StatusBadge,
    Time,
    LoadingState,
    Spinner,
    EmptyState,
  } = Styled;

  return (
    <Wrapper>
      <Header>
        <Title>
          <ActivityIcon size={18} />
          Activity
        </Title>
        <Stats>
          <StatChip>
            <ArrowUpRight size={14} color="#a78bfa" />
            Sent <StatVal>{formatSats(totalSent)} sats</StatVal>
          </StatChip>
          <StatChip>
            <ArrowDownLeft size={14} color="#22c55e" />
            Received <StatVal>{formatSats(totalReceived)} sats</StatVal>
          </StatChip>
          <StatChip>
            Fees <StatVal>{formatSats(totalFees)} sats</StatVal>
          </StatChip>
        </Stats>
      </Header>

      <Tabs>
        <Tab active={tab === 'all'} onClick={() => setTab('all')}>
          All ({items.length})
        </Tab>
        <Tab active={tab === 'payments'} onClick={() => setTab('payments')}>
          Payments ({items.filter(i => i.type === 'payment').length})
        </Tab>
        <Tab active={tab === 'invoices'} onClick={() => setTab('invoices')}>
          Invoices ({items.filter(i => i.type === 'invoice').length})
        </Tab>
      </Tabs>

      <SearchBar>
        <SearchIcon>
          <Search size={14} />
        </SearchIcon>
        <SearchInput
          placeholder="Search by memo or payment hash..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </SearchBar>

      {loading ? (
        <LoadingState>
          <Spinner size={24} />
          Loading activity...
        </LoadingState>
      ) : filtered.length === 0 ? (
        <EmptyState>
          <ActivityIcon size={32} />
          {search ? 'No results match your search' : 'No activity yet'}
        </EmptyState>
      ) : (
        <Table>
          <TableHeader>
            <div></div>
            <ThCell active={sortBy === 'details'} onClick={() => toggleSort('details')}>
              Details
              {sortBy === 'details' &&
                (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
            </ThCell>
            <ThCell
              align="right"
              active={sortBy === 'amount'}
              onClick={() => toggleSort('amount')}
            >
              Amount
              {sortBy === 'amount' &&
                (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
            </ThCell>
            <ThCell
              align="right"
              active={sortBy === 'fee'}
              onClick={() => toggleSort('fee')}
            >
              Fee
              {sortBy === 'fee' &&
                (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
            </ThCell>
            <ThCell
              align="right"
              active={sortBy === 'status'}
              onClick={() => toggleSort('status')}
            >
              Status
              {sortBy === 'status' &&
                (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
            </ThCell>
            <ThCell
              align="right"
              active={sortBy === 'time'}
              onClick={() => toggleSort('time')}
            >
              Time
              {sortBy === 'time' &&
                (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
            </ThCell>
          </TableHeader>
          {filtered.map((item, i) => {
            const dir = item.type === 'invoice' ? 'in' : 'out';
            return (
              <TableRow key={item.id} isEven={i % 2 === 0}>
                <DirectionIcon dir={dir}>
                  {dir === 'in' ? (
                    <ArrowDownLeft size={14} />
                  ) : (
                    <ArrowUpRight size={14} />
                  )}
                </DirectionIcon>
                <div>
                  <Memo>
                    {item.memo ||
                      (item.type === 'payment' ? 'Lightning Payment' : 'Invoice')}
                  </Memo>
                  <Hash>
                    {item.hash.slice(0, 16)}...{item.hash.slice(-8)}
                  </Hash>
                </div>
                <Amount dir={dir}>
                  {dir === 'in' ? '+' : '-'}
                  {formatSats(item.amount)} sats
                </Amount>
                <Fee>{item.fee > 0 ? `${formatSats(item.fee)} sats` : '—'}</Fee>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge variant={item.status}>
                    <StatusIcon status={item.status} />
                    {item.status}
                  </StatusBadge>
                </div>
                <Time>{timeAgo(item.timestamp)}</Time>
              </TableRow>
            );
          })}
        </Table>
      )}
    </Wrapper>
  );
};

export default observer(HistoryPage);
