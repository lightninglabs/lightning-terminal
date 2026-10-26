import React from 'react';
import { renderWithProviders } from 'util/tests';
import { createStore } from 'store';
import Session from 'store/models/session';
import SessionRow from 'components/connect/SessionRow';

describe('SessionRow', () => {
  it('keeps a long expiry inside its own column', () => {
    const store = createStore();
    const session = new Session(store);
    session.label = '2022-09-16';
    session.expiry = new Date('2022-12-15T09:56:00Z');

    const { container } = renderWithProviders(<SessionRow session={session} />, store);
    const expiry = container.querySelector('.col-3.text-truncate');

    expect(expiry).toHaveTextContent('Dec 15, 2022 9:56 AM');
  });
});
