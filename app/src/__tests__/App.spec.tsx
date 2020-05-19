import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  const renderApp = () => {
    return render(<App />);
  };

  it('should render the App', () => {
    const { getByText } = renderApp();
    const linkElement = getByText('Node Status');
    expect(linkElement).toBeInTheDocument();
  });
});
