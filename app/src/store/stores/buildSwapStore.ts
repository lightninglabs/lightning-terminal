import { action, computed, observable, runInAction, toJS } from 'mobx';
import { BuildSwapSteps, Quote, SwapDirection, SwapTerms } from 'types/state';
import { Store } from 'store';

// an artificial delay to allow the user to abort a swap before it executed
export const SWAP_ABORT_DELAY = 3000;

/**
 * The store to manage the state of a Loop swap being created
 */
class BuildSwapStore {
  _store: Store;

  /** determines whether to show the swap wizard */
  @observable currentStep = BuildSwapSteps.Closed;

  /** the chosen direction for the loop */
  @observable direction: SwapDirection = SwapDirection.IN;

  /** the channels selected */
  @observable selectedChanIds: string[] = [];

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

  /** determines whether to show the options for Loop In or Loop Out */
  @computed
  get showActions(): boolean {
    return this.currentStep === BuildSwapSteps.SelectDirection;
  }

  /** determines whether to show the swap wizard UI */
  @computed
  get showWizard(): boolean {
    return [
      BuildSwapSteps.ChooseAmount,
      BuildSwapSteps.ReviewQuote,
      BuildSwapSteps.Processing,
    ].includes(this.currentStep);
  }

  /** determines if the channel list should be editable */
  @computed
  get listEditable(): boolean {
    return this.currentStep !== BuildSwapSteps.Closed;
  }

  /** the min/max amounts this node is allowed to swap based on the current direction */
  @computed
  get termsForDirection() {
    let terms = { min: 0, max: 0 };
    switch (this.direction) {
      case SwapDirection.IN:
        terms = this.terms.in;
        break;
      case SwapDirection.OUT:
        terms = this.terms.out;
        break;
    }

    return terms;
  }

  /** the total quoted fee to perform the current swap */
  @computed
  get fee() {
    return this.quote.swapFee + this.quote.minerFee;
  }

  /** a string containing the fee as an absolute value and a percentage */
  @computed
  get feesLabel() {
    const feesPct = ((100 * this.fee) / this.amount).toFixed(2);
    return `${this.fee.toLocaleString()} SAT (${feesPct}%)`;
  }

  /** the invoice total including the swap amount and fee */
  @computed
  get invoiceTotal() {
    return this.amount + this.fee;
  }

  //
  // Actions
  //

  /**
   * display the Loop actions bar
   */
  @action.bound
  async startSwap(): Promise<void> {
    this.currentStep = BuildSwapSteps.SelectDirection;
    await this.getTerms();
    this._store.log.info(`updated buildSwapStore.currentStep`, this.currentStep);
  }

  /**
   * Set the direction, In or Out, for the pending swap
   * @param direction the direction of the swap
   */
  @action.bound
  async setDirection(direction: SwapDirection): Promise<void> {
    this.direction = direction;
    this._store.log.info(`updated buildSwapStore.direction`, direction);
    this.goToNextStep();
  }

  /**
   * Toggles a selected channel to use for the pending swap
   * @param channels the selected channels
   */
  @action.bound
  toggleSelectedChannel(channelId: string) {
    if (this.selectedChanIds.includes(channelId)) {
      this.selectedChanIds = this.selectedChanIds.filter(id => id !== channelId);
    } else {
      this.selectedChanIds.push(channelId);
    }
    this._store.log.info(
      `updated buildSwapStore.selectedChanIds`,
      toJS(this.selectedChanIds),
    );
  }

  /**
   * Set the amount for the swap
   * @param amount the amount in sats
   */
  @action.bound
  setAmount(amount: number) {
    this.amount = amount;
  }

  /**
   * Navigate to the next step in the wizard
   */
  @action.bound
  goToNextStep() {
    if (this.currentStep === BuildSwapSteps.ChooseAmount) {
      this.getQuote();
    } else if (this.currentStep === BuildSwapSteps.ReviewQuote) {
      this.requestSwap();
    }

    this.currentStep++;
    this._store.log.info(`updated buildSwapStore.currentStep`, this.currentStep);
  }

  /**
   * Navigate to the previous step in the wizard
   */
  @action.bound
  goToPrevStep() {
    if (this.currentStep === BuildSwapSteps.ChooseAmount) {
      this.cancel();
      return;
    }
    if (this.currentStep === BuildSwapSteps.Processing) {
      // if back is clicked on the processing step
      this.abortSwap();
    }
    this.currentStep--;
    this._store.log.info(`updated buildSwapStore.currentStep`, this.currentStep);
  }

  /**
   * hide the swap wizard
   */
  @action.bound
  cancel() {
    this.currentStep = BuildSwapSteps.Closed;
    this.selectedChanIds = [];
    this.quote.swapFee = 0;
    this.quote.minerFee = 0;
    this.quote.prepayAmount = 0;
    this._store.log.info(`reset buildSwapStore`, toJS(this));
  }

  /**
   * fetch the terms, minimum/maximum swap amount allowed, from the Loop API
   */
  @action.bound
  async getTerms(): Promise<void> {
    this._store.log.info(`fetching loop terms`);
    const inTerms = await this._store.api.loop.getLoopInTerms();
    const outTerms = await this._store.api.loop.getLoopOutTerms();
    runInAction(() => {
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

      // restrict the amount whenever the terms are updated
      const { min, max } = this.termsForDirection;
      if (this.amount < min || this.amount > max) {
        this.setAmount(Math.floor((min + max) / 2));
        this._store.log.info(`updated buildSwapStore.amount`, this.amount);
      }
    });
  }

  /**
   * get a loop quote from the Loop RPC
   */
  @action.bound
  async getQuote(): Promise<void> {
    const { amount, direction } = this;
    this._store.log.info(`fetching ${direction} quote for ${amount} sats`);

    const quote =
      direction === SwapDirection.IN
        ? await this._store.api.loop.getLoopInQuote(amount)
        : await this._store.api.loop.getLoopOutQuote(amount);

    runInAction(() => {
      this.quote = {
        swapFee: quote.swapFee,
        minerFee: quote.minerFee,
        prepayAmount: quote.prepayAmt,
      };
      this._store.log.info('updated buildSwapStore.quote', toJS(this.quote));
    });
  }

  /**
   * submit a request to the Loop API to perform a swap. There will be a 3 second
   * delay added to allow the swap to be aborted
   */
  @action.bound
  requestSwap() {
    const delay = process.env.NODE_ENV !== 'test' ? SWAP_ABORT_DELAY : 1;
    const { amount, direction, quote } = this;
    this._store.log.info(
      `executing ${direction} for ${amount} sats (delaying for ${delay}ms)`,
    );
    this.processingTimeout = setTimeout(async () => {
      try {
        const res =
          direction === SwapDirection.IN
            ? await this._store.api.loop.loopIn(amount, quote)
            : await this._store.api.loop.loopOut(amount, quote);
        this._store.log.info('completed loop', toJS(res));
        // hide the swap UI after it is complete
        this.cancel();
      } catch (error) {
        this.swapError = error;
        this._store.log.error(`failed to perform ${direction}`, error);
      }
    }, delay);
  }

  /**
   * abort a swap that has been submitted
   */
  @action.bound
  abortSwap() {
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
      this.processingTimeout = undefined;
    }
  }
}

export default BuildSwapStore;
