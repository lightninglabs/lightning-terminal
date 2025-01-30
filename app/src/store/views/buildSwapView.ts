import { makeAutoObservable, runInAction, toJS, values } from 'mobx';
import { SwapResponse } from 'types/generated/loop_pb';
import { BuildSwapSteps, Quote, SwapDirection, SwapTerms } from 'types/state';
import Big from 'big.js';
import { percentage } from 'util/bigmath';
import { BalanceMode } from 'util/constants';
import { formatSats } from 'util/formatters';
import { prefixTranslation } from 'util/translate';
import { Store } from 'store';
import Channel from 'store/models/channel';

const { l } = prefixTranslation('stores.buildSwapView');

// an artificial delay to allow the user to abort a swap before it executed
export const SWAP_ABORT_DELAY = 3000;

/**
 * The store to manage the state of a Loop swap being created
 */
class BuildSwapView {
  _store: Store;

  // the increments between swap amounts that may be chosen by the user
  AMOUNT_INCREMENT = 10000;

  /** determines whether to show the swap wizard */
  currentStep = BuildSwapSteps.Closed;

  /** the chosen direction for the loop */
  direction: SwapDirection = SwapDirection.IN;

  /** the channels selected */
  selectedChanIds: string[] = [];

  /** the amount to swap */
  amount: Big = Big(0);

  /** determines whether to show the swap advanced options */
  addlOptionsVisible = false;

  /** the confirmation target of the on-chain txn used in the swap */
  confTarget?: number;

  /** the on-chain address to send funds to during a loop out swap */
  loopOutAddress?: string;

  /** the min/max amount this node is allowed to swap */
  terms: SwapTerms = {
    in: { min: Big(0), max: Big(0) },
    out: { min: Big(0), max: Big(0) },
  };

  /** the quote for the swap */
  quote: Quote = {
    swapFee: Big(0),
    prepayAmount: Big(0),
    minerFee: Big(0),
  };

  /** the reference to the timeout used to allow cancelling a swap */
  processingTimeout?: NodeJS.Timeout;

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  //
  // Computed properties
  //

  /** returns the list of all channels. filters out inactive channels when performing a swap */
  get channels() {
    const { channelStore } = this._store;
    return this.currentStep === BuildSwapSteps.Closed
      ? channelStore.sortedChannels
      : channelStore.activeChannels;
  }

  /** determines whether to show the options for Loop In or Loop Out */
  get showActions(): boolean {
    return this.currentStep === BuildSwapSteps.SelectDirection;
  }

  /** determines whether to show the swap wizard UI */
  get showWizard(): boolean {
    return [
      BuildSwapSteps.ChooseAmount,
      BuildSwapSteps.ReviewQuote,
      BuildSwapSteps.Processing,
    ].includes(this.currentStep);
  }

  /** determines if the channel list should be editable */
  get listEditable(): boolean {
    return this.currentStep !== BuildSwapSteps.Closed;
  }

  /** the min/max amounts this node is allowed to swap based on the current direction */
  get termsForDirection() {
    return this.getTermsForDirection(this.direction);
  }

  /** returns the stored amount but ensures it is between the terms min & max */
  get amountForSelected() {
    const { min, max } = this.termsForDirection;
    if (this.amount.eq(0)) {
      return min.plus(max).div(2).round(0);
    }
    if (this.amount.lt(min)) {
      return min;
    }
    if (this.amount.gt(max)) {
      return max;
    }
    return this.amount;
  }

  /** the total quoted fee to perform the current swap */
  get fee() {
    return this.quote.swapFee.plus(this.quote.minerFee);
  }

  /** a string containing the fee as an absolute value and a percentage */
  get feesLabel() {
    const feesPct = percentage(this.fee, this.amount, 2);
    const amount = formatSats(this.fee, { unit: this._store.settingsStore.unit });
    return `${amount} (${feesPct}%)`;
  }

  /** the invoice total including the swap amount and fee */
  get invoiceTotal() {
    return this.amount.plus(this.fee);
  }

