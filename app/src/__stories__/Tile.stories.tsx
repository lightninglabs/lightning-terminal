import React from 'react';
import { action } from '@storybook/addon-actions';
import Tile from 'components/common/Tile';

export default {
  title: 'Components/Tile',
  component: Tile,
  parameters: { centered: true },
};

export const Empty = () => <Tile title="Empty Tile" />;

export const WithText = () => <Tile title="Tile With Text" text="Sample Text" />;

export const WithChildren = () => (
  <Tile title="Tile With Children">Sample child content</Tile>
);

export const WithArrowIcon = () => (
  <Tile title="Tile With Arrow" onMaximizeClick={() => action('ArrowIcon')}>
    Sample Text
  </Tile>
);

export const InboundLiquidity = () => (
  <Tile title="Inbound Liquidity" text="123,456,789 sats" />
);
