import GrpcClient from 'api/grpc';
import LndApi from 'api/lnd';
import LoopApi from 'api/loop';
import { Store } from 'store';
import ChannelAction from './channel';
import NodeAction from './node';
import SwapAction from './swap';

export interface StoreActions {
  node: NodeAction;
  channel: ChannelAction;
  swap: SwapAction;
}

/**
 * Creates actions that modify the state of the given mobx store
 * @param store the Store instance that the actions will modify
 */
export const createActions = (store: Store): StoreActions => {
  // low level dependencies
  const grpc = new GrpcClient();
  const lndApi = new LndApi(grpc);
  const loopApi = new LoopApi(grpc);

  // actions exposed to UI components
  const node = new NodeAction(store, lndApi);
  const channel = new ChannelAction(store, lndApi);
  const swap = new SwapAction(store, loopApi);

  return {
    node,
    channel,
    swap,
  };
};
