import LndApi from 'api/lnd';
import LoopApi from 'api/loop';
import { Store } from 'store';
import ChannelAction from './channel';
import NodeAction from './node';
import SwapAction from './swap';

export interface StoreActions {
  lndApi: LndApi;
  loopApi: LoopApi;
  node: NodeAction;
  channel: ChannelAction;
  swap: SwapAction;
}

/**
 * Creates actions that modify the state of the given mobx store
 * @param store the Store instance that the actions will modify
 */
export const createActions = (store: Store): StoreActions => {
  const lndApi = new LndApi();
  const loopApi = new LoopApi();
  const node = new NodeAction(store, lndApi);
  const channel = new ChannelAction(store, lndApi);
  const swap = new SwapAction(store, loopApi);

  return {
    lndApi,
    loopApi,
    node,
    channel,
    swap,
  };
};
