import React, { useContext } from 'react';
import { useLocalStore } from 'mobx-react-lite';
import { createActions, StoreActions } from 'action';
import { Store } from 'store';

interface ContextData {
  store: Store;
  actions: StoreActions;
}

/**
 * The react context used to cache the store instance
 */
const StoreContext = React.createContext<ContextData | undefined>(undefined);

/**
 * A Context Provider component which should wrap any components that need to
 * receive a store via the `useStore` hook
 * @param store the store instance to provide to child components
 */
export const StoreProvider: React.FC<{ store: Store }> = ({ children, store }) => {
  const context: ContextData = {
    store: useLocalStore(() => store),
    actions: createActions(store),
  };
  return <StoreContext.Provider value={context}>{children}</StoreContext.Provider>;
};

/**
 * A React hook used to access the global store from child components that may be
 * nested many levels deep in the component tree
 */
export const useStore = (): Store => {
  const data = useContext(StoreContext);
  if (!data) {
    // raise an error if the context data has not been provided in a higher level component
    throw new Error('useStore must be used within a StoreProvider.');
  }
  return data.store;
};

/**
 * A React hook used to access the global actions from child components that may be
 * nested many levels deep in the component tree
 */
export const useActions = (): StoreActions => {
  const data = useContext(StoreContext);
  if (!data) {
    // raise an error if the context data has not been provided in a higher level component
    throw new Error('useActions must be used within a StoreProvider.');
  }
  return data.actions;
};
