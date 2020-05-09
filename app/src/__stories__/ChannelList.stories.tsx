import React from 'react';
import { action } from '@storybook/addon-actions';
import { useStore } from 'store';
import ChannelList from 'components/loop/ChannelList';

export default {
  title: 'Components/Channel List',
  component: ChannelList,
  parameters: { contained: true },
};

export const NoChannels = () => {
  return (
    <ChannelList
      channels={[]}
      enableSelection={false}
      selectedChannels={[]}
      onSelectionChange={() => action('onSelectionChange')}
      disabled={false}
    />
  );
};

export const FewChannels = () => {
  const store = useStore();
  return (
    <ChannelList
      channels={store.channelStore.channels.slice(0, 10)}
      enableSelection={false}
      selectedChannels={[]}
      onSelectionChange={() => action('onSelectionChange')}
      disabled={false}
    />
  );
};

export const ManyChannels = () => {
  const store = useStore();
  return (
    <ChannelList
      channels={store.channelStore.channels}
      enableSelection={false}
      selectedChannels={[]}
      onSelectionChange={() => action('onSelectionChange')}
      disabled={false}
    />
  );
};
