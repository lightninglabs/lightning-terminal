import { IS_DEV } from 'config';
import debug, { Debugger } from 'debug';

export enum LogLevel {
  debug = 1,
  info = 2,
  warn = 3,
  error = 4,
  none = 5,
}

/**
 * A logger class with support for multiple namespaces and log levels.
 */
export class Logger {
  private _levelToOutput: LogLevel;
  private _logger: Debugger;

  constructor(levelToOutput: LogLevel, namespace: string) {
    this._levelToOutput = levelToOutput;
    this._logger = debug(namespace);
  }

  /**
   * creates a new Logger instance by inspecting the executing environment
   */
  static fromEnv(namespace: string): Logger {
    // by default, log everything in development and nothing in production
    let level = IS_DEV ? LogLevel.debug : LogLevel.none;

    if (localStorage.getItem('debug')) {
      // if a 'debug' key is found in localStorage, use the level in storage or 'debug' by default
      const storageLevel = localStorage.getItem('debug-level') || 'debug';
      level = LogLevel[storageLevel as keyof typeof LogLevel];
    } else if (IS_DEV) {
      // if running in development with no localStorage key, use debug
      level = LogLevel.debug;
      // set the keys so they can be easily changed in the browser DevTools
      localStorage.setItem('debug', '*');
      localStorage.setItem('debug-level', 'debug');
    }

    return new Logger(level, namespace);
  }

  /**
   * log a debug message
   */
  debug = (message: string, ...args: any[]) => this._log(LogLevel.debug, message, args);

  /**
   * log an info message
   */
  info = (message: string, ...args: any[]) => this._log(LogLevel.info, message, args);

  /**
   * log a warn message
   */
  warn = (message: string, ...args: any[]) => this._log(LogLevel.warn, message, args);

  /**
   * log an error message
   */
  error = (message: string, ...args: any[]) => this._log(LogLevel.error, message, args);

  /**
   * A shared logging function which will only output logs based on the level of this Logger instance
   * @param level the level of the message being logged
   * @param message the message to log
   * @param args optional additional arguments to log
   */
  private _log(level: LogLevel, message: string, args: any[]) {
    // don't log if the level to output is greater than the level of this message
    if (this._levelToOutput > level) return;

    // convert the provided log level number to the string name
    const prefix = Object.keys(LogLevel).reduce(
      (prev, curr) => (level === LogLevel[curr as keyof typeof LogLevel] ? curr : prev),
      '??',
    );

    this._logger(`[${prefix}] ${message}`, ...args);
  }
}

/**
 * the main logger for the app
 */
export const log = Logger.fromEnv('main');

/**
 * the logger for GRPC requests and responses
 */
export const grpcLog = Logger.fromEnv('grpc');

/**
 * the logger for state updates via mobx actions
 */
export const actionLog = Logger.fromEnv('action');
