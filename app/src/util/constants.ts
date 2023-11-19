/** estimated number of blocks mined per day */
export const BLOCKS_PER_DAY = 144;

/** A Date very far into the future */
export const MAX_DATE = new Date(9999, 0, 1);

/** the enumeration of unit supported in the app */
export enum Unit {
  sats = 'sats',
  bits = 'bits',
  btc = 'btc',
}

interface UnitFormat {
  suffix: string;
  name: string;
  denominator: number;
  decimals: number;
}

/** a mapping of units to parameters that define how it should be formatted  */
export const Units: { [key in Unit]: UnitFormat } = {
  sats: { suffix: 'sats', name: 'Satoshis', denominator: 1, decimals: 0 },
  bits: { suffix: 'bits', name: 'Bits', denominator: 100, decimals: 2 },
  btc: { suffix: 'BTC', name: 'Bitcoin', denominator: 100000000, decimals: 8 },
};

/** the different operating modes of a LN node, used to decide what is considered a good/bad channel balance */
export enum BalanceMode {
  receive = 'receive',
  send = 'send',
  routing = 'routing',
}

/** the different balance statuses that a channel may have */
export enum BalanceStatus {
  ok = 'ok',
  warn = 'warn',
  danger = 'danger',
}

/** the constraints that need to be satisfied to meet obtain balance status */
export interface BalanceConstraint {
  /** the minimum local balance percentage to satisfy the status */
  min: number;
  /** the maximum local balance percentage to satisfy the status */
  max: number;
  /** if true, either local or remote balance can satisfy the status */
  bidirectional?: boolean;
}

/** the balance config params for each status */
export type BalanceConfig = {
  [key in BalanceStatus]: BalanceConstraint;
};

/** hard-coded configs for all modes and statuses for channel balances */
export const BalanceModes: { [key in BalanceMode]: BalanceConfig } = {
  receive: {
    ok: { min: 0, max: 33 },
    warn: { min: 33, max: 66 },
    danger: { min: 66, max: 100 },
  },
  send: {
    ok: { min: 66, max: 100 },
    warn: { min: 33, max: 66 },
    danger: { min: 0, max: 33 },
  },
  routing: {
    ok: { min: 50, max: 70, bidirectional: true },
    warn: { min: 70, max: 85, bidirectional: true },
    danger: { min: 85, max: 100, bidirectional: true },
  },
};

/** the list of supported Bitcoin block explorers for transactions */
export const BitcoinExplorerPresets: Record<string, string> = {
  'mempool.space': 'https://mempool.space/tx/{txid}',
  'blockstream.info': 'https://blockstream.info/tx/{txid}',
};

/** the list of supported Lightning graph explorers for nodes*/
export const LightningExplorerPresets: Record<string, string> = {
  terminal: 'https://terminal.lightning.engineering/{pubkey}',
  'amboss.space': 'https://amboss.space/node/{pubkey}',
  '1ml.com': 'https://1ml.com/node/{pubkey}',
};

/** A map of all the necessary URIs for each set of features */
export const PermissionUriMap: { [key: string]: string[] } = {
  openChannel: [
    '/lnrpc.Lightning/OpenChannel',
    '/lnrpc.Lightning/BatchOpenChannel',
    '/lnrpc.Lightning/OpenChannelSync',
  ],
  closeChannel: ['/lnrpc.Lightning/CloseChannel'],
  setFees: [
    '/lnrpc.Lightning/EstimateFee',
    '/lnrpc.Lightning/FeeReport',
    '/lnrpc.Lightning/UpdateChannelPolicy',
  ],
  loop: ['^/looprpc\\.SwapClient/.*$'],
  pool: ['^/poolrpc\\.Trader/.*$'],
  send: [
    '/lnrpc.Lightning/SendCoins',
    '/lnrpc.Lightning/SendMany',
    '/lnrpc.Lightning/SendPayment',
    '/lnrpc.Lightning/SendPaymentSync',
    '/lnrpc.Lightning/SendToRoute',
    '/lnrpc.Lightning/SendToRouteSync',
  ],
  receive: [
    '/lnrpc.Lightning/NewAddress',
    '/lnrpc.Lightning/AddInvoice',
    '/lnrpc.Lightning/LookupInvoice',
    '/lnrpc.Lightning/ListInvoices',
    '/lnrpc.Lightning/SubscribeInvoices',
  ],
  sign: ['/lnrpc.Lightning/SignMessage'],
};
