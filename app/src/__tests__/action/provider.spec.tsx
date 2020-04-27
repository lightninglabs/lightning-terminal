import React from 'react';
import { render } from '@testing-library/react';
import { suppressConsoleErrors } from 'util/tests';
import { createActions, StoreActions } from 'action';
import { Store, StoreProvider, useActions, useStore } from 'store';

describe('StoreProvider', () => {
  let store: Store;
  let actions: StoreActions;

  beforeEach(() => {
    store = new Store();
    actions = createActions(store);
  });

  it('should provide the store via useStore', async () => {
    let cmpStore: Store | undefined = undefined;
    const Child = () => {
      cmpStore = useStore();
      return <div>useStore Test</div>;
    };
    render(
      <StoreProvider store={store} actions={actions}>
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

  it('should provide the actions via useActions', async () => {
    let cmpActions: StoreActions | undefined = undefined;
    const Child = () => {
      cmpActions = useActions();
      return <div>useActions Test</div>;
    };
    render(
      <StoreProvider store={store} actions={actions}>
        <Child />
      </StoreProvider>,
    );
    expect(cmpActions).toBe(actions);
  });

  it('should throw an error when using useActions with no provider', async () => {
    await suppressConsoleErrors(() => {
      const Child = () => {
        useActions();
        return <div>useActions Test</div>;
      };
      expect(() => render(<Child />)).toThrowError(
        'useActions must be used within a StoreProvider.',
      );
    });
  });
});
