/**
 * Suppresses console errors when executing some code.
 * For example: when testing that an error is thrown during a component's
 * rendering, React will log an error message. We can safely ignore these
 * @param func the code to run
 */
export const suppressConsoleErrors = async (func: () => any | Promise<any>) => {
  const oldConsoleErr = console.error;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.error = () => {};
  const result = func();
  if (result && typeof result.then === 'function') {
    await result;
  }
  console.error = oldConsoleErr;
};

export { default as renderWithProviders } from './renderWithProviders';
export * from './grpcHelpers';
