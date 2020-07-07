import { loopListSwaps } from 'util/tests/sampleData';
import { Swap } from 'store/models';

/**
 * These test just ensure that the test runner is executing with
 * the system time zone set to UTC. This prevents tests from passing
 * on one machine and failing on another due to different time zones
 *
 * The `process.env.TZ` value is set to UTC in the jest global
 * config file setupTestsGlobal.ts
 */
describe('Timezone', () => {
  it('should always run unit tests in UTC', () => {
    expect(new Date().getTimezoneOffset()).toBe(0);
  });

  it('should format the swap timestamps correctly', () => {
    const swap = new Swap(loopListSwaps.swapsList[0]);
    expect(swap.createdOnLabel).toEqual('Apr 8, 11:59 PM');
    expect(swap.updatedOnLabel).toEqual('Apr 9, 2:12 AM');
  });
});
