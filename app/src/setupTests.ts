// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
// enable i18n translations in unit tests
import './i18n';
// adds support for lottie-web animations in unit test env
import 'jest-canvas-mock';

// mock localStorage & sessionStorage in unit tests
jest.spyOn(window.localStorage.__proto__, 'setItem');
jest.spyOn(window.localStorage.__proto__, 'getItem');
jest.spyOn(window.sessionStorage.__proto__, 'setItem');
jest.spyOn(window.sessionStorage.__proto__, 'getItem');

beforeEach(() => {
  jest.clearAllMocks();
});
