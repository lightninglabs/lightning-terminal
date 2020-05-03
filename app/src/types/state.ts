export interface NodeInfo {
  identityPubkey: string;
  alias: string;
  numActiveChannels: number;
  numPeers: number;
  blockHeight: number;
  version: string;
}

export interface NodeBalances {
  walletBalance: number;
  channelBalance: number;
}

export enum BalanceLevel {
  good = 'good',
  warn = 'warn',
  bad = 'bad',
}

export interface Channel {
  chanId: string;
  remotePubkey: string;
  capacity: number;
  localBalance: number;
  remoteBalance: number;
  uptime: number;
  active: boolean;
  localPercent: number;
  balancePercent: number;
  balanceLevel: BalanceLevel;
}

export enum SwapDirection {
  IN = 'Loop In',
  OUT = 'Loop Out',
}

export interface Swap {
  id: string;
  type: string;
  amount: number;
  createdOn: Date;
  status: string;
}
