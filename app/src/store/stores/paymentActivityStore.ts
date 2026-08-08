import { makeAutoObservable, observable } from 'mobx';
import { USE_SAMPLE_DATA } from 'config';
import * as LND from 'types/generated/lnd_pb';
import { Store } from 'store/store';

export interface PaymentEvent {
  /** 'send' for outgoing, 'receive' for incoming */
  direction: 'send' | 'receive';
  /** amount in sats */
  amountSat: number;
  /** unix timestamp ms */
  timestamp: number;
}

export default class PaymentActivityStore {
  private _store: Store;
  private _simulationTimer?: ReturnType<typeof setTimeout>;

  /** queue of recent payment events for bolt animations */
  pendingEvents = observable.array<PaymentEvent>([], {
    deep: false,
  });

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });
    this._store = store;
  }

  /** called when a SubscribeInvoices update arrives */
  onInvoiceUpdate(invoice: LND.Invoice.AsObject) {
    if (invoice.state === 1) {
      const amt = parseInt(invoice.amtPaidSat, 10) || parseInt(invoice.value, 10) || 0;
      this.pendingEvents.push({
        direction: 'receive',
        amountSat: amt,
        timestamp: Date.now(),
      });
    }
  }

  /** called after a successful outgoing payment */
  onPaymentSent(amountSat: number) {
    this.pendingEvents.push({
      direction: 'send',
      amountSat,
      timestamp: Date.now(),
    });
  }

  /** consume the next pending event (returns undefined if empty) */
  dequeue(): PaymentEvent | undefined {
    if (this.pendingEvents.length === 0) return undefined;
    return this.pendingEvents.shift();
  }

  get hasPending(): boolean {
    return this.pendingEvents.length > 0;
  }

  /** generate fake payment events in sample-data dev mode */
  startSimulation() {
    if (!USE_SAMPLE_DATA) return;
    this.stopSimulation();
    const tick = () => {
      const dir = Math.random() > 0.5 ? 'send' : 'receive';
      const amt = Math.floor(Math.random() * 500000) + 1000;
      this.pendingEvents.push({
        direction: dir as 'send' | 'receive',
        amountSat: amt,
        timestamp: Date.now(),
      });
      this._simulationTimer = setTimeout(tick, 2000 + Math.random() * 6000);
    };
    this._simulationTimer = setTimeout(tick, 1000 + Math.random() * 3000);
  }

  stopSimulation() {
    if (this._simulationTimer) {
      clearTimeout(this._simulationTimer);
      this._simulationTimer = undefined;
    }
  }
}
