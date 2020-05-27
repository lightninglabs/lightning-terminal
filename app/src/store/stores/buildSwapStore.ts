import { action, computed, observable, runInAction, toJS, values } from 'mobx';
import { BuildSwapSteps, Quote, SwapDirection, SwapTerms } from 'types/state';
import { formatSats } from 'util/formatters';
import { Store } from 'store';
import Channel from 'store/models/channel';

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
    const amount = formatSats(this.fee, { unit: this._store.settingsStore.unit });
    return `${amount} (${feesPct}%)`;
  }

  /** the invoice total including the swap amount and fee */
  @computed
  get invoiceTotal() {
    return this.amount + this.fee;
  }

  /** infer a swap direction based on the selected channels */
  @computed
  get inferredDirection(): SwapDirection | undefined {
    if (this.selectedChanIds.length === 0) return undefined;

    // calculate the average local balance percent
    const percents = values(this._store.channelStore.channels)
      .filter(c => this.selectedChanIds.includes(c.chanId))
      .map(c => c.localPercent);
    const sum = percents.reduce((s, p) => s + p, 0);
    const avgPct = sum / percents.length;

    // if the average is low, suggest Loop In. Otherwise, suggest Loop Out
    return avgPct < 50 ? SwapDirection.IN : SwapDirection.OUT;
  }

  /**
   * determines if Loop In is allowed, which is only true when the selected
   * channels are using a single peer. If multiple peers are chosen, then
   * Loop in should not be allowed
   */
  @computed
  get loopInAllowed() {
    if (this.selectedChanIds.length > 0) {
      return this.loopInLastHop !== undefined;
    }

    return true;
  }

  /**
   * Returns the unique peer pubkey of the selected channels. If no channels
   * are selected OR the selected channels are using more than one peer, then
   * undefined is returned
   */
  @computed
  get loopInLastHop(): string | undefined {
    const channels = this.selectedChanIds
      .map(id => this._store.channelStore.channels.get(id))
      .filter(c => !!c) as Channel[];
    const peers = channels.reduce((peers, c) => {
      if (!peers.includes(c.remotePubkey)) {
        peers.push(c.remotePubkey);
      }
      return peers;
    }, [] as string[]);
    return peers.length === 1 ? peers[0] : undefined;
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
    try {
      const inTerms = await this._store.api.loop.getLoopInTerms();
      const outTerms = await this._store.api.loop.getLoopOutTerms();
      runInAction('getTermsContinuation', () => {
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
    } catch (error) {
      runInAction('getTermsError', () => {
        this._store.uiStore.notify(error.message, 'Unable to fetch Loop Terms');
      });
    }
  }

  /**
   * get a loop quote from the Loop RPC
   */
  @action.bound
  async getQuote(): Promise<void> {
    const { amount, direction } = this;
    this._store.log.info(`fetching ${direction} quote for ${amount} sats`);

    try {
      const quote =
        direction === SwapDirection.IN
          ? await this._store.api.loop.getLoopInQuote(amount)
          : await this._store.api.loop.getLoopOutQuote(amount);

      runInAction('getQuoteContinuation', () => {
        this.quote = {
          swapFee: quote.swapFee,
          minerFee: quote.minerFee,
          prepayAmount: quote.prepayAmt,
        };
        this._store.log.info('updated buildSwapStore.quote', toJS(this.quote));
      });
    } catch (error) {
      runInAction('getQuoteError', () => {
        this._store.uiStore.notify(error.message, 'Unable to fetch Quote');
      });
    }
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
        const chanIds = this.selectedChanIds.map(v => parseInt(v));
        const res =
          direction === SwapDirection.IN
            ? await this._store.api.loop.loopIn(amount, quote, this.loopInLastHop)
            : await this._store.api.loop.loopOut(amount, quote, chanIds);
        this._store.log.info('completed loop', toJS(res));
        runInAction('requestSwapContinuation', () => {
          // hide the swap UI after it is complete
          this.cancel();
          this._store.uiStore.toggleProcessingSwaps();
          this._store.swapStore.fetchSwaps();
        });
      } catch (error) {
        runInAction('requestSwapError', () => {
          this._store.uiStore.notify(error.message, `Unable to Perform ${direction}`);
          this.goToPrevStep();
        });
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
