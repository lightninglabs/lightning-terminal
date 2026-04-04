const mockRpcMethod = jest.fn().mockResolvedValue({});

const mockLightning = {
  getInfo: mockRpcMethod,
  channelBalance: mockRpcMethod,
  walletBalance: mockRpcMethod,
  listChannels: mockRpcMethod,
  pendingChannels: mockRpcMethod,
  getNodeInfo: mockRpcMethod,
  describeGraph: mockRpcMethod,
  getNetworkInfo: mockRpcMethod,
  getChanInfo: mockRpcMethod,
  listPayments: jest.fn().mockResolvedValue({ payments: [] }),
  listInvoices: jest.fn().mockResolvedValue({ invoices: [] }),
  addInvoice: mockRpcMethod,
  decodePayReq: mockRpcMethod,
  sendPaymentSync: mockRpcMethod,
  newAddress: mockRpcMethod,
  sendCoins: mockRpcMethod,
  openChannelSync: mockRpcMethod,
  subscribeTransactions: jest.fn(),
  subscribeChannelEvents: jest.fn(),
  subscribeInvoices: jest.fn(),
};

class LNC {
  isConnected = false;
  lnd = { lightning: mockLightning };

  constructor(_opts?: any) {}

  async connect() {
    this.isConnected = true;
  }

  disconnect() {
    this.isConnected = false;
  }
}

export default LNC;
