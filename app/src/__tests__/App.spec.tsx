import React from 'react';
import { render } from '@testing-library/react';
import * as config from 'config';
import App from '../App';

describe('App Component', () => {
  const renderApp = () => {
    return render(<App />);
  };

  it('should render the App', async () => {
    // ensure init is called in the store so the UI is displayed
    Object.defineProperty(config, 'IS_TEST', { get: () => false });
    const { findByText } = renderApp();
    expect(await findByText('Lightning')).toBeInTheDocument();
    expect(await findByText('Terminal')).toBeInTheDocument();
    expect(await findByText('logo.svg')).toBeInTheDocument();
    // revert IS_DEV
    Object.defineProperty(config, 'IS_TEST', { get: () => true });
  });
});
