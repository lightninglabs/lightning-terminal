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
  Stats: styled.div`
    display: flex;
    gap: 16px;
  `,
  StatChip: styled.div`
    background: rgba(139, 92, 246, 0.08);
    border: 1px solid rgba(139, 92, 246, 0.15);
    border-radius: 8px;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #94a3b8;
  `,
  StatVal: styled.span`
    color: #e2e8f0;
    font-weight: 600;
  `,
  SearchBar: styled.div`
    position: relative;
    margin-bottom: 16px;
  `,
  SearchIcon: styled.div`
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #475569;
  `,
  SearchInput: styled.input`
    width: 100%;
    background: rgba(15, 10, 30, 0.6);
    border: 1px solid rgba(139, 92, 246, 0.12);
    border-radius: 8px;
    padding: 10px 12px 10px 36px;
    color: #e2e8f0;
    font-size: 13px;
    outline: none;
    &::placeholder {
      color: #475569;
    }
    &:focus {
      border-color: rgba(139, 92, 246, 0.35);
    }
  `,
  Tabs: styled.div`
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
  `,
  Tab: styled.button<{ active: boolean }>`
    background: ${p => (p.active ? 'rgba(139, 92, 246, 0.15)' : 'transparent')};
    border: 1px solid ${p => (p.active ? 'rgba(139, 92, 246, 0.3)' : 'transparent')};
    border-radius: 6px;
    padding: 6px 14px;
    color: ${p => (p.active ? '#a78bfa' : '#64748b')};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    &:hover {
      color: #a78bfa;
    }
  `,
  Table: styled.div`
    border: 1px solid rgba(139, 92, 246, 0.1);
    border-radius: 10px;
    overflow: hidden;
  `,
  TableHeader: styled.div`
    display: grid;
    grid-template-columns: 40px 1fr 120px 100px 100px 100px;
    padding: 10px 16px;
    background: rgba(15, 10, 30, 0.5);
    border-bottom: 1px solid rgba(139, 92, 246, 0.08);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #475569;
  `,
  ThCell: styled.div<{ align?: 'right'; active?: boolean }>`
    display: flex;
    align-items: center;
    gap: 3px;
    cursor: pointer;
    user-select: none;
    justify-content: ${p => (p.align === 'right' ? 'flex-end' : 'flex-start')};
    color: ${p => (p.active ? '#a78bfa' : 'inherit')};
    transition: color 0.15s;
    &:hover {
      color: #a78bfa;
    }
  `,
  TableRow: styled.div<{ isEven: boolean }>`
    display: grid;
    grid-template-columns: 40px 1fr 120px 100px 100px 100px;
    padding: 12px 16px;
    align-items: center;
    background: ${p => (p.isEven ? 'rgba(15, 10, 30, 0.3)' : 'transparent')};
    border-bottom: 1px solid rgba(139, 92, 246, 0.05);
    transition: background 0.15s;
    &:hover {
      background: rgba(139, 92, 246, 0.05);
    }
    &:last-child {
      border-bottom: none;
    }
  `,
  DirectionIcon: styled.div<{ dir: 'in' | 'out' }>`
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${p =>
      p.dir === 'in' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(139, 92, 246, 0.12)'};
    color: ${p => (p.dir === 'in' ? '#22c55e' : '#a78bfa')};
  `,
  Memo: styled.div`
    font-size: 13px;
    color: #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  Hash: styled.div`
    font-size: 11px;
    color: #475569;
    font-family: 'SF Mono', 'Fira Code', monospace;
  `,
  Amount: styled.div<{ dir: 'in' | 'out' }>`
    font-size: 13px;
    font-weight: 600;
    color: ${p => (p.dir === 'in' ? '#22c55e' : '#e2e8f0')};
    text-align: right;
  `,
  Fee: styled.div`
    font-size: 12px;
    color: #64748b;
    text-align: right;
  `,
  StatusBadge: styled.div<{ variant: string }>`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 4px;
    background: ${p => {
      if (p.variant === 'succeeded' || p.variant === 'settled')
        return 'rgba(34, 197, 94, 0.1)';
      if (p.variant === 'failed' || p.variant === 'canceled')
        return 'rgba(239, 68, 68, 0.1)';
      return 'rgba(234, 179, 8, 0.1)';
    }};
    color: ${p => {
      if (p.variant === 'succeeded' || p.variant === 'settled') return '#22c55e';
      if (p.variant === 'failed' || p.variant === 'canceled') return '#ef4444';
      return '#eab308';
    }};
  `,
  Time: styled.div`
    font-size: 12px;
    color: #64748b;
    text-align: right;
  `,
  LoadingState: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    color: #64748b;
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
    color: #475569;
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
