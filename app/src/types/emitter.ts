export type EventMap = Record<string, any>;
export type EventKey<T extends EventMap> = string & keyof T;
export type EventReceiver<T> = (params: T) => void;

/** Generic interface to represent a type-safe pubsub Emitter object */
export interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, handler: EventReceiver<T[K]>): void;
  off<K extends EventKey<T>>(eventName: K, handler: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}
