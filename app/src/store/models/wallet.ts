import { observable } from 'mobx';
import Big from 'big.js';

export default class Wallet {
  @observable channelBalance: Big = Big(0);
  @observable walletBalance: Big = Big(0);
}
