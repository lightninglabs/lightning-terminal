import { observable } from 'mobx';

export default class Wallet {
  @observable channelBalance = 0;
  @observable walletBalance = 0;
}
