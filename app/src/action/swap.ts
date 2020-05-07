import { action, toJS } from 'mobx';
import { SwapState, SwapType } from 'types/generated/loop_pb';
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
   * fetch swaps from the Loop RPC
   */
  @action.bound async listSwaps() {
    log.info('fetching Loop history');
    const loopSwaps = await this._loop.listSwaps();
    this._store.swaps = loopSwaps.swapsList
      // sort the list with newest first as the API returns them out of order
      .sort((a, b) => b.initiationTime - a.initiationTime)
      .map(s => ({
        id: s.id,
        type: this._typeToString(s.type),
        amount: s.amt,
        createdOn: new Date(s.initiationTime / 1000 / 1000),
        status: this._stateToString(s.state),
      }));
    log.info('updated store.swaps', toJS(this._store.swaps));
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
   * get a loop terms from the Loop RPC
   */
  @action.bound async getTerms() {
    log.info(`fetching loop terms`);
    const inTerms = await this._loop.getLoopInTerms();
    const outTerms = await this._loop.getLoopOutTerms();
    this._store.terms = {
      in: {
        min: inTerms.minSwapAmount,
        max: inTerms.maxSwapAmount,
      },
      out: {
        min: outTerms.minSwapAmount,
        max: outTerms.maxSwapAmount,
      },
    };
    log.info('updated store.terms', toJS(this._store.terms));
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

  /**
   * Converts a swap type number to a user friendly string
   * @param type the type to convert
   */
  private _typeToString(type: number) {
    switch (type) {
      case SwapType.LOOP_IN:
        return 'Loop In';
      case SwapType.LOOP_OUT:
        return 'Loop Out';
    }
    return 'Unknown';
  }

  /**
   * Converts a swap state number to a user friendly string
   * @param state the state to convert
   */
  private _stateToString(state: number) {
    switch (state) {
      case SwapState.INITIATED:
        return 'Initiated';
      case SwapState.PREIMAGE_REVEALED:
        return 'Preimage Revealed';
      case SwapState.HTLC_PUBLISHED:
        return 'HTLC Published';
      case SwapState.SUCCESS:
        return 'Success';
      case SwapState.FAILED:
        return 'Failed';
      case SwapState.INVOICE_SETTLED:
        return 'Invoice Settled';
    }

    return 'Unknown';
  }
}

export default SwapAction;
