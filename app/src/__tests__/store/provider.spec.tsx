import React from 'react';
import { render } from '@testing-library/react';
import { suppressConsoleErrors } from 'util/tests';
import { createStore, Store, StoreProvider, useStore } from 'store';

describe('StoreProvider', () => {
  let store: Store;

  beforeEach(() => {
    store = createStore();
  });

  it('should provide the store via useStore', async () => {
    let cmpStore: Store | undefined = undefined;
    const Child = () => {
      cmpStore = useStore();
      return <div>useStore Test</div>;
    };
    render(
      <StoreProvider store={store}>
        <Child />
      </StoreProvider>,
    );
    expect(cmpStore).toBe(store);
  });

  it('should throw an error when using useStore with no provider', async () => {
    await suppressConsoleErrors(() => {
      const Child = () => {
        useStore();
        return <div>useStore Test</div>;
      };
      expect(() => render(<Child />)).toThrowError(
        'useStore must be used within a StoreProvider.',
      );
    });
  });
});
