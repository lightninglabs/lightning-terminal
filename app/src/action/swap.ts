import { action, toJS } from 'mobx';
import { SwapDirection } from 'types/state';
import { actionLog as log } from 'util/log';
import { LoopApi } from 'api';
import { Store } from 'store';

/**
 * Action used to update the swap state in the store with responses from
 * the GRPC APIs
 */
class SwapAction {
  private _store: Store;
  private _loop: LoopApi;

  constructor(store: Store, loop: LoopApi) {
    this._store = store;
    this._loop = loop;
  }

  /**
   * get a loop quote from the Loop RPC
   */
  @action.bound async getQuote() {
    const { amount, direction } = this._store.buildSwapStore;
    log.info(`fetching ${direction} quote for ${amount} sats`);

    const quote =
      direction === SwapDirection.IN
        ? await this._loop.getLoopInQuote(amount)
        : await this._loop.getLoopOutQuote(amount);

    this._store.buildSwapStore.quote = {
      swapFee: quote.swapFee,
      minerFee: quote.minerFee,
      prepayAmount: quote.prepayAmt,
    };
    log.info('updated buildSwapStore.quote', toJS(this._store.buildSwapStore.quote));
  }

  /**
   * executes a loop request using the amount and direction stored in state
   */
  @action.bound async loop() {
    const { amount, direction, quote } = this._store.buildSwapStore;
    log.info(`executing ${direction} for ${amount} sats`);
    try {
      const res =
        direction === SwapDirection.IN
          ? await this._loop.loopIn(amount, quote)
          : await this._loop.loopOut(amount, quote);
      log.info('completed loop', toJS(res));
    } catch (error) {
      this._store.buildSwapStore.swapError = error;
      log.error(`failed to perform ${direction}`, error);
    }
  }
}

export default SwapAction;
