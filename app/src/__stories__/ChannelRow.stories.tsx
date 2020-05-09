import React from 'react';
import { action } from '@storybook/addon-actions';
import { lndListChannels } from 'util/tests/sampleData';
import { Channel } from 'store/models';
import ChannelRow, { ChannelRowHeader } from 'components/loop/ChannelRow';

export default {
  title: 'Components/Channel Row',
  component: ChannelRow,
  parameters: { contained: true },
};

const render = (
  channel: Channel,
  options?: {
    ratio?: number;
    editable?: boolean;
    checked?: boolean;
    disabled?: boolean;
    dimmed?: boolean;
  },
) => {
  // const channel = new Channel(lndListChannels.channelsList[0]);
  if (options && options.ratio) {
    channel.localBalance = channel.capacity * options.ratio;
    channel.remoteBalance = channel.capacity * (1 - options.ratio);
  }
  return (
    <div style={{ paddingTop: 50 }}>
      <ChannelRowHeader />
      <ChannelRow
        channel={channel}
        editable={(options && options.editable) || false}
        checked={(options && options.checked) || false}
        disabled={(options && options.disabled) || false}
        dimmed={(options && options.dimmed) || false}
        onChange={() => action('onChange')}
      />
    </div>
  );
};

export const Good = () => {
  const channel = new Channel(lndListChannels.channelsList[0]);
  return render(channel, { ratio: 0.59 });
};

export const Warn = () => {
  const channel = new Channel(lndListChannels.channelsList[1]);
  return render(channel, { ratio: 0.28 });
};

export const Bad = () => {
  const channel = new Channel(lndListChannels.channelsList[2]);
  return render(channel, { ratio: 0.91 });
};

export const Inactive = () => {
  const channel = new Channel(lndListChannels.channelsList[3]);
  channel.active = false;
  return render(channel);
};

export const Editable = () => {
  return render(new Channel(lndListChannels.channelsList[4]), { editable: true });
};

export const Selected = () => {
  return render(new Channel(lndListChannels.channelsList[5]), {
    editable: true,
    checked: true,
  });
};

export const Disabled = () => {
  return render(new Channel(lndListChannels.channelsList[6]), {
    editable: true,
    checked: true,
    disabled: true,
  });
};

export const Dimmed = () => {
  return render(new Channel(lndListChannels.channelsList[7]), {
    editable: true,
    disabled: true,
    dimmed: true,
  });
};
