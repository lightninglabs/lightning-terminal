import React from 'react';
import { addDecorator } from '@storybook/react';
import ChannelAction from '../src/action/channel';
import NodeAction from '../src/action/node';
import SwapAction from '../src/action/swap';
import { LndApi, LoopApi } from '../src/api';
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
    const response = sampleApiResponses[endpoint] || {};
    return Promise.resolve(response);
  },
};
const lndApi = new LndApi(grpc);
const loopApi = new LoopApi(grpc);

// actions exposed to UI components
const node = new NodeAction(store, lndApi);
const channel = new ChannelAction(store, lndApi);
const swap = new SwapAction(store, loopApi);

const actions = {
  node,
  channel,
  swap,
};

/**
 * decorator function to wrap all stories with the necessary providers
 */
addDecorator(storyFn => (
  <StoreProvider store={store} actions={actions}>
    <ThemeProvider>{storyFn()}</ThemeProvider>
  </StoreProvider>
));
