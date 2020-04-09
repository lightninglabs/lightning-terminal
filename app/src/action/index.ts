import LndApi from 'api/lnd';
import LoopApi from 'api/loop';
import store from 'store';
import ChannelAction from './channel';
import NodeAction from './node';
import SwapAction from './swap';

//
// Create mobx actions
//

export const lndApi = new LndApi();
export const loopApi = new LoopApi();
export const node = new NodeAction(store, lndApi);
export const channel = new ChannelAction(store, lndApi);
export const swap = new SwapAction(store, loopApi);
