import { action, computed, observable, toJS } from 'mobx';
import { Quote, SwapDirection, SwapTerms } from 'types/state';
import { Store } from 'store';
import { Channel } from './models';

/**
 * The store to manage the state of a Loop swap being created
 */
class BuildSwapStore {
  _store: Store;

  /** determines whether to show the options for Loop In or Loop Out */
  @observable showActions = false;

  /** determines whether to show the swap wizard */
  @observable showWizard = false;

  /** determines whether to show the swap wizard */
  @observable currentStep = 1;

  /** the chosen direction for the loop */
  @observable direction: SwapDirection = SwapDirection.IN;

  /** the channels selected */
  @observable channels: Channel[] = [];

  /** the amount to swap */
  @observable amount = 0;

  /** the min/max amount this node is allowed to swap */
  @observable terms: SwapTerms = {
    in: { min: 0, max: 0 },
    out: { min: 0, max: 0 },
  };

  /** the quote for the swap */
  @observable quote: Quote = {
    swapFee: 0,
    prepayAmount: 0,
    minerFee: 0,
  };

  /** the reference to the timeout used to allow cancelling a swap */
  @observable processingTimeout?: NodeJS.Timeout;

  /** the error error returned from LoopIn/LoopOut if any */
  @observable swapError?: Error;

  constructor(store: Store) {
    this._store = store;
  }

  //
  // Computed properties
  //

  /** determines if the channel list should be editable */
  @computed
  get listEditable(): boolean {
    return this.showActions || this.showWizard;
  }

  /** the min/max amounts this node is allowed to swap */
  @computed
  get termsMinMax() {
    let termsMax = { min: 0, max: 0 };
    switch (this.direction) {
      case SwapDirection.IN:
        termsMax = this.terms.in;
        break;
      case SwapDirection.OUT:
        termsMax = this.terms.out;
        break;
    }

    return termsMax;
  }

  /** the total quoted fee to perform the current swap */
  @computed
  get fee() {
    return this.quote.swapFee + this.quote.minerFee;
  }

  //
  // Actions
  //

  @action.bound
  toggleShowActions() {
    this.showActions = !this.showActions;
    this.getTerms();
  }

  @action.bound
  setDirection(direction: SwapDirection) {
    this.direction = direction;
    this.showActions = false;
    this.showWizard = true;
    const { min, max } = this.termsMinMax;
    this.amount = Math.floor((min + max) / 2);
  }

  @action.bound
  setSelectedChannels(channels: Channel[]) {
    this.channels = channels;
  }

  @action.bound
  setAmount(amount: number) {
    this.amount = amount;
  }

  @action.bound
  goToNextStep() {
    this.currentStep++;
  }

  @action.bound
  goToPrevStep() {
    if (this.currentStep === 1) {
      this.showActions = true;
      this.showWizard = false;
    } else {
      if (this.currentStep === 3) {
        // if back is clicked on the processing step
        this.abortSwap();
      }
      this.currentStep--;
    }
  }

  @action.bound
  cancel() {
    this.showActions = false;
    this.showWizard = false;
    this.channels = [];
    this.quote.swapFee = 0;
    this.quote.minerFee = 0;
    this.quote.prepayAmount = 0;
    this.currentStep = 1;
  }

  @action.bound
  async getTerms() {
    this._store.log.info(`fetching loop terms`);
    const inTerms = await this._store.api.loop.getLoopInTerms();
    const outTerms = await this._store.api.loop.getLoopOutTerms();
    this.terms = {
      in: {
        min: inTerms.minSwapAmount,
        max: inTerms.maxSwapAmount,
      },
      out: {
        min: outTerms.minSwapAmount,
        max: outTerms.maxSwapAmount,
      },
    };
    this._store.log.info('updated store.terms', toJS(this.terms));
  }

  @action.bound
  executeSwap(swapAction: () => void) {
    const delay = process.env.NODE_ENV !== 'test' ? 3000 : 1;
    this.processingTimeout = setTimeout(() => {
      swapAction();
      this.cancel();
    }, delay);
  }

  @action.bound
  abortSwap() {
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
      this.processingTimeout = undefined;
    }
  }
}

export default BuildSwapStore;
