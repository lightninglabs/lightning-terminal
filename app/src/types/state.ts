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

export interface Channel {
  chanId: string;
  remotePubkey: string;
  capacity: number;
  localBalance: number;
  remoteBalance: number;
  uptime: number;
  active: boolean;
}

export interface Swap {
  id: string;
  type: string;
  amount: BigInt;
  createdOn: Date;
  status: string;
}
