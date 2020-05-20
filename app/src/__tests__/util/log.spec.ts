import { debugMock } from '__mocks__/debug';
import * as config from 'config';
import { Logger, LogLevel } from 'util/log';

describe('log Util', () => {
  describe('fromEnv', () => {
    afterEach(() => {
      localStorage.removeItem('debug');
      localStorage.removeItem('debug-level');
    });

    it('should enable debug logging in dev env', () => {
      Object.defineProperty(config, 'IS_DEV', { get: () => true });

      const log = Logger.fromEnv('test');
      log.debug('sample message');
      expect(debugMock).toBeCalledWith('[debug] sample message');

      // revert IS_DEV
      Object.defineProperty(config, 'IS_DEV', { get: () => false });
    });

    it('should enable debug logging when storage key exists', () => {
      localStorage.setItem('debug', '*');
      const log = Logger.fromEnv('test');
      log.debug('sample message');
      expect(debugMock).toBeCalledWith('[debug] sample message');
    });

    it('should enable logging based on the debug-level storage key', () => {
      localStorage.setItem('debug', '*');
      localStorage.setItem('debug-level', 'warn');
      const log = Logger.fromEnv('test');
      log.debug('sample message');
      expect(debugMock).not.toBeCalledWith('[debug] sample message');
      log.info('sample message');
      expect(debugMock).not.toBeCalledWith('[info] sample message');
      log.warn('sample message');
      expect(debugMock).toBeCalledWith('[warn] sample message');
      log.error('sample message');
      expect(debugMock).toBeCalledWith('[error] sample message');
    });
  });

  describe('LogLevel debug', () => {
    const log = new Logger(LogLevel.debug, 'test');

    it('should output a debug log message', () => {
      log.debug('sample message');
      expect(debugMock).toBeCalledWith('[debug] sample message');
    });

    it('should output a info log message', () => {
      log.info('sample message');
      expect(debugMock).toBeCalledWith('[info] sample message');
    });

    it('should output a warn log message', () => {
      log.warn('sample message');
      expect(debugMock).toBeCalledWith('[warn] sample message');
    });

    it('should output a error log message', () => {
      log.error('sample message');
      expect(debugMock).toBeCalledWith('[error] sample message');
    });
  });

  describe('LogLevel info', () => {
    const log = new Logger(LogLevel.info, 'test');

    it('should not output a debug log message', () => {
      log.debug('sample message');
      expect(debugMock).not.toBeCalledWith('[debug] sample message');
    });

    it('should output a info log message', () => {
      log.info('sample message');
      expect(debugMock).toBeCalledWith('[info] sample message');
    });

    it('should output a warn log message', () => {
      log.warn('sample message');
      expect(debugMock).toBeCalledWith('[warn] sample message');
    });

    it('should output a error log message', () => {
      log.error('sample message');
      expect(debugMock).toBeCalledWith('[error] sample message');
    });
  });

  describe('LogLevel warn', () => {
    const log = new Logger(LogLevel.warn, 'test');

    it('should not output a debug log message', () => {
      log.debug('sample message');
      expect(debugMock).not.toBeCalledWith('[debug] sample message');
    });

    it('should not output a info log message', () => {
      log.info('sample message');
      expect(debugMock).not.toBeCalledWith('[info] sample message');
    });

    it('should output a warn log message', () => {
      log.warn('sample message');
      expect(debugMock).toBeCalledWith('[warn] sample message');
    });

    it('should output a error log message', () => {
      log.error('sample message');
      expect(debugMock).toBeCalledWith('[error] sample message');
    });
  });

  describe('LogLevel error', () => {
    const log = new Logger(LogLevel.error, 'test');

    it('should not output a debug log message', () => {
      log.debug('sample message');
      expect(debugMock).not.toBeCalledWith('[debug] sample message');
    });

    it('should not output a info log message', () => {
      log.info('sample message');
      expect(debugMock).not.toBeCalledWith('[info] sample message');
    });

    it('should not output a warn log message', () => {
      log.warn('sample message');
      expect(debugMock).not.toBeCalledWith('[warn] sample message');
    });

    it('should output a error log message', () => {
      log.error('sample message');
      expect(debugMock).toBeCalledWith('[error] sample message');
    });
  });
});
