import { action, computed, observable } from 'mobx';
import { Channel, SwapDirection } from 'types/state';
import { Store } from 'store';

/**
 * The store to manage the state of a Loop swap being created
 */
class BuildSwapStore {
  _rootStore: Store;

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

  /** the fee to perform the swap */
  @observable fee = 0;

  constructor(rootStore: Store) {
    this._rootStore = rootStore;
  }

  @computed
  get listEditable(): boolean {
    return this.showActions || this.showWizard;
  }

  @action.bound
  toggleShowActions() {
    this.showActions = !this.showActions;
  }

  @action.bound
  setDirection(direction: SwapDirection) {
    this.direction = direction;
    this.showActions = false;
    this.showWizard = true;
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
      this.currentStep--;
    }
  }

  @action.bound
  cancel() {
    this.showActions = false;
    this.showWizard = false;
    this.channels = [];
    this.fee = 0;
    this.currentStep = 1;
  }
}

export default BuildSwapStore;
