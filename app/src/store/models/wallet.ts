import { makeAutoObservable } from 'mobx';
import Big from 'big.js';

export default class Wallet {
  channelBalance: Big = Big(0);
  walletBalance: Big = Big(0);
  confirmedBalance: Big = Big(0);

  constructor() {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });
  }
}
