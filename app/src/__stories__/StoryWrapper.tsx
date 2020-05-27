import React, { CSSProperties, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { BalanceMode, Unit } from 'util/constants';
import { sampleApiResponses } from 'util/tests/sampleData';
import { createStore, StoreProvider } from 'store';
import { PersistentSettings } from 'store/stores/settingsStore';
import { Background } from 'components/base';
import { ThemeProvider } from 'components/theme';

// mock the GRPC client to return sample data instead of making an actual request
const grpc = {
  request: (methodDescriptor: any) => {
    const endpoint = `${methodDescriptor.service.serviceName}.${methodDescriptor.methodName}`;
    const data = sampleApiResponses[endpoint] || {};
    // the calling function expects the return value to have a `toObject` function
    const response: any = { toObject: () => data };
    return Promise.resolve(response);
  },
};

// fake the AppStorage dependency so that settings aren't shared across stories
class StoryAppStorage {
  set = () => undefined;
  get = (): PersistentSettings => ({
    sidebarVisible: true,
    unit: Unit.sats,
    balanceMode: BalanceMode.receive,
  });
}

// Create a store that pulls data from the mock GRPC and doesn't use
// the real localStorage to save settings
const createStoryStore = () => createStore(grpc, new StoryAppStorage());

/**
 * This component is used to wrap every story. It provides the app theme
 * and store via React context. This component is referenced by the Storybook
 * decorator configured in /.storybook/preview.tsx
 */
const StoryWrapper: React.FC<{
  centered?: boolean;
  contained?: boolean;
}> = ({ centered, contained, children }) => {
  let style: CSSProperties = {};
  if (centered) {
    // wrap the component in a centered div for small components
    style = { width: 300, margin: 'auto', padding: '100px 0' };
  } else if (contained) {
    // or wrap in a full width container for larger components
    style = { width: '98%', maxWidth: '1440px', margin: 'auto', overflow: 'hidden' };
  }

  // Create store and actions which live for the lifetime of the story
  const store = useMemo(createStoryStore, [createStoryStore]);

  return (
    <StoreProvider store={store}>
      <ThemeProvider>
        {/* modify the bg styles so it isn't too big in docs mode */}
        <Background style={{ minHeight: 'inherit', height: '100%' }}>
          {/* render the Story after the store has been initialized */}
          {store.initialized ? <div style={style}>{children}</div> : null}
        </Background>
      </ThemeProvider>
    </StoreProvider>
  );
};

export default observer(StoryWrapper);
