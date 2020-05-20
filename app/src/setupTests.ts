// https://github.com/mobxjs/mobx-react-lite/#observer-batching
import 'mobx-react-lite/batchingForReactDom';
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
// enable i18n translations in unit tests
import './i18n';
// adds support for lottie-web animations in unit test env
import 'jest-canvas-mock';

// don't use the real localStorage in unit tests
jest.mock('util/appStorage');

beforeEach(() => {
  jest.clearAllMocks();
});
