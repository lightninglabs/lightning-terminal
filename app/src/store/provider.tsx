import React, { useContext } from 'react';
import { Store } from 'store';

/**
 * The react context used to cache the store instance
 */
const StoreContext = React.createContext<Store | undefined>(undefined);

/**
 * A Context Provider component which should wrap any components that need to
 * receive a store via the `useStore` hook
 * @param store the store instance to provide to child components via `useStore`
 * @param actions the actions to provide to child components via `useActions`. If
 * this parameter is not supplied, then the actions will be created using the store
 * provided
 */
export const StoreProvider: React.FC<{
  store: Store;
}> = ({ children, store }) => {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

/**
 * A React hook used to access the global store from child components that may be
 * nested many levels deep in the component tree
 */
export const useStore = (): Store => {
  const store = useContext(StoreContext);
  if (!store) {
    // raise an error if the context data has not been provided in a higher level component
    throw new Error('useStore must be used within a StoreProvider.');
  }
  return store;
};
