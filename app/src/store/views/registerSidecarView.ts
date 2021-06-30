import { makeAutoObservable, toJS } from 'mobx';
import { SidecarRegisterSteps } from 'types/state';
import { Store } from 'store';

// an artificial delay to allow the user to abort a ticket registration before it executed
export const TICKET_ABORT_DELAY = 2000;

export default class RegisterSidecarView {
  private _store: Store;

  /** the current step of the wizard to display */
  currentStep = SidecarRegisterSteps.Closed;

  // the the sidecar ticket
  ticket = '';

  /** the reference to the timeout used to allow aborting */
  processingTimeout?: NodeJS.Timeout;

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  //
  // Computed properties
  //

  /** determines whether to show the wizard UI */
  get showWizard(): boolean {
    return [
      SidecarRegisterSteps.EnterTicket,
      SidecarRegisterSteps.ConfirmTicket,
      SidecarRegisterSteps.Processing,
      SidecarRegisterSteps.Complete,
    ].includes(this.currentStep);
  }

  //
  // Actions
  //

  /**
   * Show the first screen of the Sidecar Wizard
   */
  startRegister() {
    this.currentStep = SidecarRegisterSteps.EnterTicket;
  }

  /**
   * Navigate to the next step in the wizard
   */
  goToNextStep() {
    if (this.currentStep === SidecarRegisterSteps.ConfirmTicket) {
      this.registerTicket();
    }
    this.currentStep++;
    this._store.log.info(`updated registerSidecarView.currentStep`, this.currentStep);
  }

  /**
   * Navigate to the previous step in the wizard
   */
  goToPrevStep() {
    if (this.currentStep === SidecarRegisterSteps.Processing) {
      // if back is clicked on the processing step
      this.abort();
    }
    if (this.currentStep === SidecarRegisterSteps.Complete) {
      this.cancel();
      return;
    }
    this.currentStep--;
    this._store.log.info(`updated registerSidecarView.currentStep`, this.currentStep);
  }

  /**
   * hide the sidecar wizard
   */
  cancel() {
    this.currentStep = SidecarRegisterSteps.Closed;
    this.ticket = '';
    this._store.log.info(`reset registerSidecarView`, toJS(this));
  }

  /**
   * sets the value of the ticket
   */
  setTicket(ticket: string) {
    this.ticket = ticket;
  }

  /**
   * submit a request to the Pool API to perform the ticket registration
   */
  registerTicket() {
    const delay =
      process.env.NODE_ENV === 'test'
        ? 1 // use a 1 ms delay for unit tests
        : TICKET_ABORT_DELAY;

    this.processingTimeout = setTimeout(async () => {
      try {
        this._store.log.info(`registering sidecar ticket`, toJS(this.ticket));
        const res = await this._store.api.pool.registerSidecar(this.ticket);
        this.goToNextStep();
        this._store.log.info(`registered ticket successfully`, toJS(res.ticket));
      } catch (error) {
        this._store.appView.handleError(error, `Unable to register ticket`);
        this.goToPrevStep();
      }
    }, delay);
  }

  /**
   * abort a register that has been submitted
   */
  abort() {
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
      this.processingTimeout = undefined;
    }
  }
}