  /** infer a swap direction based on the selected channels */
  get inferredDirection(): SwapDirection | undefined {
    const mode = this._store.settingsStore.balanceMode;
    switch (mode) {
      case BalanceMode.routing:
        // unable to infer a direction with no selection
        if (this.selectedChanIds.length === 0) return undefined;

        // calculate the average local balance percent
        const percents = values(this._store.channelStore.channels)
          .filter(c => this.selectedChanIds.includes(c.chanId))
          .map(c => c.localPercent);
        const sum = percents.reduce((s, p) => s + p, 0);
        const avgPct = sum / percents.length;

        // if the average is low, suggest Loop In. Otherwise, suggest Loop Out
        return avgPct < 50 ? SwapDirection.IN : SwapDirection.OUT;
      case BalanceMode.send:
        // always infer Loop In when using Sending mode
        return SwapDirection.IN;
      case BalanceMode.receive:
      default:
        // always suggest Loop Out when using Receiving mode
        return SwapDirection.OUT;
    }
  }

  /**
   * determines if the selected channels all use the same peer. also
   * return true if no channels are selected
   */
  get hasValidLoopInPeers() {
    if (this.selectedChanIds.length > 0) {
      return this.loopInLastHop !== undefined;
    }

    return true;
  }

  /**
   * determines if the balance of selected (or all) channels are
   * greater than the minimum swap allowed
   */
  get isLoopInMinimumMet() {
    const { min, max } = this.getTermsForDirection(SwapDirection.IN);
    if (!max.gte(min)) return false;

    if (this.selectedChanIds.length > 0) {
      return this.loopInLastHop !== undefined;
    }

    return true;
  }

  /**
   * determines if Loop Out is allowed. the balance of selected (or all)
   * channels must be greater than the minimum swap allowed
   */
  get isLoopOutMinimumMet() {
    const { min, max } = this.getTermsForDirection(SwapDirection.OUT);
    if (!max.gte(min)) return false;

    return true;
  }

  /**
   * Returns the unique peer pubkey of the selected channels. If no channels
   * are selected OR the selected channels are using more than one peer, then
   * undefined is returned
   */
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
  async startSwap(): Promise<void> {
    if (this._store.channelStore.activeChannels.length === 0) {
      this._store.appView.notify(l('noChannelsMsg'));
      return;
    }
    this._store.appView.tourGoToNext();
    this.currentStep = BuildSwapSteps.SelectDirection;
    await this.getTerms();
    this._store.log.info(`updated buildSwapView.currentStep`, this.currentStep);
  }

  /**
   * Set the direction, In or Out, for the pending swap
   * @param direction the direction of the swap
   */
  async setDirection(direction: SwapDirection): Promise<void> {
    this.direction = direction;
    this._store.log.info(`updated buildSwapView.direction`, direction);
    if (this.direction === SwapDirection.IN) {
      // select all channels to the selected peer for Loop In
      this.autoSelectPeerChannels();
    }
    this.goToNextStep();
  }

  /**
   * Toggles a selected channel to use for the pending swap
   * @param channels the selected channels
   */
  toggleSelectedChannel(channelId: string) {
    if (this.selectedChanIds.includes(channelId)) {
      this.selectedChanIds = this.selectedChanIds.filter(id => id !== channelId);
    } else {
      this.selectedChanIds = [...this.selectedChanIds, channelId];
    }
    this._store.log.info(
      `updated buildSwapView.selectedChanIds`,
      toJS(this.selectedChanIds),
    );
  }

  /**
   * When performing a Loop In, you can only specify the last hop of the payment,
   * so all channels with the selected peer may be used. This function will ensure
   * that all channels of the selected peer are selected
   */
  autoSelectPeerChannels() {
    // create an array of pubkeys for the selected channels
    const peers = this.channels
      .filter(c => this.selectedChanIds.includes(c.chanId))
      .map(c => c.remotePubkey)
      .filter((c, i, a) => a.indexOf(c) === i); // filter out duplicates

    // create a list of all channels with this peer
    const peerChannels = this.channels
      .filter(c => peers.includes(c.remotePubkey))
      .map(c => c.chanId);

    this.selectedChanIds = peerChannels;
    this._store.log.info(`automatically selected peer channels`, this.selectedChanIds);
  }

  /**
   * Set the amount for the swap
   * @param amount the amount in sats
   */
  setAmount(amount: Big) {
    this.amount = amount;
  }

