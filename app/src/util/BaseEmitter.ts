import { Emitter, EventKey, EventMap, EventReceiver } from 'types/emitter';
import { EventEmitter } from 'events';

/**
 * A shared base class containing logic for storing the API credentials
 */
export default class BaseEmitter<T extends EventMap> implements Emitter<T> {
  /** an internal event emitter used to track event subscriptions  */
  private _emitter = new EventEmitter();

  /**
   * Subscribe to have a handler function called when an event is emitted
   * @param eventName the name of the event
   * @param handler the function to call when the event is emitted
   */
  on<K extends EventKey<T>>(eventName: K, handler: EventReceiver<T[K]>) {
    this._emitter.on(eventName, handler);
  }

  /**
   * Unsubscribes the handler for the provided event
   * @param eventName the name of the event
   * @param handler the function that was used to subscribe to the event
   */
  off<K extends EventKey<T>>(eventName: K, handler: EventReceiver<T[K]>) {
    this._emitter.off(eventName, handler);
  }

  /**
   * Call all of the subscribed handlers for an event with the supplied argument
   * @param eventName the name of the event
   * @param params the argument to pass to the handlers that are subscribed
   * to this event
   */
  emit<K extends EventKey<T>>(eventName: K, params: T[K]) {
    this._emitter.emit(eventName, params);
  }
}
