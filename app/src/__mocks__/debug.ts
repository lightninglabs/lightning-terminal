// export this mock function so the executions can be checked in tests
export const debugMock = jest.fn();

const debug = jest.fn(() => {
  // return the exported mock above each time `debug()` is called
  return debugMock;
});

export default debug;