  /**
   * toggles the advanced options section in the swap config step
   */
  toggleAddlOptions() {
    this.addlOptionsVisible = !this.addlOptionsVisible;
    this._store.log.info(
      `updated buildSwapView.addlOptionsVisible`,
      this.addlOptionsVisible,
    );
  }

  /**
   * Set the confirmation target for the swap
   */
  setConfTarget(target?: number) {
    // ensure the Loop Out target is between the CLTV min & max
    if (
      this.direction === SwapDirection.OUT &&
      this.terms.out.minCltv &&
      this.terms.out.maxCltv &&
      target !== undefined &&
      (isNaN(target) ||
        this.terms.out.minCltv > target ||
        this.terms.out.maxCltv < target)
    ) {
      throw new Error(
        `Confirmation target must be between ${this.terms.out.minCltv} and ${this.terms.out.maxCltv}.`,
      );
    }
    this.confTarget = target;
    this._store.log.info(`updated buildSwapView.confTarget`, this.confTarget);
  }

  /**
   * Set the on-chain destination address for the loop out swap
   */
  setLoopOutAddress(address: string) {
    this.loopOutAddress = address;
    this._store.log.info(`updated buildSwapView.loopOutAddress`, this.loopOutAddress);
  }

  /**
   * Navigate to the next step in the wizard
   */
  goToNextStep() {
    if (this.currentStep === BuildSwapSteps.ChooseAmount) {
      this.amount = this.amountForSelected;
      this.getQuote();
      // clear the advanced options if values were set, then hidden
      if (!this.addlOptionsVisible) {
        this.confTarget = undefined;
        this.loopOutAddress = undefined;
      }
    } else if (this.currentStep === BuildSwapSteps.ReviewQuote) {
      this.requestSwap();
    }

    this.currentStep++;
    this._store.log.info(`updated buildSwapView.currentStep`, this.currentStep);
    this._store.appView.tourGoToNext();
  }

  /**
   * Navigate to the previous step in the wizard
   */
  goToPrevStep() {
    if (this.currentStep === BuildSwapSteps.Processing) {
      // if back is clicked on the processing step
      this.abortSwap();
    }
    this.currentStep--;
    this._store.log.info(`updated buildSwapView.currentStep`, this.currentStep);
  }

  /**
   * hide the swap wizard
   */
  cancel() {
    this.currentStep = BuildSwapSteps.Closed;
    this.selectedChanIds = [];
    this.amount = Big(0);
    this.addlOptionsVisible = false;
    this.confTarget = undefined;
    this.loopOutAddress = undefined;
    this.quote.swapFee = Big(0);
    this.quote.minerFee = Big(0);
    this.quote.prepayAmount = Big(0);
    this._store.log.info(`reset buildSwapView`, toJS(this));
  }

  /**
   * fetch the terms, minimum/maximum swap amount allowed, from the Loop API
   */
  async getTerms(): Promise<void> {
    this._store.log.info(`fetching loop terms`);
    try {
      const inTerms = await this._store.api.loop.getLoopInTerms();
      const outTerms = await this._store.api.loop.getLoopOutTerms();
      runInAction(() => {
        this.terms = {
          in: {
            min: Big(inTerms.minSwapAmount),
            max: Big(inTerms.maxSwapAmount),
          },
          out: {
            min: Big(outTerms.minSwapAmount),
            max: Big(outTerms.maxSwapAmount),
            minCltv: outTerms.minCltvDelta,
            maxCltv: outTerms.maxCltvDelta,
          },
        };
        this._store.log.info('updated store.terms', toJS(this.terms));
      });
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to fetch Loop Terms');
      this.goToPrevStep();
    }
  }

  /**
   * get a loop quote from the Loop RPC
   */
  async getQuote(): Promise<void> {
    const { amount, direction } = this;
    this._store.log.info(`fetching ${direction} quote for ${amount} sats`);

    try {
      let quote: Quote;
      if (direction === SwapDirection.IN) {
        const inQuote = await this._store.api.loop.getLoopInQuote(
          amount,
          this.confTarget,
          this.loopInLastHop,
        );
        quote = {
          swapFee: Big(inQuote.swapFeeSat),
          minerFee: Big(inQuote.htlcPublishFeeSat),
          prepayAmount: Big(0),
        };
      } else {
        const outQuote = await this._store.api.loop.getLoopOutQuote(
          amount,
          this.confTarget,
        );
        quote = {
          swapFee: Big(outQuote.swapFeeSat),
          minerFee: Big(outQuote.htlcSweepFeeSat),
          prepayAmount: Big(outQuote.prepayAmtSat),
        };
      }

      runInAction(() => {
        this.quote = quote;
        this._store.log.info('updated buildSwapView.quote', toJS(this.quote));
      });
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to fetch Quote');
      this.goToPrevStep();
    }
  }

