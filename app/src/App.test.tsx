import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

it('renders the App', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText('Node Info');
  expect(linkElement).toBeInTheDocument();
});
