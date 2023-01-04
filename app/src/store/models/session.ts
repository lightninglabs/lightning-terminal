import { makeAutoObservable } from 'mobx';
import * as LIT from 'types/generated/lit-sessions_pb';
import { SortParams } from 'types/state';
import { Buffer } from 'buffer';
import { LNC_APP_BASE_URL } from 'config';
import formatDate from 'date-fns/format';
import { MAX_DATE } from 'util/constants';
import { hex } from 'util/strings';
import { Store } from 'store/store';

export type SessionType = LIT.SessionTypeMap[keyof LIT.SessionTypeMap];
export type SessionState = LIT.SessionStateMap[keyof LIT.SessionStateMap];

export default class Session {
  private _store: Store;
  // native values from the LIT api
  label = '';
  state = 0;
  type = 0;
  expiry = new Date();
  mailboxServerAddr = '';
  devServer = false;
  pairingSecretMnemonic = '';
  localPublicKey = '';
  remotePublicKey = '';

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  /**
   * The numeric session `state` as a user friendly string
   */
  get stateLabel() {
    switch (this.state) {
      case LIT.SessionState.STATE_CREATED:
        return 'Created';
      case LIT.SessionState.STATE_IN_USE:
        return 'In Use';
      case LIT.SessionState.STATE_REVOKED:
        return 'Revoked';
      case LIT.SessionState.STATE_EXPIRED:
        return 'Expired';
    }

    return 'Unknown';
  }

  /**
   * The numeric session `type` as a user friendly string
   */
  get typeLabel() {
    switch (this.type) {
      case LIT.SessionType.TYPE_MACAROON_READONLY:
        return 'Read-Only';
      case LIT.SessionType.TYPE_MACAROON_ADMIN:
        return 'Admin';
      case LIT.SessionType.TYPE_MACAROON_CUSTOM:
        return 'Custom';
      case LIT.SessionType.TYPE_MACAROON_ACCOUNT:
        return 'Custodial';
      case LIT.SessionType.TYPE_UI_PASSWORD:
        return 'LiT UI Password';
    }

    return 'Unknown';
  }

  /** The date this session will expire as formatted string */
  get expiryLabel() {
    // consider any expiry past the year 9000 to be never. This
    // factors in expiry values set in different time zones
    const minDate = new Date(MAX_DATE.getFullYear() - 999, 0, 1);
    return this.expiry.getTime() > minDate.getTime()
      ? 'Never'
      : formatDate(this.expiry, 'MMM d, yyyy h:mm a');
  }

  /** True if the session is not revoked or expired */
  get isActive() {
    return (
      this.state === LIT.SessionState.STATE_CREATED ||
      this.state === LIT.SessionState.STATE_IN_USE
    );
  }

  /** True if the session has had a client connect to it */
  get isPaired() {
    return this.remotePublicKey !== '';
  }

  /** The paired status as a string */
  get pairedLabel() {
    return this.isPaired ? 'In Use' : 'Created';
  }

  /** The HEX encoded pairing secret mnemonic and mailbox server address */
  get encodedPairingData() {
    const data = `${this.pairingSecretMnemonic}||${this.mailboxServerAddr}||${this.typeLabel}`;
    return Buffer.from(data, 'ascii').toString('base64');
  }

  /** The URL to use to pre-fill the pairing phrase in Terminal on the web */
  get terminalConnectUrl() {
    return `${LNC_APP_BASE_URL}#/connect/pair/${this.encodedPairingData}`;
  }

  /**
   * Updates this session model using data provided from the LIT GRPC api
   */
  update(litSession: LIT.Session.AsObject) {
    this.label = litSession.label;
    this.state = litSession.sessionState;
    this.type = litSession.sessionType;
    this.expiry = new Date(parseInt(litSession.expiryTimestampSeconds, 10) * 1000);
    this.mailboxServerAddr = litSession.mailboxServerAddr;
    this.devServer = litSession.devServer;
    this.pairingSecretMnemonic = litSession.pairingSecretMnemonic;
    this.localPublicKey = hex(litSession.localPublicKey);
    this.remotePublicKey = hex(litSession.remotePublicKey);
  }

  /**
   * Compares a specific field of two sessions for sorting
   * @param a the first order to compare
   * @param b the second order to compare
   * @param field the field and direction to sort the two orders by
   * @returns a positive number if `a`'s field is greater than `b`'s,
   * a negative number if `a`'s field is less than `b`'s, or zero otherwise
   */
  static compare(a: Session, b: Session, field: SortParams<Session>['field']): number {
    switch (field) {
      case 'label':
        return a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1;
      case 'stateLabel':
        return a.stateLabel.toLowerCase() > b.stateLabel.toLowerCase() ? 1 : -1;
      case 'typeLabel':
        return a.typeLabel.toLowerCase() > b.typeLabel.toLowerCase() ? 1 : -1;
      case 'expiry':
      default:
        return a.expiry.getTime() - b.expiry.getTime();
    }
  }
}