  /**
   * submit a request to the Loop API to perform a swap. There will be a 3 second
   * delay added to allow the swap to be aborted
   */
  requestSwap() {
    const delay =
      process.env.NODE_ENV === 'test'
        ? 1 // use a 1 ms delay for unit tests
        : this._store.appView.tourVisible
        ? 1500 // use a 1.5 second delay during the tour
        : SWAP_ABORT_DELAY;
    const { amount, direction, quote } = this;
    this._store.log.info(
      `executing ${direction} for ${amount} sats (delaying for ${delay}ms)`,
    );
    this.processingTimeout = setTimeout(async () => {
      try {
        let res: SwapResponse.AsObject;
        if (direction === SwapDirection.IN) {
          res = await this._store.api.loop.loopIn(
            amount,
            quote,
            this.loopInLastHop,
            this.confTarget,
          );
          // save the channels that were used in the swap. for Loop In all channels
          // with the same peer will be used
          this._store.swapStore.addSwappedChannels(res.id, this.selectedChanIds);
        } else {
          // on regtest, set the publication deadline to 0 for faster swaps, otherwise
          // set it to 30 minutes in the future to reduce swap fees
          const thirtyMins = 30 * 60 * 1000;
          const deadline =
            this._store.nodeStore.network === 'regtest' ? 0 : Date.now() + thirtyMins;
          // convert the selected channel ids to numbers
          res = await this._store.api.loop.loopOut(
            amount,
            quote,
            this.selectedChanIds,
            Math.round(deadline / 1000), // convert milli-secs to secs
            this.confTarget,
            this.loopOutAddress,
          );
          // save the channels that were used in the swap
          this._store.swapStore.addSwappedChannels(res.id, this.selectedChanIds);
        }
        this._store.log.info('completed loop', toJS(res));
        runInAction(() => {
          // hide the swap UI after it is complete
          this.cancel();
          this._store.appView.toggleProcessingSwaps();
          this._store.appView.tourGoToNext();
        });
      } catch (error) {
        this._store.appView.handleError(error, `Unable to Perform ${direction}`);
        this.goToPrevStep();
      }
    }, delay);
  }

  /**
   * abort a swap that has been submitted
   */
  abortSwap() {
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
      this.processingTimeout = undefined;
    }
  }

  /**
   * Returns the swap terms after adjusting the max based on channel balances
   * @param direction the swap direction
   */
  getTermsForDirection(direction: SwapDirection) {
    const selectors = {
      [SwapDirection.IN]: {
        directionTerms: { ...this.terms.in },
        balanceSelector: (channel: Channel) => channel.remoteBalance,
        totalBalance: this._store.channelStore.totalInbound,
      },
      [SwapDirection.OUT]: {
        directionTerms: { ...this.terms.out },
        balanceSelector: (channel: Channel) => channel.localBalance,
        totalBalance: this._store.channelStore.totalOutbound,
      },
    };

    const { directionTerms, balanceSelector, totalBalance } = selectors[direction];

    // set the terms based on the chosen direction
    const terms = directionTerms;

    // get the total balance of the selected or all channels
    let total = this.selectedChanIds.length
      ? this.channels
          .filter(c => this.selectedChanIds.includes(c.chanId))
          .map(balanceSelector)
          .reduce((sum, bal) => sum.plus(bal), Big(0))
      : totalBalance;

    // subtract the 1% reserve balance that cannot be spent
    total = total.mul(0.99);
    // decrease the max amount if it is lower than the server terms
    if (terms.max.gt(total)) {
      terms.max = total.div(this.AMOUNT_INCREMENT).round(0, 0).mul(this.AMOUNT_INCREMENT);
    }

    return terms;
  }
}

export default BuildSwapView;
