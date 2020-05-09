import React, { CSSProperties } from 'react';
import { sampleApiResponses } from 'util/tests/sampleData';
import { createActions } from 'action';
import { createStore, StoreProvider } from 'store';
import { Background } from 'components/common/base';
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

// Create a store that pulls data from the mock GRPC for stories
const store = createStore(grpc);
// Create dummy actions to use for stories
const actions = createActions(store, grpc);

// execute actions to initialize the store data with the sample API responses
actions.node.getBalances();
actions.swap.listSwaps();
actions.swap.getTerms();

//
// Component
//
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
  // const { store, actions } = useStorybookStore();
  return (
    <StoreProvider store={store} actions={actions}>
      <ThemeProvider>
        {/* modify the bg styles so it isn't too big in docs mode */}
        <Background style={{ minHeight: 'inherit', height: '100%' }}>
          <div style={style}>{children}</div>
        </Background>
      </ThemeProvider>
    </StoreProvider>
  );
};

export default StoryWrapper;
