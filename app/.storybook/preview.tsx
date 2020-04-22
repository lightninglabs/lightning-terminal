import React from 'react';
import 'mobx-react-lite/batchingForReactDom';
import { addDecorator, addParameters } from '@storybook/react';
import '../src/App.scss';
import '../src/i18n';
import { createActions } from '../src/action';
import { Background } from '../src/components/common/base';
import { ThemeProvider } from '../src/components/theme';
import { Store, StoreProvider } from '../src/store';
import { sampleApiResponses } from '../src/util/sampleData';

/**
 * Create a store with dummy data to use for stories
 */
const store = new Store();

/**
 * Create dummy actions to use for stories
 */

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
const actions = createActions(store, grpc);

// execute actions to populate the store data with the sample API responses
actions.node.getBalances();

/**
 * add the mobx store to Storybook parameters so that stories can manipulate it
 */
addParameters({ store });

/**
 * decorator function to wrap all stories with the necessary providers
 */
addDecorator((storyFn, ctx) => (
  <StoreProvider store={store} actions={actions}>
    <ThemeProvider>
      <Background>
        {/* wrap the component in a centered div for small components */}
        {ctx.parameters.centered ? (
          <div style={{ width: 300, margin: 'auto', paddingTop: 100 }}>{storyFn()}</div>
        ) : (
          storyFn()
        )}
      </Background>
    </ThemeProvider>
  </StoreProvider>
));
